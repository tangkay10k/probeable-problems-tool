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

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import java.util.Scanner;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class ProblemVerifierService {
	private static final String SESSION_KEY = "experimental";
	private final ChatClient chatClient;

	private boolean isDev = false;

	public ProblemVerifierService(ChatClient.Builder chatClientBuilder) {
		this.chatClient = chatClientBuilder.build();
	}

	private String getProblemModelSolution(String questionNumber) throws IOException {
		InputStream is = getInputStream("Question" + questionNumber + ".txt");
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
		for (String line; (line = reader.readLine()) != null; ) {
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
			"""
				Please select a problem number (1-6):
				""");

		String questionNumber = scanner.nextLine().trim();
		String problemModelSolution = getProblemModelSolution(questionNumber);
		String constraints = getProblemConstraints(questionNumber);

		// Format system prompt:
		String basePrompt = PromptTesting.getSystemPrompt();
		String sysPrompt = basePrompt
			.replace("//VAR_MODEL_ANSWER", problemModelSolution)
			.replace("//VAR_CONSTRAINTS", constraints);

		history.add(new SystemMessage(sysPrompt));

		System.out.println("\n\nEnter your problem description:");
		String userInput = scanner.nextLine();

		history.add(new UserMessage(userInput));

		String jsonSchema = PromptTesting.getSchema();

		OpenAiChatOptions options = OpenAiChatOptions.builder()
			.model(OpenAiApi.ChatModel.O1)
			.temperature(1D)
			.responseFormat(
				new ResponseFormat(ResponseFormat.Type.JSON_SCHEMA, jsonSchema))
			.build();

		String assistantReply = chatClient.prompt().options(options).messages(history).call().content();

		history.add(new AssistantMessage(assistantReply));

//		Pattern p = Pattern.compile("\"message\"\\s*:\\s*\"((?:\\\\\"|[^\"])*)\"");
		String regex = "\"(message|test_case)\"\\s*:\\s*\"((?:\\\\\"|[^\"])*)\"";
		Pattern p = Pattern.compile(regex);
		printGPTRes(assistantReply, p);

		System.out.println("\nEnter your next question (or 'exit' to quit):");
		while (true) {
			userInput = scanner.nextLine();
			if (userInput.equalsIgnoreCase("exit")) {
				System.exit(0);
			}

			history.add(new UserMessage(userInput));

			assistantReply = chatClient.prompt().options(options).messages(history).call().content();

			history.add(new AssistantMessage(assistantReply));

			printGPTRes(assistantReply, p);
		}
	}

	private void printGPTRes(String assistantReply, Pattern p) {
		if (isDev) {
			System.out.println("[DEV] " + assistantReply);
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
