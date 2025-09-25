package akl.p4p.uoa.dtos;

import akl.p4p.uoa.data.Person;
import com.fasterxml.jackson.annotation.JsonAutoDetect;

@JsonAutoDetect(fieldVisibility = JsonAutoDetect.Visibility.ANY)
public class PersonDTO {

  String email;
  String name;
  String userImage;
  double points = 0;

  public static PersonDTO convertPersonToDtoForLeaderboard(Person person) {
    var dto = new PersonDTO();
    String[] names = person.getName().split(" ");
    char firstNameInitial = names[0].charAt(0);
    String lastName = names[names.length - 1];

    dto.name = firstNameInitial + ". " + lastName;
    dto.userImage = person.getUserImage();
    dto.points = person.getPoints();
    return dto;
  }

  public static PersonDTO convertPersonToDto(Person person) {
    var dto = new PersonDTO();
    dto.email = person.getEmail();
    dto.name = person.getName();
    dto.userImage = person.getUserImage();
    dto.points = person.getPoints();
    return dto;
  }
}
