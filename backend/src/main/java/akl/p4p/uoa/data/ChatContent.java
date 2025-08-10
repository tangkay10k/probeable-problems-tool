package akl.p4p.uoa.data;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ChatContent {
    public ChatContent(String message) {
        this.message = message;
    }

    private String message;
    private boolean can_answer;
    private boolean has_asked;
    private String test_case;
    private int is_constraint;
    private boolean asked_expected_output;
}
