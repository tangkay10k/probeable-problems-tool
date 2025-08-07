package akl.p4p.uoa.data;

import java.util.Date;
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
  private Date timestamp;
}
