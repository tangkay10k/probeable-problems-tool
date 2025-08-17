package akl.p4p.uoa.enums;

public enum ProblemVariant {
  ORACLE,
  NATURAL_LANGUAGE,
  FULL;

  public static ProblemVariant fromStringIgnoreCase(String value) {
    return ProblemVariant.valueOf(value.toUpperCase());
  }
}
