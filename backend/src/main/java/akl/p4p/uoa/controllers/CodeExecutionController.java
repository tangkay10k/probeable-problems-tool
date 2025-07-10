package akl.p4p.uoa.controllers;

import akl.p4p.uoa.data.ExecutionRequest;
import akl.p4p.uoa.models.Problem;
import akl.p4p.uoa.programExecutors.java.JavaCodeExecutor;
import akl.p4p.uoa.services.ProblemService;
import java.io.IOException;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/execution")
public class CodeExecutionController {

  public final ProblemService problemService;

  public CodeExecutionController(ProblemService problemService) {
    this.problemService = problemService;
  }

  @PostMapping("/probe")
  public ResponseEntity<?> executeOracle(@RequestBody ExecutionRequest req) throws IOException {

    Problem problem = problemService.getProblemById(req.getProblemId());

    String executionResult = null;
    switch (req.getProgramLanguage()) {
      case JAVA ->
          executionResult =
              JavaCodeExecutor.executeJavaProbe(
                  req.getLanguageVersion(), req.getInput(), problem.getModelAnswer());
      case C -> System.out.print("TO DO");
    }

    assert executionResult != null;
    return ResponseEntity.ok(executionResult);
  }
}
