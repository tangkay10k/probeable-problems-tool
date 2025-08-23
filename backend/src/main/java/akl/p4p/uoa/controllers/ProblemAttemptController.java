package akl.p4p.uoa.controllers;

import static akl.p4p.uoa.constants.AuthConstants.IS_AUTHENTICATED;

import akl.p4p.uoa.constants.ProblemAttemptConstants;
import akl.p4p.uoa.data.ChatMessage;
import akl.p4p.uoa.data.ChatMessage.Role;
import akl.p4p.uoa.data.EquivalenceClassRequest;
import akl.p4p.uoa.dtos.MessageDTO;
import akl.p4p.uoa.dtos.TestCaseOutputDTO;
import akl.p4p.uoa.models.ChatHistory;
import akl.p4p.uoa.models.ProblemAttempt;
import akl.p4p.uoa.services.ProblemAttemptService;
import akl.p4p.uoa.utils.TestExplanationUtils;
import java.io.IOException;
import java.util.List;
import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/problemAttempt")
public class ProblemAttemptController {
  private final ProblemAttemptService problemAttemptService;

  ProblemAttemptController(ProblemAttemptService problemAttemptService) {
    this.problemAttemptService = problemAttemptService;
  }

  @GetMapping
  @PreAuthorize(IS_AUTHENTICATED)
  public ResponseEntity<ProblemAttempt> startOrRetrieveLatestProblemAttempt(
      @RequestParam String problemId, @RequestParam String studentEmail) throws IOException {

    ProblemAttempt attempt =
        problemAttemptService.retrieveLatestOrCreateProblemAttempt(problemId, studentEmail);
    return ResponseEntity.ok(attempt);
  }

  @PostMapping("chat")
  @PreAuthorize(IS_AUTHENTICATED)
  public ResponseEntity<ChatHistory> chatWithClient(@RequestBody MessageDTO message)
      throws IOException {

    ChatHistory attempt =
        problemAttemptService.chatWithClientWithSessionHistory(
            message.getSessionId(), message.getChatMessage().getContent());

    // Update Equivalence class map:
    var messages = attempt.getMessages();
    var lastMsg = messages.get(messages.size() - 1);
    if (lastMsg.getRole().equals(Role.ASSISTANT)) {
      var problemAttempt =
          problemAttemptService.findProblemAttemptById(message.getProblemAttemptId());

      var content = lastMsg.getContent();
      int constraint = content.getConstraint_targeting();

      if (constraint != -1) {
        var eqClasses = problemAttempt.getClientEquivalenceMap();
        eqClasses.putIfAbsent(constraint, 0);
        eqClasses.put(constraint, eqClasses.get(constraint) + 1);

        problemAttempt.setClientEquivalenceMap(eqClasses);
        problemAttemptService.saveProblemAttempt(problemAttempt);
      }
    }

    return ResponseEntity.ok(attempt);
  }

  @PostMapping("chat/outputResponse")
  @PreAuthorize(IS_AUTHENTICATED)
  public ResponseEntity<ChatHistory> requestActualOutputResponse(
      @RequestBody TestCaseOutputDTO message) {

    // FE Validation that PISTON executed testcase successfully (exit code 0) MUST have occurred.
    var explanation = TestExplanationUtils.getTestCaseExplanation(message);
    var history =
        problemAttemptService.overwriteAssistantMessage(message.getSessionId(), explanation);

    return ResponseEntity.ok(history);
  }

  @PostMapping("chat/replace")
  @PreAuthorize(IS_AUTHENTICATED)
  public ResponseEntity<ChatHistory> replaceAssistantMessageInChatHistory(
      @RequestParam String sessionId, @RequestBody ChatMessage message) {
    ChatHistory history =
        problemAttemptService.overwriteAssistantMessage(
            sessionId, message.getContent().getMessage());
    return ResponseEntity.ok(history);
  }

  @PostMapping
  @PreAuthorize(IS_AUTHENTICATED)
  public ResponseEntity<ProblemAttempt> saveProblemAttempt(@RequestBody ProblemAttempt attempt) {
    var savedAttempt = problemAttemptService.saveProblemAttemptAndUpdateProblemsCompleted(attempt);
    return ResponseEntity.ok(savedAttempt);
  }

  @PostMapping("{id}/equivalenceClass")
  @PreAuthorize(IS_AUTHENTICATED)
  public ResponseEntity<Void> recordEquivalenceClass(
      @PathVariable String id, @RequestBody EquivalenceClassRequest equivalenceClassRequest) {
    ProblemAttempt problemAttempt = problemAttemptService.findProblemAttemptById(id);
    Map<Integer, Integer> oracleEquivalenceMap = problemAttempt.getOracleEquivalenceMap();

    List<String> buggyOutputs = equivalenceClassRequest.getBuggyOutputs();

    for (int i = 0; i < buggyOutputs.size(); i++) {
      String buggyOutput = buggyOutputs.get(i);

      if (!buggyOutput.equals(equivalenceClassRequest.getResult())) {
        int currentCount = oracleEquivalenceMap.getOrDefault(i + 1, 0);

        oracleEquivalenceMap.put(i + 1, currentCount + 1);

        problemAttemptService.saveProblemAttempt(problemAttempt);
      }
    }

    return ResponseEntity.noContent().build();
  }

  @PutMapping("{id}/failedAttempts")
  @PreAuthorize(IS_AUTHENTICATED)
  public ResponseEntity<ProblemAttempt> updateFailedAttempts(@PathVariable String id) {
    ProblemAttempt problemAttempt = problemAttemptService.findProblemAttemptById(id);

    int newFailedAttempts =
        Math.min(
            problemAttempt.getFailedAttempts() + 1,
            ProblemAttemptConstants.CAPPED_PENALTY_PERCENTAGE);

    problemAttempt.setFailedAttempts(newFailedAttempts);

    return ResponseEntity.ok(problemAttemptService.saveProblemAttempt(problemAttempt));
  }
}
