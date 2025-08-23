package akl.p4p.uoa.services;

import static akl.p4p.uoa.llm.LLMResponseSchemas.FAULTY_SOLUTION;
import static akl.p4p.uoa.llm.LLMResponseSchemas.getSchemaDefinition;
import static akl.p4p.uoa.utils.ModelUtils.getNullPropertyNames;

import akl.p4p.uoa.data.BuggyCodes;
import akl.p4p.uoa.llm.prompts.ClientPrompts;
import akl.p4p.uoa.models.Problem;
import akl.p4p.uoa.repositories.ProblemRepository;
import akl.p4p.uoa.utils.StringUtils;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.io.IOException;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.Optional;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;

@Service
public class ProblemService {

  private final ProblemRepository problemRepository;
  private final AIService aiService;

  public ProblemService(ProblemRepository problemRepository, AIService aiService) {
    this.problemRepository = problemRepository;
    this.aiService = aiService;
  }

  public List<Problem> getAllProblems(boolean isStudent) {
    List<Problem> problems = problemRepository.findAll();
    if (isStudent) {
      for (Problem p : problems) {
        p.setModelAnswer(null);
      }
    }
    return problems;
  }

  public Problem createProblem(Problem problem) throws IOException {
    String assistantReply =
        aiService.executeOneTimeLLMCallStudent(
            ClientPrompts.faultySolutionPrompt(problem.getModelAnswer(), problem.getConstraints()),
            getSchemaDefinition(FAULTY_SOLUTION));

    ObjectMapper objectMapper = new ObjectMapper();

    BuggyCodes buggyCodes = objectMapper.readValue(assistantReply, BuggyCodes.class);

    problem.getBuggy_codes().addAll(buggyCodes.getBuggy_codes());
    problem.setFunctionName(StringUtils.extractFunctionName(problem.getModelAnswer()));
    problem.setFunctionSignature(StringUtils.extractFunctionSignature(problem.getModelAnswer()));

    return problemRepository.save(problem);
  }

  public Problem getProblemById(String problemId) {
    Optional<Problem> probOptional = problemRepository.findById(problemId);
    return probOptional.orElse(null);
  }

  // This function specifically sanitises the problem retrieved from the database only returning the
  // testcases.
  public Problem getProblemTestSuite(String problemId) {
    return problemRepository
        .findById(problemId)
        .map(
            problem -> {
              var sanitised = new Problem();
              sanitised.setId(problem.getId());
              sanitised.setTestSuite(problem.getTestSuite());
              return sanitised;
            })
        .orElseThrow(
            () -> new NoSuchElementException("Problem with ID " + problemId + " not found"));
  }

  public Problem updateProblem(Problem incoming) {
    Problem existing =
        problemRepository
            .findById(incoming.getId())
            .orElseThrow(() -> new RuntimeException("Problem not found: " + incoming.getId()));

    BeanUtils.copyProperties(incoming, existing, getNullPropertyNames(incoming));

    return problemRepository.save(existing);
  }
}
