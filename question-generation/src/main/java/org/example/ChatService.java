package org.example;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.messages.AssistantMessage;
import org.springframework.ai.chat.messages.Message;
import org.springframework.ai.chat.messages.SystemMessage;
import org.springframework.ai.openai.OpenAiChatOptions;
import org.springframework.ai.openai.api.OpenAiApi;
import org.springframework.ai.openai.api.ResponseFormat;
import org.springframework.stereotype.Service;

import java.io.*;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import java.util.Scanner;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class ChatService {
	private static final String MODEL_SOLUTION_FILE = "ModelSolution.txt";
	private static final String CONSTRAINTS_FILE = "ProblemConstraints.txt";
	private static final String TEST_SUITE_FILE = "TestSuite.txt";
	private static final String PROBLEM_STATEMENT_FILE = "ProblemStatement.txt";
	private final ChatClient chatClient;

	public ChatService(ChatClient.Builder chatClientBuilder) {
		this.chatClient = chatClientBuilder.build();
	}

	private String getProblemModelSolution(String questionNumber) throws IOException {
		InputStream is = getInputStream("Question" + questionNumber + ".txt");
		return readFromInputStream(is);
	}

	private String getProblemConstraints() throws IOException {
		InputStream is = getInputStream(CONSTRAINTS_FILE);
		return readFromInputStream(is);
	}

	private String getProblemConstraints(String questionNumber) throws IOException {
		InputStream is = getInputStream("Constraints" + questionNumber + ".txt");
		return readFromInputStream(is);
	}

	private String getModelSolution() throws IOException {
		InputStream is = getInputStream(MODEL_SOLUTION_FILE);
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
		Scanner scanner = new Scanner(System.in);
		System.out.println("Choose a pipeline step to execute: (1-3)");
		int step = scanner.nextInt();

		switch (step) {
			case 1 -> {
				System.out.println("Generating problem constraints...");
				String basePrompt = Prompts.getConstraintsSystemPrompt();
				String modelSolution = getModelSolution();
				String sysPrompt = basePrompt.replace("//VAR_MODEL_SOLUTION", modelSolution);
				executeOneTimeLLMCall(sysPrompt, Prompts.getConstraintGenerationSchema(), CONSTRAINTS_FILE);
				System.out.println("Constraints saved to file. Please double check the constraints!");
			}
			case 2 -> {
				System.out.println("Generating test suite...");
				String basePrompt = Prompts.getTestSuiteSystemPrompt();
				String modelSolution = getModelSolution();
				String constraints = getProblemConstraints();

				String sysPrompt = basePrompt.replace("//VAR_MODEL_SOLUTION", modelSolution)
					.replace("//VAR_CONSTRAINTS", constraints);

				executeOneTimeLLMCall(sysPrompt, null, TEST_SUITE_FILE);
				System.out.println("Test suite saved to file. Please double check expected outputs!");
			}
			case 3 -> {
				System.out.println("Creating ambiguous problem statement...");
				String basePrompt = Prompts.getProblemStatementSystemPrompt();
				String modelSolution = getModelSolution();
				String constraints = getProblemConstraints();

				String sysPrompt = basePrompt.replace("//VAR_MODEL_SOLUTION", modelSolution)
					.replace("//VAR_CONSTRAINTS", constraints);

				executeOneTimeLLMCall(sysPrompt, null, PROBLEM_STATEMENT_FILE);
				System.out.println("Problem statement saved. Question is prepared.");
			}
			default -> System.out.println("Invalid step selected.");
		}
	}

	private void executeOneTimeLLMCall(String prompt, String responseSchema, String outputFileName) {

		ResponseFormat responseFormat = new ResponseFormat();
		if (responseSchema != null) {
			responseFormat.setType(ResponseFormat.Type.JSON_SCHEMA);
			responseFormat.setSchema(responseSchema);
		} else {
			responseFormat.setType(ResponseFormat.Type.TEXT);
		}

		List<Message> history = new ArrayList<>();
		history.add(new SystemMessage(prompt));
		OpenAiChatOptions options = OpenAiChatOptions.builder()
			.model(OpenAiApi.ChatModel.O3)
			.temperature(1D)
			.responseFormat(responseFormat)
			.build();
		String assistantReply = chatClient.prompt().options(options).messages(history).call().content();
		history.add(new AssistantMessage(assistantReply));

		if (responseSchema == null) {
			saveResponseToFile(assistantReply, outputFileName);
			System.out.println("Response: " + assistantReply + " \n Saving constraints to file...");
		} else {
			String regex = "\"(response|test_suite)\"\\s*:\\s*\"((?:\\\\\"|[^\"])*)\"";
			Pattern p = Pattern.compile(regex);
			// Extract response from LLM into a string
			Matcher matcher = p.matcher(assistantReply);
			String response = "";
			if (matcher.find()) {
				response = matcher.group(2).replace("\\\"", "\"").replace("\\n", "\n");
				System.out.println("Response: " + response + " \n Saving constraints to file...");
			} else {
				System.out.println("No response found in the LLM output.");
			}
			saveResponseToFile(response, outputFileName);
		}
	}

	private void saveResponseToFile(String response, String fileName) {
		try (BufferedWriter writer = new BufferedWriter(new FileWriter(fileName))) {
			writer.write(response);
		} catch (IOException e) {
			System.err.println("Error writing to file: " + e.getMessage());
		}
	}
}
