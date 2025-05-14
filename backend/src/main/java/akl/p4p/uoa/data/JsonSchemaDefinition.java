package akl.p4p.uoa.data;

import lombok.Getter;

@Getter
public class JsonSchemaDefinition {

  private static final String PROBE_SCHEMA = """
      {
        "type": "object",
        "properties": {
          "explanation":{ "type": "string"  }
        },
        "required": ["explanation"],
        "additionalProperties": false
      }
      """;

  private static final String DUPLICATE_QUESTION_SCHEMA = """
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

  private static final String EXECUTION_PAYLOAD = """
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

  public static String getProbeSchema() {
    return PROBE_SCHEMA;
  }

  public static String getDuplicateQuestionSchema() {
    return DUPLICATE_QUESTION_SCHEMA;
  }

  public static String getExecutionPayload() {
    return EXECUTION_PAYLOAD;
  }
}
