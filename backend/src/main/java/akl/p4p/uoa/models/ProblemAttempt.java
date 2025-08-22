package akl.p4p.uoa.models;

import akl.p4p.uoa.data.ChatMessage;
import akl.p4p.uoa.data.OracleExecution;
import akl.p4p.uoa.enums.ProgramLanguage;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.Transient;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@Document("problemAttempts")
public class ProblemAttempt {

  @Transient private List<ChatMessage> messageList;
  @Id private String id;
  private String studentEmail;
  private Date createdDate;
  private String problemId;
  private ProgramLanguage problemLanguage;
  private String chatHistoryId;
  private String codeSubmission;
  private int testsPassed = -1;
  private String agentPrompt;
  private List<OracleExecution> oracleExecutionHistory;
  private int failedAttempts;
  private double finalScore;
  private boolean isCompleted = false;

  // Used to store frequency of eq class targeted by student: [constraintNum, freq]
  private Map<Integer, Integer> clientEquivalenceMap = new HashMap<>();
  private Map<Integer, Integer> oracleEquivalenceMap = new HashMap<>();
}
