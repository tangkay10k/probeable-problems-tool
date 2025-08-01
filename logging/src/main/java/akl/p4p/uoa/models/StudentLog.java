package akl.p4p.uoa.models;

import lombok.Data;

import java.util.List;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import akl.p4p.uoa.data.PastedContent;

@Data
@Document(collection = "studentLog")
public class StudentLog {
  @Id
  private String problemAttemptId;

  private List<PastedContent> pastedContents;
}
