package akl.p4p.uoa.controllers;

import static akl.p4p.uoa.llm.LLMResponseSchemas.*;
import static akl.p4p.uoa.llm.prompts.OracleGenerationPrompts.getOracleGenerationPrompt;
import static akl.p4p.uoa.llm.prompts.ProblemGenerationPrompts.getConstraintsGenerationPrompt;
import static akl.p4p.uoa.llm.prompts.ProblemGenerationPrompts.getProblemStatementSystemPrompt;
import static akl.p4p.uoa.llm.prompts.TestSuitePrompts.getTestSuiteGenerationPrompt;
import static akl.p4p.uoa.utils.JsonUtils.parseOracleJsonResponse;

import akl.p4p.uoa.constants.AuthConstants;
import akl.p4p.uoa.data.BuildRequest;
import akl.p4p.uoa.data.TestResponse;
import akl.p4p.uoa.llm.prompts.ClientPrompts;
import akl.p4p.uoa.models.Problem;
import akl.p4p.uoa.services.AIService;
import akl.p4p.uoa.services.ProblemService;
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
    String sysPrompt = getConstraintsGenerationPrompt(problem);
    String constraints = aiService.executeOneTimeLLMCall(sysPrompt);
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

    String testSuite =
        aiService.executeOneTimeLLMCall(
            getTestSuiteGenerationPrompt(problem), getSchemaDefinition(TEST_CASE_GENERATION));

    ObjectMapper objectMapper = new ObjectMapper();
    TestResponse testResponse = objectMapper.readValue(testSuite, TestResponse.class);

    problem.getTestSuite().addAll(testResponse.getTests());
    return ResponseEntity.ok(problem);
  }

  @PostMapping("problem-statement")
  @PreAuthorize(AuthConstants.HAS_ROLE_TEACHER)
  public ResponseEntity<Problem> generateProblemStatement(@RequestBody Problem problem)
      throws IOException {
    String sysPrompt = getProblemStatementSystemPrompt(problem);
    String problemStatement = aiService.executeOneTimeLLMCall(sysPrompt);
    problem.setProblemStatement(problemStatement);
    return ResponseEntity.ok(problem);
  }

  @PostMapping("oracle")
  @PreAuthorize(AuthConstants.HAS_ROLE_TEACHER)
  public ResponseEntity<Problem> generateOracle(@RequestBody Problem problem) throws IOException {
    String jsonResponse =
        aiService.executeOneTimeLLMCall(
            getOracleGenerationPrompt(problem), getSchemaDefinition(ORACLE_GENERATION));
    var initialProbe = parseOracleJsonResponse(jsonResponse);
    problem.setDefaultProbe(initialProbe);
    return ResponseEntity.ok(problem);
  }

  @PostMapping("solution-attempt")
  @PreAuthorize(AuthConstants.IS_AUTHENTICATED)
  public ResponseEntity<String> generateSolutionAttempt(@RequestBody BuildRequest request)
      throws IOException {

    // Get server source of truth.
    var problem = problemService.getProblemById(request.getProblemId());

    String codeGenerationPrompt =
        ClientPrompts.codeGenerationPrompt(
            request.getPrompt(),
            problem.getProgramLanguage().toString(),
            problem.getFunctionSignature());

    String solutionAttempt =
        aiService.executeOneTimeLLMCallStudent(
            codeGenerationPrompt, getSchemaDefinition(CODE_GENERATION));

    return ResponseEntity.ok(solutionAttempt);
  }
}
