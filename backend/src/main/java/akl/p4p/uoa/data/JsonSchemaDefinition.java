package akl.p4p.uoa.data;

import lombok.Getter;

@Getter
public class JsonSchemaDefinition {

    private static final String SCHEMA = """
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

    public static String getSchema() {
        return SCHEMA;
    }
}
