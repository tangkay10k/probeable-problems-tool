package akl.p4p.uoa.models;

import akl.p4p.uoa.data.ChatMessage;
import java.util.List;
import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@Document("chatHistories")
public class ChatHistory {

  @Id private String sessionId;

  private List<ChatMessage> messages;
}
