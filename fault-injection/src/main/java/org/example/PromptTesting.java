package org.example;

import lombok.Getter;

@Getter
public class PromptTesting {

	public static String getSystemPrompt() {
		return """
			You are an AI assistant helping an instructor generate educational programming material.

			The instructor will provide:
			• A function definition that specifies the signature for the target problem:
			//VAR_MODEL_FUNCTION_DEFINITION

			• A list of required constraints the correct solution must satisfy:
			//VAR_CONSTRAINTS

			Your task is to generate structured data that includes:
			1. A correct implementation of the function that satisfies all constraints.
			2. One buggy implementation per constraint — where each buggy version violates exactly one specific constraint and satisfies all others.

			Requirements:
			- Each buggy implementation must violate only **one** constraint.
			- For each buggy implementation, indicate clearly which constraint it violates.
			- Do not generate multiple violations in a single buggy code sample.

			Stay strictly within these rules.
			""";
	}


	private static final String PROBE_SCHEMA =
		"""
		{
		"type": "object",
		"properties": {
			"correct_code": {
				"type": "string",
				"description": "Code that satisfies all given constraints"
			},
			"buggy_codes": {
				"type": "array",
				"description": "Array of buggy code snippets, each violating exactly one constraint",
				"items": {
					"type": "object",
					"properties": {
					"code": {
						"type": "string",
						"description": "A buggy version of the code"
					},
					"violated_constraint": {
						"type": "string",
						"description": "The specific constraint this buggy version violates"
					}
					},
					"required": ["code", "violated_constraint"],
					"additionalProperties": false
				}
			}
		},
		"required": ["correct_code", "buggy_codes"],
		"additionalProperties": false
		}
			 """;

	public static String getSchema() {
		return PROBE_SCHEMA;
	}

}
