package akl.p4p.uoa.models;

import lombok.AllArgsConstructor;
import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@Document("authTokens")
@AllArgsConstructor
public class AuthToken {
    @Id private String token;
}
