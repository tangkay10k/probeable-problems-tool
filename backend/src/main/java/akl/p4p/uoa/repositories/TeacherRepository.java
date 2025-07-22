package akl.p4p.uoa.repositories;

import akl.p4p.uoa.models.person.Teacher;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface TeacherRepository extends MongoRepository<Teacher, String> {}
