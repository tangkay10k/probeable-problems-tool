package akl.p4p.uoa.controllers;

import akl.p4p.uoa.constants.AuthConstants;
import akl.p4p.uoa.data.Person;
import akl.p4p.uoa.enums.Role;
import akl.p4p.uoa.models.person.Student;
import akl.p4p.uoa.models.person.Teacher;
import akl.p4p.uoa.services.AuthTokenService;
import akl.p4p.uoa.services.JwtService;
import akl.p4p.uoa.services.PersonService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/person")
public class PersonController {

  PersonService personService;
  JwtService jwtService;
  AuthTokenService authTokenService;

  public PersonController(PersonService personService, JwtService jwtService, AuthTokenService authTokenService) {
    this.personService = personService;
    this.jwtService = jwtService;
    this.authTokenService = authTokenService;
  }

  @PostMapping("/login")
  public ResponseEntity<?> loginPerson(@RequestBody Person person) {
    String token = jwtService.generateToken(person.getEmail(), person.getRole().toString());

    if (person.getRole() == Role.TEACHER) {

      Teacher teacher = personService.getTeacher(person);

      authTokenService.createToken(token);
      return ResponseEntity.ok().header(AuthConstants.P4P_AUTH_HEADER, "Bearer " + token).body(teacher);

    } else if (person.getRole() == Role.STUDENT) {
      Student student = personService.getStudent(person);

      authTokenService.createToken(token);
      return ResponseEntity.ok().header(AuthConstants.P4P_AUTH_HEADER, "Bearer " + token).body(student);
    }

    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Unknown role: " + person.getRole());
  }

  @PostMapping("/logout")
  public ResponseEntity<String> logoutPerson(
      @RequestHeader(value = AuthConstants.P4P_AUTH_HEADER, required = false) String authHeader) {

    if (authHeader == null || !authHeader.startsWith("Bearer ")) {
      return ResponseEntity.badRequest().body("Missing or invalid " +AuthConstants.P4P_AUTH_HEADER+" header");
    }

    String token = authHeader.substring(7);

    authTokenService.deleteToken(token);

    return ResponseEntity.ok("Logout successful");
  }

}
