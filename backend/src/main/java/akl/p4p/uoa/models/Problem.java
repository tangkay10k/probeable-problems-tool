package akl.p4p.uoa.models;

import akl.p4p.uoa.data.BuggyCodes.BuggyCode;
import akl.p4p.uoa.data.Test;
import akl.p4p.uoa.enums.ProblemType;
import akl.p4p.uoa.enums.ProgramLanguage;
import java.util.List;
import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@Document("problems")
public class Problem {

  @Id private String id;

  // Ambiguous problem to start the question given to students.
  private String problemStatement;

  private String modelAnswer;

  private String constraints;

  private List<Test> testSuite;

  private ProgramLanguage programLanguage;

  private ProblemType problemType;

  private String defaultProbe;

  private List<BuggyCode> buggy_codes;

  private String functionName;
}
