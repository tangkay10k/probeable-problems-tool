package akl.p4p.uoa.dtos;

import akl.p4p.uoa.data.ChatContent;
import lombok.Data;

@Data
public class TestCaseOutputDTO {
  private String sessionId;
  private String questionAsked;
  private ChatContent llmResponse;
  private String output;
  private String testCase;
  private String functionName;
}
