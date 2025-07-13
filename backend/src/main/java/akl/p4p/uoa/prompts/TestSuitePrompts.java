package akl.p4p.uoa.prompts;

import akl.p4p.uoa.models.Problem;

public class TestSuitePrompts {
  public static String getTestSuiteGenerationPrompt(Problem problem) throws Exception {
    String specificInstructions;
    String commonInstructions = getBaseTestSuitePrompt();
    switch (problem.getProgramLanguage()) {
      case C -> specificInstructions = getCSpecificTestSuiteInstructions();
      case JAVA -> specificInstructions = getJavaSpecificTestSuiteInstructions();
      default -> throw new Exception("The programming language selected is not supported");
    }
    ;
    return commonInstructions
        .replace("//VAR_LANGUAGE_SPECIFIC_INSTRUCTIONS", specificInstructions)
        .replace("//VAR_MODEL_SOLUTION", problem.getModelAnswer())
        .replace("//VAR_CONSTRAINTS", problem.getConstraints());
  }

  private static String getBaseTestSuitePrompt() {
    return """
		You are a test engineer responsible for generating a structured test suite for a single function implementation.

		The function implementation is:
		//VAR_MODEL_SOLUTION

		The functional constraints and expected behavior are:
		//VAR_CONSTRAINTS

		Generate a set of diverse and meaningful test cases to verify the function.

		Each test case must be represented as a JSON object with the following format:

		//VAR_LANGUAGE_SPECIFIC_INSTRUCTIONS
		  """;
  }

  private static String getCSpecificTestSuiteInstructions() {
    return """
			{
			  "code": "C snippet that declares inputs and prints the result using printf, if the function is void dont print just call it",
			  "expectedStdOut": "The exact expected output printed by the function"
			}

			Constraints:
			- Do not include the function implementation itself.
			- Include all necessary input declarations in each test.
			- Each test should use `printf` to print only the final result.
			- Assume `INT_MIN`, `INT_MAX`, and `stdlib.h` are available where relevant.
			- Dont include any imports or anything or function definition or return statements

			Example output:
			[
			  {
			    "code": "int arr[] = {1, 2, 3};\\nint result = calculateValues(arr, 3, 1, 2);\\nprintf(\\\"%d\\\", result);",
			    "expectedStdOut": "2"
			  },
			  ...
			]
			""";
  }

  private static String getJavaSpecificTestSuiteInstructions() {
    return """
			{
			  "code": "Java snippet that declares inputs and prints the result using System.out.print(), if the function is void dont print just call it",
			  "expectedStdOut": "The exact expected output printed by the function"
			}

			Constraints:
			- Do not include the function implementation itself.
			- Include all necessary input declarations in each test.
			- Each test should use `System.out.print()` to print only the final result.
			- Assume Java standard libraries are available where relevant.
			- Dont include any imports or anything or function definition or return statements

			Example output:
			[
			  {
			    "code": "int[] arr = {1, 2, 3};\nint result = calculateValues(arr, arr.length, 1, 2);\nSystem.out.print(result);",
			    "expectedStdOut": "2"
			  },
			  ...
			]
			""";
  }

  public static String getProblemStatementSystemPrompt() {
    return """
			You are a product owner crafting an intentionally ambiguous problem statement to guide a developer’s implementation.

			The implemented reference solution is provided between the markers:
			//VAR_MODEL_SOLUTION

			The explicit functional requirements (constraints) are provided between the markers:
			//VAR_CONSTRAINTS

			Your goal is to write a concise, open‑ended and ambiguous problem description that:
			  • Vaguely describes the essence of what needs to be built without prescribing details.
			  • Leaves room for elicitation on algorithm design, data structures, and edge case handling.
			  • Focuses on the core task (e.g., counting, searching, transforming).
			  • Avoids implementation specifics like language, loops vs. recursion, or error messages.

			Write one short sentence. For example:
			  Implement a function to count the number of integers between a and b in an array of length
			  Implement a function to search an array of length n for the smallest even value
			  Implement a function to find the first vowel in a string
			  Implement a function to find a word in a string
			  Implement a function to find the largest sum in a array

			Respond only with the problem statement (no commentary or formatting).
			""";
  }
}
