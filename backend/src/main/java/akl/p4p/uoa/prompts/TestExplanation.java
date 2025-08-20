package akl.p4p.uoa.prompts;

import akl.p4p.uoa.dtos.TestCaseOutputDTO;

public class TestExplanation {

  private static final String INPUTS_PLACEHOLDER = "//VAR_INPUTS";

  private static final String OUTPUTS_PLACEHOLDER = "//VAR_OUTPUTS";

  private static final String[] singleInputResponses = {
    "For that: "
        + INPUTS_PLACEHOLDER
        + "the function is expected to output: "
        + OUTPUTS_PLACEHOLDER,
    "For this input, I want the function to return: " + OUTPUTS_PLACEHOLDER,
    "With the input " + INPUTS_PLACEHOLDER + " the function should output: " + OUTPUTS_PLACEHOLDER,
    "For the input "
        + INPUTS_PLACEHOLDER
        + " I expect the function to output: "
        + OUTPUTS_PLACEHOLDER,
    "I would like you to make it so that the function outputs: "
        + OUTPUTS_PLACEHOLDER
        + " for the input "
        + INPUTS_PLACEHOLDER,
    "Make it so that for the input: "
        + INPUTS_PLACEHOLDER
        + "the function outputs: "
        + OUTPUTS_PLACEHOLDER,
  };
  private static final String[] multipleInputResponses = {
    "For the inputs "
        + INPUTS_PLACEHOLDER
        + " the function call is expected to produce: "
        + OUTPUTS_PLACEHOLDER,
    "For these inputs, I want the function to output: " + OUTPUTS_PLACEHOLDER + ".",
    "With the inputs " + INPUTS_PLACEHOLDER + " the function should output: " + OUTPUTS_PLACEHOLDER,
    "For the inputs "
        + INPUTS_PLACEHOLDER
        + " I expect the function to output: "
        + OUTPUTS_PLACEHOLDER,
    "I would like you to make it so that the function output: "
        + OUTPUTS_PLACEHOLDER
        + " for the inputs "
        + INPUTS_PLACEHOLDER,
    "Make it so that for the inputs: "
        + INPUTS_PLACEHOLDER
        + " the function outputs: "
        + OUTPUTS_PLACEHOLDER,
  };

  public static String getTestCaseExplanation(TestCaseOutputDTO message) {
    String llmMessage = message.getLlmResponse().getMessage();
    String inputs =
        parseInputsFromGeneratedTestCase(message.getTestCase(), message.getFunctionName());
    String responseTemplate =
        getRandomResponse(isSingleInputTestCase(message.getTestCase(), message.getFunctionName()));

    return llmMessage
        + " "
        + responseTemplate
            .replace(INPUTS_PLACEHOLDER, inputs)
            .replace(OUTPUTS_PLACEHOLDER, message.getOutput());
  }

  /** Helper function to extract the inputs from a generated test case. */
  private static String parseInputsFromGeneratedTestCase(String testCase, String functionName) {
    String[] lines = testCase.split("\n");
    StringBuilder inputs = new StringBuilder();

    for (String line : lines) {
      if (line.contains(functionName)) {
        break;
      }

      inputs.append(line).append(" ");
    }
    return inputs.toString();
  }

  /** Helper function to determine if the generated test takes in a single parameter. */
  private static boolean isSingleInputTestCase(String testCase, String functionName) {
    String[] lines = testCase.split("\n");

    int numInputs = 0;
    for (String line : lines) {
      if (line.contains(functionName)) {
        break;
      }
      numInputs++;
    }

    return numInputs == 1;
  }

  private static String getRandomResponse(Boolean isSingleInput) {
    if (isSingleInput) {
      return singleInputResponses[(int) (Math.random() * singleInputResponses.length)];
    } else {
      return multipleInputResponses[(int) (Math.random() * multipleInputResponses.length)];
    }
  }
}
