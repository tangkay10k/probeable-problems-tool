package akl.p4p.uoa.controllers;

import akl.p4p.uoa.models.Problem;
import akl.p4p.uoa.services.ProblemService;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("api/problems")
public class ProblemController {

  private final ProblemService problemService;

  public ProblemController(ProblemService problemService) {
    this.problemService = problemService;
  }

  @GetMapping
  @PreAuthorize("isAuthenticated()")
  public ResponseEntity<List<Problem>> getAllProblems(
      @RequestParam(required = false, defaultValue = "false") boolean isStudent) {

    // TO DO: add authentication logic.

    return ResponseEntity.ok(problemService.getAllProblems(isStudent));
  }

  @GetMapping("{problemId}")
  @PreAuthorize("isAuthenticated()")
  public ResponseEntity<Problem> getProblem(@PathVariable String problemId) {

    // TO DO: add authentication logic.
    return ResponseEntity.ok(problemService.getProblemById(problemId));
  }

  @GetMapping("/test-suite")
  @PreAuthorize("isAuthenticated()")
  public ResponseEntity<Problem> getProblemTestSuiteById(@RequestParam String problemId) {

    // TO DO: add authentication logic.

    Problem problem = problemService.getProblemTestSuite(problemId);
    return ResponseEntity.ok(problem);
  }

  @PostMapping
  @PreAuthorize("hasRole('TEACHER')")
  public ResponseEntity<Problem> createNewProblem(@RequestBody Problem problem) {

    // TO DO: add authentication logic.

    Problem savedProblem = problemService.createProblem(problem);
    return ResponseEntity.ok(savedProblem);
  }

  @PatchMapping
  @PreAuthorize("hasRole('TEACHER')")
  public ResponseEntity<Problem> updateExistingProblem(@RequestBody Problem problem) {
    return ResponseEntity.ok(problemService.updateProblem(problem));
  }
}
