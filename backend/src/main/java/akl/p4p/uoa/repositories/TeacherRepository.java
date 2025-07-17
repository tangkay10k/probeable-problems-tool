package akl.p4p.uoa.repositories;

import org.springframework.data.mongodb.repository.MongoRepository;

import akl.p4p.uoa.models.person.Teacher;

public interface TeacherRepository extends MongoRepository<Teacher, String> {

}