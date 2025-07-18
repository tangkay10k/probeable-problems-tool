package akl.p4p.uoa.models.person;

import java.util.List;

import org.springframework.data.mongodb.core.mapping.Document;

import akl.p4p.uoa.data.Person;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
@Document("students")
public class Student extends Person {
    List<String> problemsCompeleted;
}
