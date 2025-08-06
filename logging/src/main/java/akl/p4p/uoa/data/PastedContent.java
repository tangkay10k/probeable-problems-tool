package akl.p4p.uoa.data;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PastedContent {
  private String pastedContent;
  private String afterPastedContent;
}
