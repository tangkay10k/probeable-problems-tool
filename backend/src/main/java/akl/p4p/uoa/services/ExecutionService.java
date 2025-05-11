package akl.p4p.uoa.services;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

import org.springframework.stereotype.Service;

import akl.p4p.uoa.data.JsonSchemaDefinition;

@Service
public class ExecutionService {

    private final static String PISTON_API_URL = "https://emkc.org/api/v2/piston/execute";

    public static String executeInSandbox(String language, String languageVersion, String code)
            throws IOException, InterruptedException {
        HttpClient client = HttpClient.newHttpClient();

        // 1) escape backslashes first
        String escaped = code.replace("\\", "\\\\")
                // 2) escape any quotes
                .replace("\"", "\\\"")
                // 3) turn real newlines into the literal \n sequence
                .replace("\r\n", "\\n")
                .replace("\n", "\\n");

        // now wrap it in quotes and plug into your template
        String json = String.format(
                JsonSchemaDefinition.getExecutionPayload(),
                "\"" + language + "\"",
                "\"" + languageVersion + "\"",
                "\"" + escaped + "\"");

        System.out.println(json);

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(PISTON_API_URL))
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(json))
                .build();

        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

        if (response.statusCode() >= 200 && response.statusCode() < 300) {
            return response.body();
        } else {
            throw new IOException("Execution failed with status " + response.statusCode());
        }
    }

}
