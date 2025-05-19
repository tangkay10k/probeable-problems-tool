package akl.p4p.uoa.services;

import akl.p4p.uoa.data.JsonSchemaDefinition;
import akl.p4p.uoa.utils.CodeUtils;
import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import org.springframework.stereotype.Service;

@Service
public class ExecutionService {

    private static final String PISTON_API_URL = "https://emkc.org/api/v2/piston/execute";

    public static String executeInSandbox(String language, String languageVersion, String code)
            throws IOException, InterruptedException {
        HttpClient client = HttpClient.newHttpClient();

        String sourceCode = CodeUtils.formatSourceCodeToSafeString(code);

        String json =
                String.format(
                        JsonSchemaDefinition.getExecutionPayload(),
                        "\"" + language + "\"",
                        "\"" + languageVersion + "\"",
                        "\"" + sourceCode + "\"");

        HttpRequest request =
                HttpRequest.newBuilder()
                        .uri(URI.create(PISTON_API_URL))
                        .header("Content-Type", "application/json")
                        .POST(HttpRequest.BodyPublishers.ofString(json))
                        .build();

        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

        if (response.statusCode() >= 200 && response.statusCode() < 300) {
            return response.body();
        } else {
            throw new IOException("PISTON Execution failed with status " + response.statusCode());
        }
    }
}
