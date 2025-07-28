package akl.p4p.uoa.controllers;

import akl.p4p.uoa.constants.AuthConstants;
import akl.p4p.uoa.dtos.MessageDTO;
import akl.p4p.uoa.models.ChatHistory;
import akl.p4p.uoa.models.ProblemAttempt;
import akl.p4p.uoa.services.ProblemAttemptService;
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
  @PreAuthorize(AuthConstants.IS_AUTHENTICATED)
  public ResponseEntity<ProblemAttempt> startOrRetrieveLatestProblemAttempt(
      @RequestParam String problemId, @RequestParam String studentEmail) {

    ProblemAttempt attempt =
        problemAttemptService.retrieveLatestOrCreateProblemAttempt(problemId, studentEmail);
    return ResponseEntity.ok(attempt);
  }

  @PostMapping("chat")
  @PreAuthorize(AuthConstants.IS_AUTHENTICATED)
  public ResponseEntity<ChatHistory> chatWithClient(@RequestBody MessageDTO message) {

    ChatHistory attempt =
        problemAttemptService.chatWithClientWithSessionHistory(
            message.getSessionId(), message.getChatMessage().getContent());
    return ResponseEntity.ok(attempt);
  }
}
