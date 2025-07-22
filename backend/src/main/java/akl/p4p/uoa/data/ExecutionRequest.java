package akl.p4p.uoa.data;

import akl.p4p.uoa.enums.ProgramLanguage;
import lombok.Data;

@Data
public class ExecutionRequest {
  private ProgramLanguage programLanguage;
  private String languageVersion;
  private String input;
  private String problemId;
}
