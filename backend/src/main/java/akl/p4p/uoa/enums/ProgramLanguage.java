package akl.p4p.uoa.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;
import java.util.Locale;

public enum ProgramLanguage {
  JAVA,
  C;

  @JsonCreator
  public static ProgramLanguage fromJson(String value) {
    if (value == null) return null;
    return valueOf(value.toUpperCase(Locale.ROOT));
  }

  @JsonValue
  public String toJson() {
    return name().toLowerCase(Locale.ROOT);
  }

  public static ProgramLanguage fromStringIgnoreCase(String value) {
    return ProgramLanguage.valueOf(value.toUpperCase());
  }
}
