package akl.p4p.uoa.llm;

import static akl.p4p.uoa.utils.PromptUtils.readFileFromResources;

import java.io.IOException;

public class LLMResponseSchemas {

  public static final String CLIENT_RESPONSE = "client-response.json";
  public static final String CODE_GENERATION = "code-generation.json";
  public static final String FAULTY_SOLUTION = "faulty-solution-generation.json";
  public static final String ORACLE_GENERATION = "oracle-generation.json";
  public static final String TEST_CASE_GENERATION = "test-case-generation.json";
  private static final String RESPONSE_SCHEMA_RESOURCE_DIR = "response-schemas/";

  public static String getSchemaDefinition(String fileName) throws IOException {
    return readFileFromResources(RESPONSE_SCHEMA_RESOURCE_DIR + fileName);
  }
}
