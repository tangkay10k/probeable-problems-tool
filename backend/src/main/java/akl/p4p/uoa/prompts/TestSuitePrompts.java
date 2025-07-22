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
}
