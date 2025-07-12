package akl.p4p.uoa.models;

import akl.p4p.uoa.data.ProgramLanguage;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document("testTemplate")
public class TestTemplate {
  @Id ProgramLanguage programLanguage;
  String template;
}
