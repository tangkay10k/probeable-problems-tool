package akl.p4p.uoa.services;

import akl.p4p.uoa.data.Person;
import akl.p4p.uoa.models.person.Student;
import akl.p4p.uoa.models.person.Teacher;
import akl.p4p.uoa.repositories.StudentRepository;
import akl.p4p.uoa.repositories.TeacherRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class PersonService {
  private final StudentRepository studentRepository;
  private final TeacherRepository teacherRepository;

  public PersonService(StudentRepository studentRepository, TeacherRepository teacherRepository) {
    this.studentRepository = studentRepository;
    this.teacherRepository = teacherRepository;
  }

  public Teacher getTeacher(Person person) {
    return teacherRepository
        .findById(person.getEmail())
        .map(
            existingTeacher -> {
              existingTeacher.updateTeacherFromPerson(person);

              return teacherRepository.save(existingTeacher);
            })
        .orElseThrow(
            () ->
                new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED, "You are not authorised to login as teacher."));
  }

  public Student getStudent(Person person) {
    return studentRepository
        .findById(person.getEmail())
        .map(
            existingStudent -> {
              existingStudent.updateStudentFromPerson(person);
              return studentRepository.save(existingStudent);
            })
        .orElseGet(
            () -> {
              if (!(person instanceof Student)) {
                throw new IllegalArgumentException("Person must be a Student");
              }

              Student newStudent = (Student) person;
              return studentRepository.save(newStudent);
            });
  }
}
