package akl.p4p.uoa.controllers;

import akl.p4p.uoa.models.ProblemAttempt;
import akl.p4p.uoa.services.ProblemAttemptService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
@RestController
@RequestMapping("/api/problemAttempt")
public class ProblemAttemptController {
	private final ProblemAttemptService problemAttemptService;

	ProblemAttemptController(ProblemAttemptService problemAttemptService) {
		this.problemAttemptService = problemAttemptService;
	}

	@GetMapping
	public ResponseEntity<ProblemAttempt> startOrRetrieveLatestProblemAttempt(@RequestParam String problemId,
															  @RequestParam String studentEmail) {

		ProblemAttempt attempt = problemAttemptService.retrieveLatestOrCreateProblemAttempt(problemId, studentEmail);
		return ResponseEntity.ok(attempt);
	}

}
