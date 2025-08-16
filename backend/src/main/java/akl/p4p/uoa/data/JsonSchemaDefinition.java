package akl.p4p.uoa.data;

import lombok.Getter;

@Getter
public class JsonSchemaDefinition {

  private static final String CLIENT_PROBE_SCHEMA =
      """
			{
			  "type": "object",
			  "properties": {
			    "message": {
			      "type": "string",
			      "description": "The response of the client with the persona of a non-technical person"
			    },
			    "can_answer": {
			      "type": "boolean",
			      "description": "If the client is able to answer the question without executing the code"
			    },
			    "has_asked": {
			      "type": "boolean",
			      "description": "Flag indicating if the user has asked a similar or identical question"
			    },
			    "test_case": {
			      "type": ["string", "null"],
			      "default": null,
			      "description": "Raw C snippet ONLY when TC triggers; otherwise null. Must declare variables, make one function call, and end with a single printf of the result; no comments/backticks/JSON/labels."
			    },
			    "constraint_targeting": {
			      "type": "number",
			      "description": "number indicating which constraint the user is aiming to find with their question, if their question doesn't apply to any constraint return -1"
			    },
			    "asked_expected_output": {
			      "type": "boolean",
			      "description": "True iff (1) the user explicitly asks for the expected result/behavior/output for a specific input or condition (including edge cases). A 'code test case' is a C snippet that uses the function signature’s variable names and ends with a single printf of the result. Examples that set this to true: 'If the input is empty, what happens?', 'For n = 5, what should it return?', 'Given [2,4,4], what is the output?'. False for general/open-ended requests like 'What do the inputs mean?', 'Give an example', or 'Provide a test case' (without specific values), and when `test_case` is null."
			    }
			  },
			  "required": [
			    "message",
			    "can_answer",
			    "has_asked",
			    "constraint_targeting",
			    "test_case",
			    "asked_expected_output"
			  ],
			  "additionalProperties": false
			}
			""";

  private static final String DUPLICATE_QUESTION_SCHEMA =
      """
			{
			  "type": "object",
			  "properties": {
			    "suggestion":{ "type": "string"  },
			    "isDuplicateQuestion":{ "type": "boolean"  }
			  },
			  "required": ["suggestion","isDuplicateQuestion"],
			  "additionalProperties": false
			}
			""";

  private static final String TEST_CASE_SCHEMA =
      """
			{
			  "type": "object",
			  "properties": {
			    "tests": {
			      "type": "array",
			      "items": {
			        "type": "object",
			        "properties": {
			          "code": {
						"type": "string",
						"description": "code for the test case."
					  },
			          "expectedStdOut": {
						"type": "string",
						"description": "expected output of the test case."
					  },
					  "explanation": {
						"type": "string",
						"description": "short explanation of what constraint this test case covers."
					  }
			        },
			        "required": ["code", "expectedStdOut","explanation"],
			        "additionalProperties": false
			      }
			    }
			  },
			  "required": ["tests"],
			  "additionalProperties": false
			}
			""";

  private static final String ORACLE_GENERATION_SCHEMA =
      """
			{
				"type": "object",
				"properties": {
					"probe": {
						"type": "string",
						"description": "default inputs to the function(s), including their typings if applicable"
					}
				},
				"required": ["probe"],
				"additionalProperties": false
			}
			 """;

  private static final String EXECUTION_PAYLOAD =
      """
			  {
			    "language": %s,
			    "version": %s,
			    "files": [
			      {
			        "content": %s
			      }
			    ]
			  }
			""";

  private static final String CODE_GENERATION_SCHEMA =
      """
			{
				"type": "object",
				"properties": {
					"source_code": {
					  "type": "string",
					  "description": "Only source code. No backticks, no comments, no markdown, no explanations — output must be pure code only."
					}
				},
				"required": ["source_code"],
				"additionalProperties": false
			}
			 """;

  private static final String FAULTY_SOLUTION_SCHEMA =
      """
				{
					"type": "object",
					"properties": {
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
										"type": "number",
										"description": "The specific constraint number this buggy version violates"
									}
								},
								"required": ["code", "violated_constraint"],
								"additionalProperties": false
							}
						}
					},
					"required": ["buggy_codes"],
					"additionalProperties": false
				}
			""";

  public static String getClientProbeSchema() {
    return CLIENT_PROBE_SCHEMA;
  }

  public static String getTestCaseSchema() {
    return TEST_CASE_SCHEMA;
  }

  public static String getOracleGenerationSchema() {
    return ORACLE_GENERATION_SCHEMA;
  }

  public static String getCodeGenerationSchema() {
    return CODE_GENERATION_SCHEMA;
  }

  public static String getFaultySolutionSchema() {
    return FAULTY_SOLUTION_SCHEMA;
  }
}
