package akl.p4p.uoa.services;

import akl.p4p.uoa.data.JsonSchemaDefinition;
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
    List<ProblemAttempt> attempts = problemAttemptRepository.findAllByProblemIdAndStudentEmailOrderByCreatedDateDesc(
        problemId, studentEmail);

    if (attempts.isEmpty()) {
      Problem problem = problemRepository
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
      ChatHistory history = chatHistoryRepository
          .findById(chatHistoryId)
          .orElseThrow(
              () -> new RuntimeException(
                  "Chat with id: " + chatHistoryId + " could not be found."));

      latest.setMessageList(history.getMessages());
      return latest;
    }
  }

  public ChatHistory chatWithClientWithSessionHistory(String sessionId, String userMessage) {
    return aiService.chatWithClient(
        sessionId, null, userMessage, JsonSchemaDefinition.getClientProbeSchema());
  }

  public ProblemAttempt saveProblemAttemptAndUpdateProblemsCompleted(
      ProblemAttempt problemAttempt) {
    var saved = problemAttemptRepository.save(problemAttempt);
    String submitterEmail = saved.getStudentEmail();
    personService.updateProblemsCompleted(submitterEmail, saved.getProblemId());
    return saved;
  }

  private ChatHistory initialiseClientPersona(Problem problem) throws IOException {
    String systemPrompt = ClientPrompts.getClientInitialisationPrompt(
        problem.getProgramLanguage(),
        problem.getProblemStatement(),
        problem.getModelAnswer(),
        problem.getConstraints());

    String newSessionId = UUID.randomUUID().toString();

    return aiService.chatWithClient(
        newSessionId, systemPrompt, null, JsonSchemaDefinition.getClientProbeSchema());
  }
}
