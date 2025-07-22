package akl.p4p.uoa.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum ProblemType {
  FUNCTION("Single Function"),
  OOP("OOP");

  private final String jsonValue;

  ProblemType(String jsonValue) {
    this.jsonValue = jsonValue;
  }

  @JsonCreator
  public static ProblemType fromJson(String value) {
    for (ProblemType pt : values()) {
      if (pt.jsonValue.equalsIgnoreCase(value)) {
        return pt;
      }
    }
    throw new IllegalArgumentException("Unknown ProblemType: " + value);
  }

  @JsonValue
  public String toJson() {
    return this.jsonValue;
  }
}
