package akl.p4p.uoa.models;

import akl.p4p.uoa.data.ChatMessage;
import java.util.Date;
import java.util.List;

import akl.p4p.uoa.data.ProgramLanguage;
import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.Transient;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@Document("problemAttempts")
public class ProblemAttempt {

  @Id private String id;

  private String studentEmail; // TODO: Potentially swap to a student object.

  private Date createdDate;

  private String problemId;

  private ProgramLanguage problemLanguage;

  private String chatHistoryId;

  @Transient List<ChatMessage> messageList;
}
