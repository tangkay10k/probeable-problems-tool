package akl.p4p.uoa.data;

import org.springframework.data.annotation.Id;

import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonTypeInfo;

import lombok.Data;

@JsonTypeInfo(use = JsonTypeInfo.Id.NAME, include = JsonTypeInfo.As.PROPERTY, property = "role", visible = true)
@JsonSubTypes({
        @JsonSubTypes.Type(value = akl.p4p.uoa.models.person.Student.class, name = "STUDENT"),
        @JsonSubTypes.Type(value = akl.p4p.uoa.models.person.Teacher.class, name = "TEACHER")
})
@Data
public class Person {
    @Id
    String email;
    Role role;
}
