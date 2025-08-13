package akl.p4p.uoa.controllers;

import akl.p4p.uoa.constants.AuthConstants;
import akl.p4p.uoa.models.Problem;
import akl.p4p.uoa.services.ProblemService;

import java.io.IOException;
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
  @PreAuthorize(AuthConstants.IS_AUTHENTICATED)
  public ResponseEntity<List<Problem>> getAllProblems(
      @RequestParam(required = false, defaultValue = "false") boolean isStudent) {

    return ResponseEntity.ok(problemService.getAllProblems(isStudent));
  }

  @GetMapping("{problemId}")
  @PreAuthorize(AuthConstants.IS_AUTHENTICATED)
  public ResponseEntity<Problem> getProblem(@PathVariable String problemId) {

    return ResponseEntity.ok(problemService.getProblemById(problemId));
  }

  @GetMapping("/test-suite")
  @PreAuthorize(AuthConstants.IS_AUTHENTICATED)
  public ResponseEntity<Problem> getProblemTestSuiteById(@RequestParam String problemId) {

    Problem problem = problemService.getProblemTestSuite(problemId);
    return ResponseEntity.ok(problem);
  }

  @PostMapping
  @PreAuthorize(AuthConstants.HAS_ROLE_TEACHER)
  public ResponseEntity<Problem> createNewProblem(@RequestBody Problem problem) throws IOException {

    Problem savedProblem = problemService.createProblem(problem);
    return ResponseEntity.ok(savedProblem);
  }

  @PatchMapping
  @PreAuthorize(AuthConstants.HAS_ROLE_TEACHER)
  public ResponseEntity<Problem> updateExistingProblem(@RequestBody Problem problem) {
    return ResponseEntity.ok(problemService.updateProblem(problem));
  }
}
