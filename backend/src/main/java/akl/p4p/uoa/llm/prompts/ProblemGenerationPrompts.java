package akl.p4p.uoa.llm.prompts;

import static akl.p4p.uoa.utils.PromptUtils.readFileFromResources;

import akl.p4p.uoa.models.Problem;
import java.io.IOException;

public final class ProblemGenerationPrompts {

  private static final String PROMPT_RESOURCE_DIR = "prompts/";
  private static final String CONSTRAINTS_BASE_PROMPT_FILE = "constraints-base-prompt.txt";
  private static final String PROBLEM_STATEMENT_BASE_PROMPT_FILE =
      "problem-statement-base-prompt.txt";

  public static String getConstraintsGenerationPrompt(Problem problem) throws IOException {
    String basePrompt = readFileFromResources(PROMPT_RESOURCE_DIR + CONSTRAINTS_BASE_PROMPT_FILE);
    return basePrompt.replace("//VAR_MODEL_SOLUTION", problem.getModelAnswer());
  }

  public static String getProblemStatementSystemPrompt(Problem problem) throws IOException {
    String basePrompt =
        readFileFromResources(PROMPT_RESOURCE_DIR + PROBLEM_STATEMENT_BASE_PROMPT_FILE);
    return basePrompt
        .replace("//VAR_MODEL_SOLUTION", problem.getModelAnswer())
        .replace("//VAR_CONSTRAINTS", problem.getConstraints());
  }
}
