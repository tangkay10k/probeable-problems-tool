package org.example;

import com.openai.client.OpenAIClient;
import com.openai.client.okhttp.OpenAIOkHttpClient;
import com.openai.models.ChatModel;
import com.openai.models.responses.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        OpenAIClient client = OpenAIOkHttpClient.fromEnv();

        // Create a persistent conversation history list.
        List<ResponseInputItem> conversationHistory = new ArrayList<>();

        // Start model conversation with the system prompt.
        conversationHistory.add(ResponseInputItem.ofEasyInputMessage(EasyInputMessage.builder()
            .role(EasyInputMessage.Role.SYSTEM)
            .content(Prompts.thoughtProcessVerifier())
            .build()));

        ResponseCreateParams createParams = ResponseCreateParams.builder()
            .inputOfResponse(conversationHistory)
            .model(ChatModel.O3_MINI)
            .build();

        List<ResponseOutputMessage> initialMessages = client.responses().create(createParams).output().stream()
            .flatMap(item -> item.message().stream())
            .toList();

 //        initialMessages.stream()
//            .flatMap(message -> message.content().stream())
//            .flatMap(content -> content.outputText().stream())
//            .forEach(outputText -> System.out.println(outputText.text()));

//        System.out.println("\n-----------------------------------\n");

        Scanner scanner = new Scanner(System.in);
        String input;
        String justification;

        while (true) {
            System.out.println("Enter a probe spacing inputs via a comma: (Press Q to exit)");
            input = scanner.nextLine();
            if (input.equalsIgnoreCase("Q")) break;

            System.out.println("Describe what you are trying to find out about the function with this probe: ");
            justification = scanner.nextLine();

            String full = "twoSum(" + input + "), What the user is thinking: " + justification;

            System.out.println("[DEV] " + full);

            ResponseInputItem userMessage = ResponseInputItem.ofEasyInputMessage(EasyInputMessage.builder()
                .role(EasyInputMessage.Role.USER)
                .content(full)
                .build());
            conversationHistory.add(userMessage);

            // Rebuild request parameters with the updated history.
            createParams = ResponseCreateParams.builder()
                .inputOfResponse(conversationHistory)
                .model(ChatModel.O3_MINI)
                .build();

            // Send the conversation history to the model.
            List<ResponseOutputMessage> messages = client.responses().create(createParams).output().stream()
                .flatMap(item -> item.message().stream())
                .toList();

            // Process the model responses.
            messages.stream()
                .flatMap(message -> message.content().stream())
                .flatMap(content -> content.outputText().stream())
                .forEach(outputText -> {
                    System.out.println(outputText.text());
                    conversationHistory.add(ResponseInputItem.ofEasyInputMessage(EasyInputMessage.builder()
                        .role(EasyInputMessage.Role.ASSISTANT)
                        .content(outputText.text())
                        .build()));
                });

            System.out.println("\n-----------------------------------\n");
        }
        scanner.close();
    }
}
