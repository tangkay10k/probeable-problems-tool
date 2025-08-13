package akl.p4p.uoa.utils;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class StringUtils {
    public static String extractFunctionName(String code) {
        String regex = "\\b(?!if\\b|for\\b|while\\b|switch\\b)([A-Za-z_][A-Za-z0-9_]*)\\s*(?=\\([^;{]*\\)\\s*\\{)";
        Pattern pattern = Pattern.compile(regex);
        Matcher matcher = pattern.matcher(code);

        if (matcher.find()) {
            return matcher.group(1);
        }
        return null; 
    }
}
