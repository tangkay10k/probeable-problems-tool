package akl.p4p.uoa.data;

import lombok.Getter;

@Getter
public class JsonSchemaDefinition {

  private static final String PROBE_SCHEMA = """
      {
        "type": "object",
        "properties": {
          "is_valid":   { "type": "boolean" },
          "explanation":{ "type": "string"  }
        },
        "required": ["is_valid", "explanation"],
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

  public static String getExecutionPayload() {
    return EXECUTION_PAYLOAD;
  }
}
