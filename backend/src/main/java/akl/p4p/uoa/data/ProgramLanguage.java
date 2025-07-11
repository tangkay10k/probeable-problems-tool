package akl.p4p.uoa.data;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;
import java.util.Locale;

public enum ProgramLanguage {
  JAVA,
  C;

  @JsonValue
  public String toJson() {
    return name().toLowerCase(Locale.ROOT);
  }

  @JsonCreator
  public static ProgramLanguage fromJson(String value) {
    if (value == null) return null;
    return valueOf(value.toUpperCase(Locale.ROOT));
  }
}
