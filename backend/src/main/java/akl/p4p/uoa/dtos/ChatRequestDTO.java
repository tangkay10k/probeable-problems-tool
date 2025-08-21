package akl.p4p.uoa.dtos;

import akl.p4p.uoa.enums.ProgramLanguage;
import lombok.Data;

@Data
public class ChatRequestDTO {
  private String prompt;
  private ProgramLanguage programLanguage;
  private String functionSignature;
}
