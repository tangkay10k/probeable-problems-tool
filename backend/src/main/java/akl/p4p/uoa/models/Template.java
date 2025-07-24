package akl.p4p.uoa.models;

import akl.p4p.uoa.enums.ProgramLanguage;
import akl.p4p.uoa.enums.TemplateType;
import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.CompoundIndexes;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@Document(collection = "templates")
@CompoundIndexes({
  @CompoundIndex(name = "lang_type_unique_idx", def = "{'programLanguage' : 1, 'type': 1}", unique = true)
})
public class Template {
  @Id
  private String id;

  private ProgramLanguage programLanguage;

  private TemplateType type;

  private String template;
}
