package akl.p4p.uoa.utils;

import akl.p4p.uoa.data.OracleResponse;
import com.fasterxml.jackson.databind.ObjectMapper;

public class JsonUtils {

  public static String parseOracleJsonResponse(String jsonResponse) {
    ObjectMapper objectMapper = new ObjectMapper();
    try {
      OracleResponse response = objectMapper.readValue(jsonResponse, OracleResponse.class);
      return response.getProbe();
    } catch (Exception e) {
      throw new RuntimeException("Failed to parse LLM generated oracle");
    }
  }
}
