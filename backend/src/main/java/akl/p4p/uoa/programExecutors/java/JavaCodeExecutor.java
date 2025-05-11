package akl.p4p.uoa.programExecutors.java;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.util.stream.Collectors;

import akl.p4p.uoa.services.ExecutionService;

public class JavaCodeExecutor {

    private final static String PROBE_FILE_PATH = "java/probe.txt";

    private final static String JAVA = "java";

    public static String executeJavaProbe(String langaugeVersion, String probes, String modelSolution)
            throws IOException {

        try (InputStream stream = JavaCodeExecutor.class
                .getClassLoader()
                .getResourceAsStream(PROBE_FILE_PATH)) {

            String content = new BufferedReader(new InputStreamReader(stream))
                    .lines()
                    .collect(Collectors.joining("\n"));

            String codeToExecute = content.replace("//VAR_INPUT_PROBES", probes)
                    .replace("//VAR_MODEL_SOLUTION", modelSolution);

            return ExecutionService.executeInSandbox(JAVA, langaugeVersion, codeToExecute);
        } catch (InterruptedException e) {
            System.out.println("[EXEUCTION FAILURE] Something when wrong: " + e);
        }
        return null;
    }

}
