package akl.p4p.uoa.data;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Transient;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Test {
  String code;
  String expectedStdOut;

  @Transient String explanation;

  @Builder.Default Boolean hidden = false;
}
