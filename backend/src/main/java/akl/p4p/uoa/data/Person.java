package akl.p4p.uoa.data;

import akl.p4p.uoa.enums.Role;
import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonTypeInfo;
import java.util.Set;
import lombok.Data;
import org.springframework.data.annotation.Id;

@JsonTypeInfo(use = JsonTypeInfo.Id.NAME, property = "role", visible = true)
@JsonSubTypes({
  @JsonSubTypes.Type(value = akl.p4p.uoa.models.person.Student.class, name = "STUDENT"),
  @JsonSubTypes.Type(value = akl.p4p.uoa.models.person.Teacher.class, name = "TEACHER")
})
@Data
public class Person {
  @Id String email;
  String name;
  String userImage;
  Role role;
  Set<String> problemsCompleted;
}
