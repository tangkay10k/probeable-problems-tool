package akl.p4p.uoa.controllers;

import akl.p4p.uoa.data.JsonSchemaDefinition;
import akl.p4p.uoa.data.TestResponse;
import akl.p4p.uoa.models.Oracle;
import akl.p4p.uoa.models.Problem;
import akl.p4p.uoa.prompts.OracleGenerationPrompts;
import akl.p4p.uoa.prompts.ProblemGenerationPrompts;
import akl.p4p.uoa.prompts.TestSuitePrompts;
import akl.p4p.uoa.services.AIService;
import akl.p4p.uoa.services.OracleService;
import akl.p4p.uoa.services.ProblemService;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
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

  OracleService oracleService;

  public AiController(
      ProblemService problemService, AIService aiService, OracleService oracleService) {
    this.problemService = problemService;
    this.aiService = aiService;
    this.oracleService = oracleService;
  }

  /**
   * Endpoint to generate constraints for a given question. Note that this endpoint does not persist
   * the constraints generated in any database, but is sent back to the client for review /
   * iteration.
   */
  @PostMapping("constraints")
  public ResponseEntity<Problem> generateProblemConstraints(@RequestBody Problem problem) {
    String sysPrompt = ProblemGenerationPrompts.getConstraintsGenerationPrompt(problem);
    String constraints = aiService.executeOneTimeLLMCall(sysPrompt, null);
    problem.setConstraints(constraints);
    return ResponseEntity.ok(problem);
  }

  /**
   * Endpoint to generate a test suite for a given question. Note that this endpoint does not
   * persist the test suite generated in any database, but is sent back to the client for review /
   * iteration.
   *
   * @throws Exception
   */
  @PostMapping("test-suite")
  public ResponseEntity<Problem> generateProblemTestSuite(@RequestBody Problem problem)
      throws Exception {
    ObjectMapper objectMapper = new ObjectMapper();

    String sysPrompt = TestSuitePrompts.getTestSuiteGenerationPrompt(problem);
    String testSuite =
        aiService.executeOneTimeLLMCall(sysPrompt, JsonSchemaDefinition.getTestCaseSchema());

    TestResponse testResponse = objectMapper.readValue(testSuite, TestResponse.class);

    problem.getTestSuite().addAll(testResponse.getTests());
    return ResponseEntity.ok(problem);
  }

  @PostMapping("problem-statement")
  public ResponseEntity<Problem> generateProblemStatement(@RequestBody Problem problem) {
    String sysPrompt = ProblemGenerationPrompts.getProblemStatementSystemPrompt(problem);
    String problemStatement = aiService.executeOneTimeLLMCall(sysPrompt, null);
    problem.setProblemStatement(problemStatement);
    return ResponseEntity.ok(problem);
  }

  @PostMapping("oracle")
  public ResponseEntity<Oracle> generateOracleFile(@RequestBody Problem problem)
      throws JsonProcessingException {
    String sysPrompt = OracleGenerationPrompts.getOracleGenerationPrompt(problem);
    String jsonResponse =
        aiService.executeOneTimeLLMCall(
            sysPrompt, JsonSchemaDefinition.getOracleGenerationSchema());

    var oracle = oracleService.parseLLMGeneratedOracle(problem, jsonResponse);
    return ResponseEntity.ok(oracle);
  }
}
