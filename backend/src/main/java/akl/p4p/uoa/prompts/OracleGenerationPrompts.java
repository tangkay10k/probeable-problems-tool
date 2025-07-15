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
			You are a software engineer writing a basic driver class file containing a main function in order to test the functionality of code written.

			write a test file containing all standard library imports, including the code needed to be executed below in the file:

			Code to be included in the file:
			//VAR_MODEL_ANSWER

			Only include a placeholder for inputs to be replaced in the file with regex.
			DO NOT INCLUDE INPUT VALUES FOR THE FUNCTIONS!

			//VAR_LANGUAGE_SPECIFIC_INSTRUCTIONS

			Along with the file, generate default inputs to the function(s), including their typings if applicable.

			Example:
			int nums[] = {1, 2, 3, 4, 5};
			int n = 5;
				""";
  }

  private static String getCSpecificSingleFunctionOraclePrompt() {
    return """
			Here is an single shot example of a C main.c file that could be returned:

			// Appropriate header imports
			#include <stdio.h>

			// Function definition
			int howGoodCanItGet(int* nums, int numsSize) {
				int maxSum = nums[0];
				int currentSum = nums[0];

				for (int i = 1; i < numsSize; i++) {
					if (currentSum < 0) {
						currentSum = nums[i];
					} else {
						currentSum += nums[i];
					}

					if (currentSum > maxSum) {
						maxSum = currentSum;
					}
				}

				return maxSum;
			}

			// Main entry point calling function to test
			int main(void) {
				//VAR_INPUTS //<- placeholder
				int result = howGoodCanItGet(nums, numsSize);
				printf("Function returned: %d\\n", result);
				return 0;
			}
			""";
  }

  private static String getJavaSpecificSingleFunctionOraclePrompt() {
    // NOOP
    return "";
  }
}
