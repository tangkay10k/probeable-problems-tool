package akl.p4p.uoa.enums;

public enum TemplateType {
  TEST,
  EXECUTE;

  public static TemplateType fromStringIgnoreCase(String value) {
    return TemplateType.valueOf(value.toUpperCase());
  }
}
