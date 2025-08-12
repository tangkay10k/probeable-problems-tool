package akl.p4p.uoa.dtos;

import akl.p4p.uoa.data.ChatMessage;
import lombok.Data;

@Data
public class MessageDTO {
  private String sessionId;
  private String problemAttemptId;
  private ChatMessage chatMessage;
}
