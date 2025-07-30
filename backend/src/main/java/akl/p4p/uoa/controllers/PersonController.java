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
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import static akl.p4p.uoa.constants.AuthConstants.*;

@RestController
@RequestMapping("/api/person")
public class PersonController {

	PersonService personService;
	JwtService jwtService;
	AuthTokenService authTokenService;

	public PersonController(
		PersonService personService, JwtService jwtService, AuthTokenService authTokenService) {
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
			return ResponseEntity.ok()
				.header(P4P_AUTH_HEADER, BEARER_PREFIX + token)
				.body(teacher);

		} else if (person.getRole() == Role.STUDENT) {
			Student student = personService.getStudent(person);

			authTokenService.createToken(token);
			return ResponseEntity.ok()
				.header(P4P_AUTH_HEADER, BEARER_PREFIX + token)
				.body(student);
		}

		return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Unknown role: " + person.getRole());
	}

	@PostMapping("/logout")
	public ResponseEntity<String> logoutPerson(
		@RequestHeader(value = P4P_AUTH_HEADER, required = false) String authHeader) {

		if (authHeader == null || !authHeader.startsWith(BEARER_PREFIX)) {
			return ResponseEntity.badRequest()
				.body("Missing or invalid " + P4P_AUTH_HEADER + " header");
		}

		String token = authHeader.substring(BEARER_PREFIX.length());

		authTokenService.deleteToken(token);

		return ResponseEntity.ok("Logout successful");
	}

	/**
	 * Endpoint used to get a fresh copy of a user's profile without explicitly logging them out.
	 * Assumes that the user is already logged in.
	 */
	@GetMapping("/silently")
	@PreAuthorize(IS_AUTHENTICATED)
	public ResponseEntity<Person> logUserInSilently(@RequestParam String userEmail) {
		return ResponseEntity.ok(personService.findPersonByEmail(userEmail));
	}
}
