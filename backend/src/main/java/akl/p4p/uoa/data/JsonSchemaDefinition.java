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
      			"type": "string",
      			"description": "The test case generated if the question has been asked before and the user requests for a test case to be generated, along with an explanation of the test case."
      		},
      		"is_constraint": {
      			"type": "number",
      			"description": "number indicating which constraint the user is aiming to find with their question, if their question doesn't apply to any constraint return -1"
      		}
      	},
      	"required": ["message", "can_answer", "has_asked", "is_constraint", "test_case"],
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
                "code": { "type": "string" },
                "expectedStdOut": { "type": "string" }
              },
              "required": ["code", "expectedStdOut"],
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
				"source_code": {
				  "type": "string",
				  "description": "The main file containing the code for the problem"
				},
				"default_probes": {
					"type": "string",
					"description": "default inputs to the function(s), including their typings if applicable"
				}
			},
			"required": ["source_code", "default_probes"],
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

  public static String getClientProbeSchema() {
    return CLIENT_PROBE_SCHEMA;
  }

  public static String getTestCaseSchema() {
    return TEST_CASE_SCHEMA;
  }

  public static String getExecutionPayload() {
    return EXECUTION_PAYLOAD;
  }

  public static String getOracleGenerationSchema() {
    return ORACLE_GENERATION_SCHEMA;
  }
}
