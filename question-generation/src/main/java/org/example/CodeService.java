package org.example;

import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;

@Service
public class CodeService {

	private final String PISTON_API_URL = "https://emkc.org/api/v2/piston/execute";

	private static final String EXECUTION_PAYLOAD =
		"""
			{
				"language": "%s",
				"version": "%s",
				"files": [
					{
						"content": "%s"
					}
				]
			}
			""";

	// helper to escape arbitrary text as a JSON string literal
	private static String escapeForJson(String s) {
		return s.replace("\\", "\\\\")
			.replace("\"", "\\\"")
			.replace("\r", "\\r")
			.replace("\n", "\\n");
	}

	public void run() throws IOException, InterruptedException {

	}

	private void executeCode(String fnInputs, String questionNumber)
		throws IOException, InterruptedException {

		String src = getSourceCode(questionNumber);
		src = src.replace("//VAR_INPUTS", fnInputs);

		String escapedSrc = escapeForJson(src);

		String language = "c";
		String version = "10.2.0";
		String payload = String.format(EXECUTION_PAYLOAD, language, version, escapedSrc);

		HttpRequest request =
			HttpRequest.newBuilder()
				.uri(URI.create(PISTON_API_URL))
				.timeout(Duration.ofSeconds(20))
				.header("Content-Type", "application/json")
				.POST(HttpRequest.BodyPublishers.ofString(payload))
				.build();

		HttpClient client =
			HttpClient.newBuilder()
				.version(HttpClient.Version.HTTP_1_1)
				.followRedirects(HttpClient.Redirect.NORMAL)
				.build();

		HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
		JsonObject root = JsonParser.parseString(response.body()).getAsJsonObject();

		JsonObject run = root.getAsJsonObject("run");
		String stdout = run.get("stdout").getAsString();
		String stderr = run.get("stderr").getAsString();

		System.out.println("|-----------------------------------------|");
		System.out.println(stdout);

		if (!stderr.isEmpty()) {
			System.err.println("Error: " + stderr);
		}
		System.out.println("|-----------------------------------------|");
	}

	private String getSourceCode(String questionNumber) throws IOException {
		InputStream is = getInputStream("Source" + questionNumber + ".txt");
		return readFromInputStream(is);
	}

	private String readFromInputStream(InputStream is) throws IOException {

		assert is != null;

		StringBuilder sb = new StringBuilder();
		InputStreamReader streamReader = new InputStreamReader(is, StandardCharsets.UTF_8);
		BufferedReader reader = new BufferedReader(streamReader);
		for (String line; (line = reader.readLine()) != null; ) {
			sb.append(line).append(System.lineSeparator());
		}
		return sb.toString();
	}

	private static InputStream getInputStream(String fileName) {
		ClassLoader classloader = Thread.currentThread().getContextClassLoader();
		return classloader.getResourceAsStream(fileName);
	}
}