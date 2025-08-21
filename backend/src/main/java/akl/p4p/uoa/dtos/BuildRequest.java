package akl.p4p.uoa.dtos;

import lombok.Data;

@Data
public class BuildRequest {
  private String problemId;
  private String prompt;
}
