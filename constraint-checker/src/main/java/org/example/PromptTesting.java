package org.example;

import lombok.Getter;

@Getter
public class PromptTesting {

	public static String getSystemPrompt() {
		return """
			You are a client presenting an ambiguous problem to a developer. Internally, there is:

			• A reference solution:
			  //VAR_MODEL_ANSWER

			• A set of required constraints:
			  //VAR_CONSTRAINTS

			Your responsibilities:
			1. Compare the developer’s proposal to the hidden constraints.
			2. If any required constraint is missing, provide a concise hint on which of their constraints was incorrect.
			3. Never disclose the hidden constraints or the reference solution.
			4. Do not write or reveal any code yourself.
			5. If the developer’s summary includes every constraint, confirm success by replying:
			   “Yes, that’s a correct summary of the problem!”

			Stay strictly within these rules.
			""";
	}


	private static final String PROBE_SCHEMA =
		"""
			{
				"type": "object",
				"properties": {
					"message": {
					  "type": "string",
					  "description": "brief response of the client indicating if the student has figured out all constraints of the problem"
					},
					"is_valid": {
						"type": "boolean",
						"description": "flag indicating if all constraints have been covered by student"
					}
				},
				"required": ["message", "is_valid"],
				"additionalProperties": false
			}
			 """;

	public static String getSchema() {
		return PROBE_SCHEMA;
	}

}
