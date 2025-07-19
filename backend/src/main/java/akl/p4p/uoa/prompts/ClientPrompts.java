package akl.p4p.uoa.prompts;

import akl.p4p.uoa.data.ProgramLanguage;

public class ClientPrompts {

	public static String getClientInitialisationPrompt(
		ProgramLanguage problemLanguage,
		String problemStatement,
		String modelAnswer,
		String constraints) {

		String basePrompt = clientBasePrompt(problemStatement, modelAnswer, constraints);
		String specificInstructions;
		switch (problemLanguage) {
			case C -> specificInstructions = getCSpecificInstructions();
			case JAVA -> specificInstructions = getJavaSpecificInstructions();
			default -> throw new RuntimeException(
				"Programming language: " + problemLanguage + " does not exist!");
		}
		return basePrompt.replace("//VAR_LANGUAGE_SPECIFIC_INSTRUCTIONS", specificInstructions);
	}

	public static String clientBasePrompt(
		String problemStatement, String modelAnswer, String constraints) {
		String basePrompt =
			"""
					You are a client that a software developer must query to understand the expected behavior of a hidden function.
					Your role is to explain the Model Answer (confidential) to the student in plain terms, without revealing implementation details or specific values.

					Problem Statement:
					//VAR_PROBLEM_STATEMENT

					Model Answer (Confidential – Do NOT disclose to the student):
					//VAR_MODEL_ANSWER


					These are the constraints of the problem:
					//VAR_CONSTRAINTS

					Student’s Task:
					- After hearing the client’s explanation of the Model Answer, produce a concise, bullet-point list of the constraints outlined above.
					- Ensure each bullet is clear, direct, and covers exactly one requirement.
					- Keep the list succinct and avoid revealing any implementation details or specific values.
					- Return only the bullet-point list for client review.

					Client’s Behavior:
					- Respond neutrally to clarifying questions about expected behavior, inputs, edge cases, ordering, and output structure.
					- Avoid providing examples, specific values, or hints about internal logic or data structures.
					- If the student’s question is too vague, prompt them to specify which aspect they wish to clarify.
					- Do not generate code unless the student explicitly requests a test case after repeated clarification requests.
					- When generating test cases, the client should provide example inputs who's variable names match the function signature.
					//VAR_LANGUAGE_SPECIFIC_INSTRUCTIONS

					You should start the conversation by asking your developer the problem statement:

					For example:
					"Write me a function that returns a count of integers"
					"Write me a function to find the first vowel"
					"Write me a function that divides certain numbers"
				""";

		return basePrompt
			.replace("//VAR_PROBLEM_STATEMENT", problemStatement)
			.replace("//VAR_MODEL_ANSWER", modelAnswer)
			.replace("//VAR_CONSTRAINTS", constraints);
	}

	private static String getCSpecificInstructions() {
		return """
			- When a test case is requested, provide only example inputs to the function, matching the signature along with an explanation of what the parameters test along with their data types.

			For example:
			function signature: int CountBetween(int values, int n , int a, int b)

			You should return:
			int[] values = {1,2,3,4,5};
			int n = 5;
			int a = 0;
			int b = 5;
			""";
	}

	private static String getJavaSpecificInstructions() {
		// TODO: write java Specific instructions.
		return null;
	}
}
