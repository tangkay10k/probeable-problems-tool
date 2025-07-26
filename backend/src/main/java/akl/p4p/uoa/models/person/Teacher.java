package akl.p4p.uoa.models.person;

import akl.p4p.uoa.data.Person;
import org.springframework.data.mongodb.core.mapping.Document;

@Document("teachers")
public class Teacher extends Person {
    public void updateTeacherFromPerson(Person person){
        if (person == null) return;
        this.setName(person.getName());
        this.setUserImage(person.getUserImage());
    }
}
