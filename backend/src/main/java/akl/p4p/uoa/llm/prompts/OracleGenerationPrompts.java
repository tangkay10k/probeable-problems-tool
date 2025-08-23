package akl.p4p.uoa.llm.prompts;

import static akl.p4p.uoa.utils.PromptUtils.readFileFromResources;

import akl.p4p.uoa.models.Problem;
import java.io.IOException;

public class OracleGenerationPrompts {

  private static final String PROMPT_RESOURCE_DIR = "prompts/";
  private static final String ORACLE_BASE_PROMPT_FILE = "oracle-base-prompt.txt";
  private static final String C_SINGLE_FUNCTION_SPECIFIC_INSTRUCTIONS = "c-sf-oracle-prompt.txt";

  public static String getOracleGenerationPrompt(Problem problem) throws IOException {
    switch (problem.getProblemType()) {
      case FUNCTION -> {
        return getSingleFunctionOracleGenerationPrompt(problem);
      }
      case OOP -> {
        return getOOPOracleGenerationPrompt(problem);
      }
      default ->
          throw new RuntimeException(
              "The problem type: " + problem.getProblemType() + " does not exist!");
    }
  }

  private static String getOOPOracleGenerationPrompt(Problem problem) {
    // NOOP
    throw new RuntimeException("OOP Currently not supported");
  }

  private static String getSingleFunctionOracleGenerationPrompt(Problem problem)
      throws IOException {

    String basePrompt = getBaseOracleGenerationPrompt();
    String languageSpecificInstructions;
    switch (problem.getProgramLanguage()) {
      case C -> languageSpecificInstructions = getCSpecificSingleFunctionOraclePrompt();
      case JAVA -> languageSpecificInstructions = getJavaSpecificSingleFunctionOraclePrompt();
      default ->
          throw new RuntimeException(
              "Programming Language: " + problem.getProgramLanguage() + " is not " + "supported!");
    }
    return basePrompt
        .replace("//VAR_MODEL_ANSWER", problem.getModelAnswer())
        .replace("//VAR_LANGUAGE_SPECIFIC_INSTRUCTIONS", languageSpecificInstructions);
  }

  private static String getBaseOracleGenerationPrompt() throws IOException {
    return readFileFromResources(PROMPT_RESOURCE_DIR + ORACLE_BASE_PROMPT_FILE);
  }

  private static String getCSpecificSingleFunctionOraclePrompt() throws IOException {
    return readFileFromResources(PROMPT_RESOURCE_DIR + C_SINGLE_FUNCTION_SPECIFIC_INSTRUCTIONS);
  }

  private static String getJavaSpecificSingleFunctionOraclePrompt() {
    // NOOP
    return "";
  }
}
