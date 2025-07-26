package akl.p4p.uoa.controllers;

import akl.p4p.uoa.data.Person;
import akl.p4p.uoa.dtos.PersonCodeDTO;
import akl.p4p.uoa.services.JwtService;
import akl.p4p.uoa.services.OneTimeCodeService;
import akl.p4p.uoa.services.PersonService;
import org.springframework.http.HttpStatus;
import akl.p4p.uoa.models.person.Student;
import akl.p4p.uoa.models.person.Teacher;
import akl.p4p.uoa.enums.Role;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/person")
public class PersonController {

  PersonService personService;
  JwtService jwtService;

  public PersonController(
          PersonService personService, JwtService jwtService) {
    this.personService = personService;
    this.jwtService = jwtService;
  }

  @PostMapping("/login")
  public ResponseEntity<?> loginPerson(@RequestBody Person person) {
    String token = jwtService.generateToken(person.getEmail(), person.getRole().toString());

    if (person.getRole() == Role.TEACHER) {

      Teacher teacher = personService.getTeacher(person);

      return ResponseEntity.ok()
              .header("Authorization", "Bearer " + token)
              .body(teacher);

    } else if(person.getRole() == Role.STUDENT) {
      Student student = personService.getStudent(person);

      return ResponseEntity.ok()
              .header("Authorization", "Bearer " + token)
              .body(student);
    }

    return ResponseEntity.status(HttpStatus.BAD_REQUEST)
            .body("Unknown role: " + person.getRole());
  }
}

