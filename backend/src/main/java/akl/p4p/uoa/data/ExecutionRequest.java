package akl.p4p.uoa.data;

import lombok.Data;

@Data
public class ExecutionRequest {
    private ProgramLanguage programLanguage;
    private String input;
    private String problemId;
}
