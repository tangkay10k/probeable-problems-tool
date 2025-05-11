package akl.p4p.uoa.data;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ThoughtProcess {
    private String problemId;
    private String input;
}
