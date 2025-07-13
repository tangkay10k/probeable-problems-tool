package akl.p4p.uoa.prompts;

import akl.p4p.uoa.models.Problem;

public final class ProblemGenerationPrompts {
  public static String getConstraintsGenerationPrompt(Problem problem) {
    String basePrompt =
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
    return basePrompt.replace("//VAR_MODEL_SOLUTION", problem.getModelAnswer());
  }

  public static String getProblemStatementSystemPrompt(Problem problem) {
    String basePrompt =
        """
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
    return basePrompt
        .replace("//VAR_MODEL_SOLUTION", problem.getModelAnswer())
        .replace("//VAR_CONSTRAINTS", problem.getConstraints());
  }
}
