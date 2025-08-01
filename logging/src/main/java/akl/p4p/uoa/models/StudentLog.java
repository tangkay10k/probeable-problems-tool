package akl.p4p.uoa.models;

import lombok.Data;

import java.util.List;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@Document(collection = "studentLog")
public class StudentLog {
  @Id
  private String problemAttemptId;

  private List<String> pastedContent;
}
