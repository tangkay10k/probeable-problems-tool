package akl.p4p.uoa.controllers;

import akl.p4p.uoa.constants.AuthConstants;
import akl.p4p.uoa.data.JsonSchemaDefinition;
import akl.p4p.uoa.data.TestResponse;
import akl.p4p.uoa.dtos.ChatRequestDTO;
import akl.p4p.uoa.models.Problem;
import akl.p4p.uoa.prompts.ClientPrompts;
import akl.p4p.uoa.prompts.OracleGenerationPrompts;
import akl.p4p.uoa.prompts.ProblemGenerationPrompts;
import akl.p4p.uoa.prompts.TestSuitePrompts;
import akl.p4p.uoa.services.AIService;
import akl.p4p.uoa.services.ProblemService;
import akl.p4p.uoa.utils.JsonUtils;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.io.IOException;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
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
  @PreAuthorize(AuthConstants.HAS_ROLE_TEACHER)
  public ResponseEntity<Problem> generateProblemConstraints(@RequestBody Problem problem)
      throws IOException {
    String sysPrompt = ProblemGenerationPrompts.getConstraintsGenerationPrompt(problem);
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
  @PreAuthorize(AuthConstants.HAS_ROLE_TEACHER)
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
  @PreAuthorize(AuthConstants.HAS_ROLE_TEACHER)
  public ResponseEntity<Problem> generateProblemStatement(@RequestBody Problem problem)
      throws IOException {
    String sysPrompt = ProblemGenerationPrompts.getProblemStatementSystemPrompt(problem);
    String problemStatement = aiService.executeOneTimeLLMCall(sysPrompt, null);
    problem.setProblemStatement(problemStatement);
    return ResponseEntity.ok(problem);
  }

  @PostMapping("oracle")
  @PreAuthorize(AuthConstants.HAS_ROLE_TEACHER)
  public ResponseEntity<Problem> generateOracle(@RequestBody Problem problem) throws IOException {
    String sysPrompt = OracleGenerationPrompts.getOracleGenerationPrompt(problem);
    String jsonResponse = 
    aiService.executeOneTimeLLMCall(
        sysPrompt, JsonSchemaDefinition.getOracleGenerationSchema());

    var initialProbe = JsonUtils.parseOracleJsonResponse(jsonResponse);
    problem.setDefaultProbe(initialProbe);
    return ResponseEntity.ok(problem);
  }

  @PostMapping("solution-attempt")
  @PreAuthorize(AuthConstants.IS_AUTHENTICATED)
  public ResponseEntity<String> generateSolutionAttempt(@RequestBody ChatRequestDTO prompt) throws IOException {
    String codeGenerationPrompt = ClientPrompts.codeGenerationPrompt(prompt.getPrompt(), prompt.getProgramLanguage().toString(),
        prompt.getFunctionSignature());
    String solutionAttempt = aiService.executeOneTimeLLMCallStudent(codeGenerationPrompt,
        JsonSchemaDefinition.getCodeGenerationSchema());

    return ResponseEntity.ok(solutionAttempt);
  }
}
