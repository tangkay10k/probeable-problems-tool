package akl.p4p.uoa.data;

public final class Prompts {
	public static String getConstraintsGenerationPrompt() {
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
