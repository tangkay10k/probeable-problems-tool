package akl.p4p.uoa.data;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OracleExecution {

  private String testCase;
  private String expectedOutput;
}
