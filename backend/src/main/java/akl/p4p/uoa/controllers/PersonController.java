package akl.p4p.uoa.controllers;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import akl.p4p.uoa.data.Person;
import akl.p4p.uoa.data.PersonCodeDTO;
import akl.p4p.uoa.services.JwtService;
import akl.p4p.uoa.services.OneTimeCodeService;
import akl.p4p.uoa.services.PersonService;

@RestController
@RequestMapping("/api/person")
public class PersonController {

    OneTimeCodeService oneTimeCodeService;
    PersonService personService;
    JwtService jwtService;

    public PersonController(PersonService personService,
            OneTimeCodeService oneTimeCodeService, JwtService jwtService) {
        this.oneTimeCodeService = oneTimeCodeService;
        this.personService = personService;
        this.jwtService = jwtService;
    }

    @PostMapping("/signup")
    public ResponseEntity<String> createPerson(@RequestBody PersonCodeDTO personCodeDTO) {
        Person person = personCodeDTO.getPerson();
        String code = personCodeDTO.getCode();

        if (!oneTimeCodeService.verifyCode(person.getEmail(), code)) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Code supplied is incorrect or expired");
        }

        if (personService.checkIfEmailUsed(person)) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("This email is already being used");
        }

        personService.createPerson(person);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/login")
    public ResponseEntity<String> loginPerson(@RequestBody PersonCodeDTO personCodeDTO) {
        Person person = personCodeDTO.getPerson();
        String code = personCodeDTO.getCode();

        if (oneTimeCodeService.verifyCode(person.getEmail(), code)) {
            String token = jwtService.generateToken(person.getEmail(), person.getRole().toString());

            return ResponseEntity
                    .ok()
                    .header("Authorization", "Bearer " + token).build();
        } else {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Code supplied is incorrect or expired");
        }
    }

    @PostMapping("/code")
    public ResponseEntity<String> sendCode(@RequestBody String email) {
        try {
            oneTimeCodeService.sendCode(email);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.toString());
        }
    }

}
