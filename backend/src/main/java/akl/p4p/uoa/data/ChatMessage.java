package akl.p4p.uoa.data;

import java.time.Instant;
import lombok.Data;

@Data
public class ChatMessage {
  private String role;
  private ChatContent content;
  private Instant timestamp;
}
