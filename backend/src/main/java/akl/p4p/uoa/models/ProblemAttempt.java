package akl.p4p.uoa.models;

import akl.p4p.uoa.data.ChatMessage;
import akl.p4p.uoa.enums.ProgramLanguage;
import java.util.Date;
import java.util.List;
import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.Transient;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@Document("problemAttempts")
public class ProblemAttempt {

  @Transient private List<ChatMessage> messageList;
  @Id private String id;
  private String studentEmail; // TODO: Potentially swap to a student object.
  private Date createdDate;
  private String problemId;
  private ProgramLanguage problemLanguage;
  private String chatHistoryId;
  private String codeSubmission;
}
