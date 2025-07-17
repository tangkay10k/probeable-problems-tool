package akl.p4p.uoa.services;

import org.springframework.stereotype.Service;

import akl.p4p.uoa.data.Person;
import akl.p4p.uoa.models.person.Student;
import akl.p4p.uoa.models.person.Teacher;
import akl.p4p.uoa.repositories.StudentRepository;
import akl.p4p.uoa.repositories.TeacherRepository;

@Service
public class PersonService {
    private final StudentRepository studentRepository;
    private final TeacherRepository teacherRepository;

    public PersonService(StudentRepository studentRepository, TeacherRepository teacherRepository) {
        this.studentRepository = studentRepository;
        this.teacherRepository = teacherRepository;
    }

    public void createPerson(Person person) {
        if (person instanceof Student student) {
            studentRepository.save(student);
        } else if (person instanceof Teacher teacher) {
            teacherRepository.save(teacher);
        } else {
            throw new IllegalArgumentException("Unsupported person type: " + person.getClass());
        }
    }
}
