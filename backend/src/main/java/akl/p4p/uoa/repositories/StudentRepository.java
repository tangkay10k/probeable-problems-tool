package akl.p4p.uoa.repositories;

import org.springframework.data.mongodb.repository.MongoRepository;

import akl.p4p.uoa.models.person.Student;

public interface StudentRepository extends MongoRepository<Student, String>{
    
}