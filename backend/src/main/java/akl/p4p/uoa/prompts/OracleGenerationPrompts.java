package akl.p4p.uoa.prompts;

import akl.p4p.uoa.models.Problem;

public class OracleGenerationPrompts {
  public static String getOracleGenerationPrompt(Problem problem) {
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

  private static String getSingleFunctionOracleGenerationPrompt(Problem problem) {

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

  private static String getBaseOracleGenerationPrompt() {
    return """
          You are a software engineer writing a short C code snippet to test a function.

          Your task is to generate:
          - A default example input declaration for the function parameters
          - The function call using those inputs
          - A printf statement to print the result if the function returns void no need to print it.

          Do not include the function implementation, main method, or any header files.

          Code to be tested:
          //VAR_MODEL_ANSWER

          //VAR_LANGUAGE_SPECIFIC_INSTRUCTIONS
          """;
  }

  private static String getCSpecificSingleFunctionOraclePrompt() {
    return """
        Example output format:
        int nums[] = {1, 2, 3, 4, 5};
        int n = 5;
        int result = howGoodCanItGet(nums, numsSize);
        printf("%d", result);
        """;
  }

  private static String getJavaSpecificSingleFunctionOraclePrompt() {
    // NOOP
    return "";
  }
}
