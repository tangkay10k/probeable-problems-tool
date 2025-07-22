package akl.p4p.uoa.models.person;

import akl.p4p.uoa.data.Person;
import java.util.List;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@EqualsAndHashCode(callSuper = true)
@Document("students")
public class Student extends Person {
  List<String> problemsCompleted;
}
