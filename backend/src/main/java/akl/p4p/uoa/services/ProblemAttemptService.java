package akl.p4p.uoa.services;

import static akl.p4p.uoa.data.JsonSchemaDefinition.getClientProbeSchema;
import static akl.p4p.uoa.prompts.ClientPrompts.getClientFirstMessage;

import akl.p4p.uoa.data.ChatContent;
import akl.p4p.uoa.models.ChatHistory;
import akl.p4p.uoa.models.Problem;
import akl.p4p.uoa.models.ProblemAttempt;
import akl.p4p.uoa.prompts.ClientPrompts;
import akl.p4p.uoa.repositories.ChatHistoryRepository;
import akl.p4p.uoa.repositories.ProblemAttemptRepository;
import akl.p4p.uoa.repositories.ProblemRepository;
import java.io.IOException;
import java.util.Date;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;

@Service
public class ProblemAttemptService {
  private final AIService aiService;

  private final ProblemRepository problemRepository;

  private final ProblemAttemptRepository problemAttemptRepository;

  private final ChatHistoryRepository chatHistoryRepository;

  private final PersonService personService;

  ProblemAttemptService(
      ProblemAttemptRepository problemAttemptRepository,
      ProblemRepository problemRepository,
      ChatHistoryRepository chatHistoryRepository,
      AIService aiService,
      PersonService personService) {
    this.problemAttemptRepository = problemAttemptRepository;
    this.problemRepository = problemRepository;
    this.chatHistoryRepository = chatHistoryRepository;
    this.aiService = aiService;
    this.personService = personService;
  }

  public ProblemAttempt retrieveLatestOrCreateProblemAttempt(String problemId, String studentEmail)
      throws IOException {
    List<ProblemAttempt> attempts =
        problemAttemptRepository.findAllByProblemIdAndStudentEmailOrderByCreatedDateDesc(
            problemId, studentEmail);

    if (attempts.isEmpty()) {
      Problem problem =
          problemRepository
              .findById(problemId)
              .orElseThrow(() -> new RuntimeException("Problem not " + "found: " + problemId));

      var attempt = new ProblemAttempt();
      attempt.setProblemId(problem.getId());
      attempt.setProblemLanguage(problem.getProgramLanguage());
      attempt.setStudentEmail(studentEmail);
      attempt.setCreatedDate(new Date());

      ChatHistory chatHistory = initialiseClientPersona(problem);

      attempt.setChatHistoryId(chatHistory.getSessionId());
      attempt = problemAttemptRepository.save(attempt);
      attempt.setMessageList(chatHistory.getMessages());

      // Return attempt that contains transient field (messages)
      return attempt;
    } else { // For now: Always return latest problem attempt.
      ProblemAttempt latest = attempts.get(0);
      String chatHistoryId = latest.getChatHistoryId();
      ChatHistory history =
          chatHistoryRepository
              .findById(chatHistoryId)
              .orElseThrow(
                  () ->
                      new RuntimeException(
                          "Chat with id: " + chatHistoryId + " could not be found."));

      latest.setMessageList(history.getMessages());
      return latest;
    }
  }

  public ChatHistory chatWithClientWithSessionHistory(String sessionId, ChatContent userMessage)
      throws IOException {
    return aiService.chatWithClient(sessionId, userMessage, getClientProbeSchema());
  }

  public ProblemAttempt saveProblemAttemptAndUpdateProblemsCompleted(
      ProblemAttempt curProblemAttempt) {
    var prevAttempt = findOrCreateNewProblemAttempt(curProblemAttempt);
    var problem = findProblemById(prevAttempt);

    calculateFinalScore(curProblemAttempt);
    compareFinalScoreWithExistingAttempt(curProblemAttempt, prevAttempt);
    updateTestsPassedIfHigher(curProblemAttempt, prevAttempt);
    updateFailedAttemptsIfNotFullMarks(curProblemAttempt, prevAttempt, problem);
    updateProblemsCompleted(curProblemAttempt, problem);

    if (isFullMarks(prevAttempt, problem)) {
      alwaysTakeFullMarkSubmissionAttributes(curProblemAttempt, prevAttempt);
    }

    return problemAttemptRepository.save(curProblemAttempt);
  }

  public ProblemAttempt findOrCreateNewProblemAttempt(ProblemAttempt problemAttempt) {
    try {
      return findProblemAttemptById(problemAttempt.getId());
    } catch (RuntimeException e) {
      problemAttempt.setId(UUID.randomUUID().toString());
      problemAttempt.setCreatedDate(new Date());
      return problemAttemptRepository.save(problemAttempt);
    }
  }

  public ChatHistory overwriteAssistantMessage(String sessionId, String replacementAssistantText) {
    return aiService.overwriteLastAssistantMessage(sessionId, replacementAssistantText, true);
  }

  public ProblemAttempt findProblemAttemptById(String problemAttemptId) {
    return problemAttemptRepository
        .findById(problemAttemptId)
        .orElseThrow(
            () ->
                new RuntimeException(
                    "Problem " + "Attempt with id: " + problemAttemptId + " does not exist!"));
  }

  public ProblemAttempt saveProblemAttempt(ProblemAttempt attempt) {
    return problemAttemptRepository.save(attempt);
  }

  private ChatHistory initialiseClientPersona(Problem problem) throws IOException {

    var problemStatement = problem.getProblemStatement();
    var modelAnswer = problem.getModelAnswer();

    String systemPrompt =
        ClientPrompts.getClientInitialisationPrompt(
            problem.getProgramLanguage(), problemStatement, modelAnswer, problem.getConstraints());

    String newSessionId = UUID.randomUUID().toString();
    aiService.createNewChat(newSessionId, systemPrompt);

    return overwriteAssistantMessage(
        newSessionId, getClientFirstMessage(problemStatement, modelAnswer));
  }

  private void calculateFinalScore(ProblemAttempt attempt) {
    double score = calculateCurrentScore(attempt);
    double failures = attempt.getFailedAttempts();
    double finalScore = Math.max(0, score - failures);
    attempt.setFinalScore(finalScore);
  }

  private void markProblemAsCompleted(ProblemAttempt attempt) {
    attempt.setCompleted(true);
  }

  public double calculateCurrentScore(ProblemAttempt attempt) {
    var numTestsPassed = attempt.getTestsPassed();
    var problem = findProblemById(attempt);
    var numTests = problem.getTestSuite().size();

    return ((double) numTestsPassed / numTests) * 100.0;
  }

  private void compareFinalScoreWithExistingAttempt(
      ProblemAttempt curAttempt, ProblemAttempt prevAttempt) {
    if (curAttempt.getFinalScore() < prevAttempt.getFinalScore()) {
      curAttempt.setFinalScore(prevAttempt.getFinalScore());
    }
  }

  private boolean hasPassedAllTests(ProblemAttempt attempt, Problem problem) {
    return attempt.getTestsPassed() == problem.getTestSuite().size();
  }

  private Problem findProblemById(ProblemAttempt attempt) {
    var problemOptional = problemRepository.findById(attempt.getProblemId());
    return problemOptional.orElseThrow(
        () -> new RuntimeException("Problem with id: " + attempt.getProblemId() + " not found."));
  }

  private void updateProblemsCompleted(ProblemAttempt problemAttempt, Problem problem) {
    if (hasPassedAllTests(problemAttempt, problem) && !problemAttempt.isCompleted()) {
      markProblemAsCompleted(problemAttempt);
      personService.updateProblemsCompleted(
          problemAttempt.getStudentEmail(), problemAttempt.getProblemId());
    }
  }

  private void updateTestsPassedIfHigher(ProblemAttempt curAttempt, ProblemAttempt prevAttempt) {
    if (curAttempt.getTestsPassed() < prevAttempt.getTestsPassed()) {
      curAttempt.setTestsPassed(prevAttempt.getTestsPassed());
    }
  }

  private boolean isFullMarks(ProblemAttempt prevAttempt, Problem problem) {
    int totalNumberOfTests =
        problem.getTestSuite().size(); // Test suite is usually < 10 cases so O(1)
    int currentTestsPassed = prevAttempt.getTestsPassed();
    return totalNumberOfTests == currentTestsPassed;
  }

  private void updateFailedAttemptsIfNotFullMarks(
      ProblemAttempt curAttempt, ProblemAttempt prevAttempt, Problem problem) {
    if (isFullMarks(curAttempt, problem)) {
      return;
    }
    int newFailedAttempts =
        Math.max(curAttempt.getFailedAttempts(), prevAttempt.getFailedAttempts());
    curAttempt.setFailedAttempts(newFailedAttempts);
  }

  private void alwaysTakeFullMarkSubmissionAttributes(
      ProblemAttempt curAttempt, ProblemAttempt prevAttempt) {
    curAttempt.setCodeSubmission(prevAttempt.getCodeSubmission());
    curAttempt.setOracleExecutionHistory(prevAttempt.getOracleExecutionHistory());
    curAttempt.setAgentPrompt(prevAttempt.getAgentPrompt());

    curAttempt.setTestsPassed(prevAttempt.getTestsPassed());
    curAttempt.setFailedAttempts(prevAttempt.getFailedAttempts());
    curAttempt.setFinalScore(prevAttempt.getFinalScore());

    curAttempt.setClientEquivalenceMap(prevAttempt.getClientEquivalenceMap());
    curAttempt.setOracleEquivalenceMap(prevAttempt.getOracleEquivalenceMap());
  }
}
