package akl.p4p.uoa.data;

public final class Prompts {
	public static String getConstraintsGenerationPrompt() {
		return
			"""
			You are a requirements author. Produce a numbered list of clear, testable acceptance criteria for the provided solution.
			The developer will reference the implementation provided below:
			
		   //VAR_MODEL_SOLUTION
			   
			Based on this reference solution, generate a numbered list of constraints and acceptance criteria.
			Each requirement should describe exactly one observable rule, including:
			   • Edge cases and boundary conditions
			   • Handling of invalid or unexpected inputs
			Format each requirement as standalone and testable, without prescribing implementation details.
			
			-- Few‑Shot Examples --
			Here are example responses illustrating the desired format:
			
			Example 1:
			1. The function should count between a and b exclusively.
			2. The order of a and b does not matter.
			3. The function should return an integer count of the number of elements that are strictly between a and b.
			
			Example 2:
			1. If the array contains no even numbers, the function should print "No evens" and return.
			2. The function should print the indices of the smallest even number in the array.
			3. If there are duplicate smallest even numbers, the function should print all their indices.
			4. The function should print the indices in reverse order.
			
			Example 3:
			1. If the input string does not contain any vowels, the function should "-"
			2. If the input string is empty, the function should return "-"
			3. If the input string contains more than one vowel, return the first vowel lexicographically.
			4. If the input string contains only one vowel, return that vowel.
			5. The input string can contain upper and lowercase letters.
			6. The output should be lowercase vowels.
			7. y does not count as a vowel.
			""";
	}

	public static String getTestSuiteGenerationPrompt() {
		return """
			You are a test engineer tasked with producing a thorough test suite for a single function implementation.
			
			The reference implementation will be injected in this placeholder:
			//VAR_IMPLEMENTATION
			
			The functional constraints are:
			//VAR_CONSTRAINTS
			
			When generating the test suite, include exactly after import statements:
			
			/* Function under test will be injected in this placeholder */
			//VAR_IMPLEMENTATION
			
			Include all necessary headers and helper code, then provide a complete set of tests covering each constraint.
			Respond _only_ with the complete test-suite source code (including comments) as plain text—no JSON, no Markdown fences, and no extra prose. This response should be a single string containing exactly the source you’d save into your .c file.
			""";
	}



    public static String duplicateQuestionVerifier() {
        return """
                You are an AI assistant that checks if a given question has been asked before.
                You are provided with a list of previous questions and a new question.
                - If the question has been asked before (exact or similar), respond with:
                  - "isDuplicateQuestion": true
                  - "suggestion": Explain they have already asked this question before and tell them to try asking different type of questions.
                - If the question is new, respond with:
                  - "isDuplicateQuestion": false
                  - "suggestion": Provide a suggestion to rephrase or ask a related question.

                Previous Questions: [%s]
                New Question: %s
                """;
    }
}
