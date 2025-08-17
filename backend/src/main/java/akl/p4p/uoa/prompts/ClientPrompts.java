package akl.p4p.uoa.prompts;

import static akl.p4p.uoa.utils.PromptUtils.readFileFromResources;

import akl.p4p.uoa.enums.ProgramLanguage;
import java.io.IOException;

public class ClientPrompts {

  private static final String PROMPT_RESOURCE_DIR = "prompts/";
  private static final String CLIENT_BASE_PROMPT_FILE = "client-base-prompt.txt";
  private static final String CLIENT_EXPLANATION_PROMPT_FILE = "client-explanation-prompt.txt";
  private static final String CLIENT_TEST_CASE_PROMPT_FILE = "client-test-case-prompt.txt";
  private static final String C_SINGLE_FUNCTION_SPECIFIC_INSTRUCTIONS =
      "c-sf-specific-instructions.txt";
  private static final String FAULTY_SOLUTION_PROMPT_FILE = "faulty-solution-prompt.txt";

  public static String getClientInitialisationPrompt(
      ProgramLanguage problemLanguage,
      String problemStatement,
      String modelAnswer,
      String constraints)
      throws IOException {

    String basePrompt =
        clientBasePrompt(problemLanguage.toString(), problemStatement, modelAnswer, constraints);
    String specificInstructions;
    switch (problemLanguage) {
      case C -> specificInstructions = getCSpecificInstructions();
      case JAVA -> specificInstructions = getJavaSpecificInstructions();
      default ->
          throw new RuntimeException(
              "Programming language: " + problemLanguage + " does not exist!");
    }
    return basePrompt.replace("//VAR_LANGUAGE_SPECIFIC_INSTRUCTIONS", specificInstructions);
  }

  public static String clientBasePrompt(
      String problemLanguage, String problemStatement, String modelAnswer, String constraints)
      throws IOException {
    String basePrompt = readFileFromResources(PROMPT_RESOURCE_DIR + CLIENT_BASE_PROMPT_FILE);
    String functionSignature = modelAnswer.split("\\{")[0].trim();

    return basePrompt
        .replace("//VAR_PROBLEM_STATEMENT", problemStatement.toLowerCase())
        .replace("//VAR_MODEL_ANSWER", modelAnswer)
        .replace("//VAR_CONSTRAINTS", constraints)
        .replace("//VAR_FUNCTION_SIGNATURE", functionSignature)
        .replace("//VAR_PROGRAM_LANGUAGE", problemLanguage)
        .replace("//VAR_IS_NEW_SESSION", "true")
        .replace("//VAR_TURN_INDEX", "0");
  }

  public static String clientExplanationPrompt(String questionAsked, String output, String testCase)
      throws IOException {
    String basePrompt = readFileFromResources(PROMPT_RESOURCE_DIR + CLIENT_EXPLANATION_PROMPT_FILE);
    return basePrompt
        .replace("//VAR_USER_QUESTION", questionAsked)
        .replace("//VAR_OUTPUT", output)
        .replace("//VAR_TEST_CASE", testCase);
  }

  public static String clientTestCasePrompt() throws IOException {
    return readFileFromResources(PROMPT_RESOURCE_DIR + CLIENT_TEST_CASE_PROMPT_FILE);
  }

  public static String faultySolutionPrompt(String modelAnswer, String constraints)
      throws IOException {
    String basePrompt = readFileFromResources(PROMPT_RESOURCE_DIR + FAULTY_SOLUTION_PROMPT_FILE);
    return basePrompt
        .replace("//VAR_MODEL_SOLUTION", modelAnswer)
        .replace("//VAR_CONSTRAINTS", constraints);
  }

  private static String getCSpecificInstructions() throws IOException {
    return readFileFromResources(PROMPT_RESOURCE_DIR + C_SINGLE_FUNCTION_SPECIFIC_INSTRUCTIONS);
  }

  private static String getJavaSpecificInstructions() {
    // TODO: write java Specific instructions.
    return null;
  }
}
