package akl.p4p.uoa.dtos;

import akl.p4p.uoa.data.Person;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PersonCodeDTO {
	String code;
	Person person;
}
