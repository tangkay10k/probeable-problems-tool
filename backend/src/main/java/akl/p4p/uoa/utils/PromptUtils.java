package akl.p4p.uoa.utils;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;

public class PromptUtils {

  public static String readFileFromResources(String fileName) throws IOException {
    InputStream is = getInputStream(fileName);
    return readFromInputStream(is);
  }

  private static InputStream getInputStream(String fileName) {
    ClassLoader classloader = Thread.currentThread().getContextClassLoader();
    return classloader.getResourceAsStream(fileName);
  }

  private static String readFromInputStream(InputStream is) throws IOException {

    assert is != null;

    StringBuilder sb = new StringBuilder();
    InputStreamReader streamReader = new InputStreamReader(is, StandardCharsets.UTF_8);
    BufferedReader reader = new BufferedReader(streamReader);
    for (String line; (line = reader.readLine()) != null; ) {
      sb.append(line).append(System.lineSeparator());
    }
    return sb.toString();
  }
}
