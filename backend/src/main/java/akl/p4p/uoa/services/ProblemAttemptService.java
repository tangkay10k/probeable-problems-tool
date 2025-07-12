package akl.p4p.uoa.services;

import akl.p4p.uoa.data.JsonSchemaDefinition;
import akl.p4p.uoa.data.Prompts;
import akl.p4p.uoa.models.ChatHistory;
import akl.p4p.uoa.models.Problem;
import akl.p4p.uoa.models.ProblemAttempt;
import akl.p4p.uoa.repositories.ChatHistoryRepository;
import akl.p4p.uoa.repositories.ProblemAttemptRepository;
import akl.p4p.uoa.repositories.ProblemRepository;
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

  ProblemAttemptService(
      ProblemAttemptRepository problemAttemptRepository,
      ProblemRepository problemRepository,
      ChatHistoryRepository chatHistoryRepository,
      AIService aiService) {
    this.problemAttemptRepository = problemAttemptRepository;
    this.problemRepository = problemRepository;
    this.chatHistoryRepository = chatHistoryRepository;
    this.aiService = aiService;
  }

  public ProblemAttempt retrieveLatestOrCreateProblemAttempt(
      String problemId, String studentEmail) {
    List<ProblemAttempt> attempts =
        problemAttemptRepository.findAllByStudentEmailOrderByCreatedDateDesc(studentEmail);

    if (attempts.isEmpty()) {
      Problem problem =
          problemRepository
              .findById(problemId)
              .orElseThrow(() -> new RuntimeException("Problem not " + "found: " + problemId));

      var attempt = new ProblemAttempt();
      attempt.setProblemId(problem.getId());
      attempt.setStudentEmail(studentEmail);
      attempt.setCreatedDate(new Date());

      ChatHistory chatHistory = initialiseClientPersona(problem);

      attempt.setChatHistoryId(chatHistory.getSessionId());
      attempt.setMessageList(chatHistory.getMessages());
      problemAttemptRepository.save(attempt);

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

  public ChatHistory chatWithClientWithSessionHistory(String chatSessionId, String userMessage) {
    return aiService.chatWithClient(
        chatSessionId, null, userMessage, JsonSchemaDefinition.getClientProbeSchema());
  }

  private ChatHistory initialiseClientPersona(Problem problem) {
    String systemPrompt =
        Prompts.getClientInitialisationPrompt(
            problem.getProblemStatement(), problem.getModelAnswer(), problem.getConstraints());

    return aiService.chatWithClient(
        UUID.randomUUID().toString(),
        systemPrompt,
        null,
        JsonSchemaDefinition.getClientProbeSchema());
  }
}
