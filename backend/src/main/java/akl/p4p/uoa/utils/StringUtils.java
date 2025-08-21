package akl.p4p.uoa.utils;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class StringUtils {
  public static String extractFunctionName(String code) {
    String regex = 
        "\\b(?!if\\b|for\\b|while\\b|switch\\b)([A-Za-z_][A-Za-z0-9_]*)\\s*(?=\\([^;{]*\\)\\s*\\{)";
    Pattern pattern = Pattern.compile(regex);
    Matcher matcher = pattern.matcher(code);

    if (matcher.find()) {
      return matcher.group(1);
    }
    return null;
  }

  public static String extractFunctionSignature(String code) {
    String regex = "(?s)" +
        "\\b(?!if\\b|for\\b|while\\b|switch\\b)" +
        "([A-Za-z_][\\w\\s]*?)\\s*" +
        "((?:\\*\\s*)*)\\s*" +
        "([A-Za-z_]\\w*)\\s*" +
        "\\(([^;{}]*)\\)\\s*\\{";

    Matcher m = Pattern.compile(regex, Pattern.DOTALL).matcher(code);
    if (!m.find())
      return null;

    String ret = m.group(1).replaceAll("\\s+", " ").trim();
    String stars = m.group(2).replaceAll("\\s+", "");
    String name = m.group(3);
    String params = m.group(4).replaceAll("\\s*,\\s*", ", ")
        .replaceAll("\\s+", " ").trim();

    return ret + " " + stars + name + "(" + params + ")";
  }

}
