package akl.p4p.uoa.programExecutors.java;

import akl.p4p.uoa.services.ExecutionService;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.util.stream.Collectors;

public class JavaCodeExecutor {

    private static final String PROBE_FILE_PATH = "java/probe.txt";

    private static final String JAVA = "java";

    public static String executeJavaProbe(
            String languageVersion, String probes, String modelSolution) throws IOException {

        try (InputStream stream =
                JavaCodeExecutor.class.getClassLoader().getResourceAsStream(PROBE_FILE_PATH)) {

			assert stream != null;
			String content =
                    new BufferedReader(new InputStreamReader(stream))
                            .lines()
                            .collect(Collectors.joining("\n"));

            String codeToExecute =
                    content.replace("//VAR_INPUT_PROBES", probes)
                            .replace("//VAR_MODEL_SOLUTION", modelSolution);

            return ExecutionService.executeInSandbox(JAVA, languageVersion, codeToExecute);
        } catch (InterruptedException e) {
            System.out.println("[EXECUTION FAILURE] Something when wrong: " + e);
        }
        return null;
    }
}
