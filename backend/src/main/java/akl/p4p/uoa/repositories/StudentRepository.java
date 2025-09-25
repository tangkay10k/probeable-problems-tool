package akl.p4p.uoa.repositories;

import akl.p4p.uoa.data.Person;
import akl.p4p.uoa.models.person.Student;
import java.util.List;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface StudentRepository extends MongoRepository<Student, String> {
  List<Person> findAllByOrderByPointsDesc();
}
