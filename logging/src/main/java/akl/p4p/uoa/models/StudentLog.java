package akl.p4p.uoa.models;

import akl.p4p.uoa.data.PastedContent;
import java.util.List;
import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@Document(collection = "studentLog")
public class StudentLog {
  @Id private String problemAttemptId;

  private List<PastedContent> pastedContents;
}
