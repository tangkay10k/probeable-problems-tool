package akl.p4p.uoa.data;

import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class BuggyCodes {

  public List<BuggyCode> buggy_codes;

  @Data
  @AllArgsConstructor
  @NoArgsConstructor
  public static class BuggyCode {
    public String code;
    public String violated_constraint;
  }
}
