package akl.p4p.uoa.data;

import akl.p4p.uoa.enums.ProbeType;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EquivalenceClassRequest {
  ProbeType probeType;
  String result;
  List<String> buggyOutputs;
}
