package akl.p4p.uoa.enums;

public enum TemplateType {
  TEST,
  EXECUTE,
  BUGGY_SOLUTION;

  public static TemplateType fromStringIgnoreCase(String value) {
    return TemplateType.valueOf(value.toUpperCase());
  }
}
