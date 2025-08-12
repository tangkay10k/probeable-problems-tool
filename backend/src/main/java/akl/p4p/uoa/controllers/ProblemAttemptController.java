package akl.p4p.uoa.controllers;

import static akl.p4p.uoa.constants.AuthConstants.IS_AUTHENTICATED;

import akl.p4p.uoa.data.ChatMessage.Role;
import akl.p4p.uoa.dtos.MessageDTO;
import akl.p4p.uoa.dtos.TestCaseOutputDTO;
import akl.p4p.uoa.models.ChatHistory;
import akl.p4p.uoa.models.ProblemAttempt;
import akl.p4p.uoa.prompts.ClientPrompts;
import akl.p4p.uoa.services.ProblemAttemptService;
import java.io.IOException;
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
      @RequestBody TestCaseOutputDTO message) throws IOException {
    String sysPrompt =
        ClientPrompts.clientExplanationPrompt(message.getOutput(), message.getTestCase());
    ChatHistory attempt =
        problemAttemptService.chatWithClientWithSessionHistoryAndReplace(
            message.getSessionId(), sysPrompt);

    return ResponseEntity.ok(attempt);
  }

  @PostMapping
  @PreAuthorize(IS_AUTHENTICATED)
  public ResponseEntity<ProblemAttempt> saveProblemAttempt(@RequestBody ProblemAttempt attempt) {
    return ResponseEntity.ok(
        problemAttemptService.saveProblemAttemptAndUpdateProblemsCompleted(attempt));
  }
}
