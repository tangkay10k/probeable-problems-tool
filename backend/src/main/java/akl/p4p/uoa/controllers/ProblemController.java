package akl.p4p.uoa.controllers;

import akl.p4p.uoa.models.Problem;
import akl.p4p.uoa.models.ProblemAttempt;
import akl.p4p.uoa.services.AIService;
import akl.p4p.uoa.services.ProblemService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("api/problems")
public class ProblemController {

    private final ProblemService problemService;

    public ProblemController(ProblemService problemService) {
		this.problemService = problemService;
    }

    @GetMapping
    public ResponseEntity<List<Problem>> getAllProblems(
            @RequestParam(required = false, defaultValue = "false") boolean isStudent) {

        // TO DO: add authentication logic.

        return ResponseEntity.ok(problemService.getAllProblems(isStudent));
    }

    @PostMapping
    public ResponseEntity<Problem> createNewProblem(@RequestBody Problem problem) {

        // TO DO: add authentication logic.

        Problem savedProblem = problemService.createProblem(problem);
        return ResponseEntity.ok(savedProblem);
    }

	@PatchMapping
	public ResponseEntity<Problem> updateExistingProblem(@RequestBody Problem problem) {
		return ResponseEntity.ok(problemService.updateProblem(problem));
	}
}
