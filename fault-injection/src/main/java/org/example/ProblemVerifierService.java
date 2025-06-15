package org.example;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.messages.AssistantMessage;
import org.springframework.ai.chat.messages.Message;
import org.springframework.ai.chat.messages.SystemMessage;
import org.springframework.ai.chat.messages.UserMessage;
import org.springframework.ai.openai.OpenAiChatOptions;
import org.springframework.ai.openai.api.OpenAiApi;
import org.springframework.ai.openai.api.ResponseFormat;
import org.springframework.stereotype.Service;

import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;

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
import java.util.ArrayList;
import java.util.List;
import java.util.Scanner;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class ProblemVerifierService {
	private final String PISTON_API_URL = "https://emkc.org/api/v2/piston/execute";

	private static final String EXECUTION_PAYLOAD = """
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

	private final ChatClient chatClient;

	private boolean isDev = false;

	public ProblemVerifierService(ChatClient.Builder chatClientBuilder) {
		this.chatClient = chatClientBuilder.build();
	}

	private String getProblemModelSolution(String questionNumber) throws IOException {
		InputStream is = getInputStream("FunctionDefinition" + questionNumber + ".txt");
		return readFromInputStream(is);
	}

	private String getProblemConstraints(String questionNumber) throws IOException {
		// Switch case determining which question to read from which .txt file.
		InputStream is = getInputStream("Constraints" + questionNumber + ".txt");
		if (is == null) {
			throw new RuntimeException("Could not load resource: " + "Constraints" + questionNumber + ".txt");
		}
		return readFromInputStream(is);
	}

	private String readFromInputStream(InputStream is) throws IOException {

		assert is != null;

		StringBuilder sb = new StringBuilder();
		InputStreamReader streamReader = new InputStreamReader(is, StandardCharsets.UTF_8);
		BufferedReader reader = new BufferedReader(streamReader);
		for (String line; (line = reader.readLine()) != null;) {
			sb.append(line).append(System.lineSeparator());
		}
		return sb.toString();
	}

	private static InputStream getInputStream(String fileName) {
		ClassLoader classloader = Thread.currentThread().getContextClassLoader();
		return classloader.getResourceAsStream(fileName);
	}

	public void run() throws IOException {
		List<Message> history = new ArrayList<>();

		Scanner scanner = new Scanner(System.in);
		System.out.println("Developer mode? (y/n)");
		String devMode = scanner.nextLine();
		if (devMode.equalsIgnoreCase("y")) {
			isDev = true;
		}

		System.out.println(
				"Please select a problem number (1-5):");
		String questionNumber = scanner.nextLine().trim();
		String problemFunctionDefinition = getProblemModelSolution(questionNumber);
		String constraints = getProblemConstraints(questionNumber);
		// Format system prompt:
		String basePrompt = PromptTesting.getSystemPrompt();
		String sysPrompt = basePrompt
				.replace("//VAR_MODEL_FUNCTION_DEFINITION", problemFunctionDefinition)
				.replace("//VAR_CONSTRAINTS", constraints);

		history.add(new SystemMessage(sysPrompt));

		String jsonSchema = PromptTesting.getSchema();

		OpenAiChatOptions options = OpenAiChatOptions.builder()
				.model(OpenAiApi.ChatModel.O1)
				.temperature(1D)
				.responseFormat(
						new ResponseFormat(ResponseFormat.Type.JSON_SCHEMA, jsonSchema))
				.build();

		String assistantReply = chatClient.prompt().options(options).messages(history).call().content();

		history.add(new AssistantMessage(assistantReply));

		// Pattern p = Pattern.compile("\"message\"\\s*:\\s*\"((?:\\\\\"|[^\"])*)\"");
		String regex = "\"(message|test_case)\"\\s*:\\s*\"((?:\\\\\"|[^\"])*)\"";
		Pattern p = Pattern.compile(regex);
		printGPTRes(assistantReply, p);

		JsonObject parsedReply = JsonParser.parseString(assistantReply).getAsJsonObject();
		String correctCode = parsedReply.get("correct_code").getAsString();

		JsonArray buggyCodesArray = parsedReply.getAsJsonArray("buggy_codes");
		List<String> buggyCodes = new ArrayList<>();
		for (JsonElement elem : buggyCodesArray) {
			buggyCodes.add(elem.getAsJsonObject().get("code").getAsString());
		}

		while (true) {
			System.out.print("Please enter inputs in the following format:      ");
			switch (Integer.parseInt(questionNumber)) {
				case 1 -> System.out.print(
						"""
								int values[] = {0, 1, 2, 3, 5, 6}; int n = 5; int a = 0; int b = 5;
								""");
				case 2 -> System.out.print(
						"""
								int values[] = {-1, 4, 4, 4, 2}; int n = 5;
								""");
				case 3 -> System.out.println(
						"""
								char s[] = "uoie";
								""");
				case 4 -> System.out.print(
						"""
								char text[] = "supercarhitest"; char word[] = "hi";
								""");
				case 5 -> System.out.println(
						"""
								 int nums[] = {1, -2, 3, 4, -1, 2, 1, -5, 4};  int numsSize = 9;
								""");
				default -> System.out.print("Invalid selection. Please try again.");
			}
			String userInput = scanner.nextLine();
			if (userInput.equalsIgnoreCase("exit")) {
				System.exit(0);
			}

			// Run correct solution
			System.out.println("\n[Running Correct Solution]");
			try {
				executeCode(correctCode, userInput, questionNumber);
			} catch (Exception e) {
				System.err.println("Error executing correct solution: " + e.getMessage());
			}

			// Run buggy solutions
			for (int i = 0; i < buggyCodes.size(); i++) {
				System.out.println("\n[Running Buggy Solution #" + (i + 1) + "]");
				try {
					executeCode(buggyCodes.get(i), userInput, questionNumber);
				} catch (Exception e) {
					System.err.println("Error executing buggy solution #" + (i + 1) + ": " + e.getMessage());
				}
			}
		}
	}

	private void executeCode(String solution, String fnInputs, String questionNumber)
			throws IOException, InterruptedException {

		String src = getSourceCode(questionNumber);
		src = src.replace("//VAR_INPUTS", fnInputs);
		src = src.replace("//VAR_SOLUTION", solution);

		String escapedSrc = escapeForJson(src);

		String language = "c";
		String version = "10.2.0";
		String payload = String.format(EXECUTION_PAYLOAD, language, version, escapedSrc);

		HttpRequest request = HttpRequest.newBuilder()
				.uri(URI.create(PISTON_API_URL))
				.timeout(Duration.ofSeconds(20))
				.header("Content-Type", "application/json")
				.POST(HttpRequest.BodyPublishers.ofString(payload))
				.build();

		HttpClient client = HttpClient.newBuilder()
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
		// Switch case determining which question to read from which .txt file.
		InputStream is = getInputStream("RunQuestion" + questionNumber + ".txt");
		return readFromInputStream(is);
	}

	private void printGPTRes(String assistantReply, Pattern p) {
		if (isDev) {
			String formattedReply = assistantReply.replace("\\n", "\n").replace("\\\"", "\"");
			System.out.println("[DEV] " + formattedReply);
		} else {
			Matcher matcher = p.matcher(assistantReply);
			boolean foundAny = false;

			while (matcher.find()) {
				String key = matcher.group(1);
				String value = matcher.group(2).replace("\\\"", "\"");
				value = value.replace("\\n", "\n");

				if ("message".equals(key)) {
					System.out.println("\nClient message: " + value);
					foundAny = true;
				} else if ("test_case".equals(key) && !value.isEmpty()) {
					System.out.println("Test case: " + value);
					foundAny = true;
				}
			}

			if (!foundAny) {
				System.out.println("No message or test_case field found.");
			}
		}
	}

}
