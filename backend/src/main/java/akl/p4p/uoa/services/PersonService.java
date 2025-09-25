package akl.p4p.uoa.services;

import akl.p4p.uoa.data.Person;
import akl.p4p.uoa.models.person.Student;
import akl.p4p.uoa.models.person.Teacher;
import akl.p4p.uoa.repositories.StudentRepository;
import akl.p4p.uoa.repositories.TeacherRepository;
import java.util.HashSet;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.Optional;
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
              if (!(person instanceof Student newStudent)) {
                throw new IllegalArgumentException("Person must be a Student");
              }

              return studentRepository.save(newStudent);
            });
  }

  public Person findPersonByEmail(String email) {
    Optional<Student> student = studentRepository.findById(email);

    if (student.isPresent()) {
      return student.get();
    }

    Optional<Teacher> teacher = teacherRepository.findById(email);
    return teacher.orElseThrow(
        () -> new NoSuchElementException("User with email: " + email + " does not exist!"));
  }

  public Person updateProblemsCompleted(String userEmail, String problemId) {
    var user = findPersonByEmail(userEmail);

    if (user.getProblemsCompleted() == null) {
      user.setProblemsCompleted(new HashSet<>());
    }

    user.getProblemsCompleted().add(problemId);
    return updateUser(user);
  }

  public Person updateUser(Person user) {
    return user instanceof Student
        ? studentRepository.save((Student) user)
        : teacherRepository.save((Teacher) user);
  }

  public Person updateNumberOfPointsAccrued(String userEmail, double points) {
    var user = findPersonByEmail(userEmail);
    user.setPoints(user.getPoints() + points);
    return updateUser(user);
  }

  public List<Person> getStudentsOrderedByHighestPoints() {
    return studentRepository.findAllByOrderByPointsDesc();
  }
}
