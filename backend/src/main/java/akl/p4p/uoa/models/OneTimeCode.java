package akl.p4p.uoa.models;

import java.time.LocalDateTime;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Document("oneTimeCodes")
public class OneTimeCode {
    @Id
    String email;
    String code;
    LocalDateTime date;
}
