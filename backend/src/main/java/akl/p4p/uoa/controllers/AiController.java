package akl.p4p.uoa.controllers;

import akl.p4p.uoa.data.Prompts;
import akl.p4p.uoa.models.Problem;
import akl.p4p.uoa.services.AIService;
import akl.p4p.uoa.services.ProblemService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/ai")
class AiController {

  AIService aiService;
  ProblemService problemService;

  public AiController(ProblemService problemService, AIService aiService) {
    this.problemService = problemService;
    this.aiService = aiService;
  }

  /**
   * Endpoint to generate constraints for a given question. Note that this endpoint does not persist
   * the constraints generated in any database, but is sent back to the client for review /
   * iteration.
   */
  @PostMapping("constraints")
  public ResponseEntity<Problem> generateProblemConstraints(@RequestBody Problem problem) {
    String modelAnswer = problem.getModelAnswer();

    String basePrompt = Prompts.getConstraintsGenerationPrompt();
    String sysPrompt = basePrompt.replace("//VAR_MODEL_SOLUTION", modelAnswer);
    String constraints = aiService.executeOneTimeLLMCall(sysPrompt, null);

    problem.setConstraints(constraints);
    return ResponseEntity.ok(problem);
  }

  /**
   * Endpoint to generate a test suite for a given question. Note that this endpoint does not
   * persist the test suite generated in any database, but is sent back to the client for review /
   * iteration.
   */
  @PostMapping("test-suite")
  public ResponseEntity<Problem> generateProblemTestSuite(@RequestBody Problem problem) {
    String modelAnswer = problem.getModelAnswer();
    String constraints = problem.getConstraints();

    String basePrompt = Prompts.getTestSuiteGenerationPrompt();
    String sysPrompt =
        basePrompt
            .replace("//VAR_MODEL_SOLUTION", modelAnswer)
            .replace("//VAR_CONSTRAINTS", constraints);

    String testSuite = aiService.executeOneTimeLLMCall(sysPrompt, null);
    problem.setTestSuite(testSuite);
    return ResponseEntity.ok(problem);
  }

  @PostMapping("problem-statement")
  public ResponseEntity<Problem> generateProblemStatement(@RequestBody Problem problem) {
    String modelAnswer = problem.getModelAnswer();
    String constraints = problem.getConstraints();

    String basePrompt = Prompts.getProblemStatementSystemPrompt();
    String sysPrompt =
        basePrompt
            .replace("//VAR_MODEL_SOLUTION", modelAnswer)
            .replace("//VAR_CONSTRAINTS", constraints);

    String problemStatement = aiService.executeOneTimeLLMCall(sysPrompt, null);
    problem.setProblemStatement(problemStatement);
    return ResponseEntity.ok(problem);
  }
}
