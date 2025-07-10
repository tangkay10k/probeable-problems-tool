package akl.p4p.uoa.data;

import lombok.Data;

@Data
public class MessageDTO {
  private String sessionId;
  private ChatMessage chatMessage;
}
