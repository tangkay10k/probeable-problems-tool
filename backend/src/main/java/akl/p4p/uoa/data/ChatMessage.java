package akl.p4p.uoa.data;

import java.time.Instant;
import lombok.Data;

@Data
public class ChatMessage {
  private String role;
  private String content;
  private Instant timestamp;
}
