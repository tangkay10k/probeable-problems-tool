package akl.p4p.uoa.utils;

public class CodeUtils {

    /**
     * This utility function is required as once we read code from a txt file, we
     * need to correct escape new lines and special characters before sending the
     * string representation of the source code to PISTON.
     * 
     * @param code is source code read from a txt file with incorectly escaped new
     *             lines.
     * @return source code as a string with valid escaped characters.
     */
    public static String formatSourceCodeToSafeString(String code) {
        return code.replace("\\", "\\\\")
                .replace("\"", "\\\"")
                .replace("\r\n", "\\n")
                .replace("\n", "\\n");
    }

}
