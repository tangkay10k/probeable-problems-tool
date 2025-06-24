package org.example;

import lombok.Getter;

@Getter
public class Prompts {

	public static String getConstraintsSystemPrompt() {
		return
			"""
				You are a requirements author drafting clear, testable acceptance criteria for a function implementation.
				The developer will reference the implementation provided below:
							
				//VAR_MODEL_SOLUTION
						
				Based on this reference solution, generate a bullet-point list of constraints and acceptance criteria.
				Each bullet should describe exactly one observable behavior or rule that the implementation must satisfy, 
				including:
				  • Typical use cases (input → expected output)
				  • Edge cases and boundary conditions
				  • Handling of invalid or unexpected inputs
				  • Performance or resource limits (if applicable)
							
				Format each constraint as a stand‑alone, testable requirement without prescribing implementation details.
				""";
	}

	public static String getTestSuiteSystemPrompt() {
		return """
			You are a test engineer tasked with producing a thorough test suite for a single function implementation.

			The reference implementation is:
			//VAR_MODEL_SOLUTION

			The functional constraints are:
			//VAR_CONSTRAINTS

			Respond _only_ with the complete test-suite source code (including comments) as plain text—no JSON, no Markdown fences, and no extra prose. 
			This response should be a single string containing exactly the source you’d save into your .c (or .txt) file.
			""";
	}


	private static final String CONSTRAINT_GENERATION_SCHEMA =
		"""
			{
				"type": "object",
				"properties": {
					"response": {
					  "type": "string",
					  "description": "A numbered list of constraints that the function behaviour has to adhere to. The constraints are based on the model answer in the initial system prompt."
					}
				},
				"required": ["response"],
				"additionalProperties": false
			}
			 """;

	public static String getConstraintGenerationSchema() {
		return CONSTRAINT_GENERATION_SCHEMA;
	}

	public static String getProblemStatementSystemPromptBeta() {
		return """
			You are a client who has the job to give a developer an ambiguous problem statement for a particular bit of code they have to write.

			The reference implementation is:
			//VAR_MODEL_SOLUTION

			The functional constraints are:
			//VAR_CONSTRAINTS

			Your task is to create a problem statement that is intentionally vague and open to interpretation. Here are some examples:
			- Implement a function to count the number of integers between a and b in an array of length
			- Implement a function to search an array of length n for the smallest even value
			- Implement a function to find the first vowel in a string
			- Implement a function to find a word in a string
			- Implement a function to find the largest sum in a array
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
