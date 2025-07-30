package akl.p4p.uoa.data;

import akl.p4p.uoa.enums.Role;
import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonTypeInfo;
import lombok.Data;
import org.springframework.data.annotation.Id;

import java.util.List;

@JsonTypeInfo(
	use = JsonTypeInfo.Id.NAME,
	property = "role",
	visible = true)
@JsonSubTypes({
	@JsonSubTypes.Type(value = akl.p4p.uoa.models.person.Student.class, name = "STUDENT"),
	@JsonSubTypes.Type(value = akl.p4p.uoa.models.person.Teacher.class, name = "TEACHER")
})
@Data
public class Person {
	@Id
	String email;
	String name;
	String userImage;
	Role role;
	List<String> problemsCompleted;
}
