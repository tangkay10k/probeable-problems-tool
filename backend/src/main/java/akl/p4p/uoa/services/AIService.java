package akl.p4p.uoa.services;

import akl.p4p.uoa.data.*;
import akl.p4p.uoa.data.ChatMessage.Role;
import akl.p4p.uoa.models.ChatHistory;
import akl.p4p.uoa.prompts.ClientPrompts;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.mongodb.lang.Nullable;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.messages.AssistantMessage;
import org.springframework.ai.chat.messages.Message;
import org.springframework.ai.chat.messages.SystemMessage;
import org.springframework.ai.chat.messages.UserMessage;
import org.springframework.ai.openai.OpenAiChatOptions;
import org.springframework.ai.openai.api.OpenAiApi;
import org.springframework.ai.openai.api.ResponseFormat;
import org.springframework.stereotype.Service;

@Service
public class AIService {

  private static final double TOP_P_VAL = 0.5;

  private static final double TEMP_VAL = 0.2;

  private final ChatClient chatClient;

  private final ChatHistoryService chatHistoryService;

  private final String TEST_ATTRIBUTE_NAME = "test_case";

  public AIService(ChatClient.Builder chatClientBuilder, ChatHistoryService chatHistoryService) {

    this.chatClient = chatClientBuilder.build();
    this.chatHistoryService = chatHistoryService;
  }

  /**
   * Used for executing an LLM call one time, chat history is not maintained.
   *
   * @param systemPrompt is the system prompt to send to the LLM to execute request.
   * @param responseSchema is the schema type of the response format which are defined in {@link
   *     akl.p4p.uoa.data.JsonSchemaDefinition} if not supplied (null) the response format defaults
   *     to a string.
   */
  public String executeOneTimeLLMCall(String systemPrompt, @Nullable String responseSchema) {
    // 03 does not support temperature tuning
    return executeOneTimeLLMCall(systemPrompt, responseSchema, 1, 1, OpenAiApi.ChatModel.O3);
  }

  public String executeOneTimeLLMCallStudent(String systemPrompt, @Nullable String responseSchema) {
    return executeOneTimeLLMCall(
        systemPrompt, responseSchema, TOP_P_VAL, TEMP_VAL, OpenAiApi.ChatModel.GPT_4_O);
  }

  public String executeOneTimeLLMCall(
      String systemPrompt,
      @Nullable String responseSchema,
      double topP,
      double temperature,
      OpenAiApi.ChatModel model) {

    var responseFormat = getResponseType(responseSchema);

    List<Message> history = new ArrayList<>();
    history.add(new SystemMessage(systemPrompt));
    OpenAiChatOptions options =
        OpenAiChatOptions.builder()
            .model(model)
            .temperature(temperature)
            .topP(topP)
            .responseFormat(responseFormat)
            .build();
    return chatClient.prompt().options(options).messages(history).call().content();
  }

  public ResponseFormat getResponseType(String responseSchema) {
    ResponseFormat responseFormat = new ResponseFormat();
    if (responseSchema != null) {
      responseFormat.setType(ResponseFormat.Type.JSON_SCHEMA);
      responseFormat.setSchema(responseSchema);
    } else {
      responseFormat.setType(ResponseFormat.Type.TEXT);
    }
    return responseFormat;
  }

  /**
   * Send a user message within a session, maintaining the chat history.
   *
   * @param sessionId a unique key for this conversation (e.g. user ID or UUID)
   * @param systemPrompt only applied on session‐start; ignored for subsequent messages
   * @param userMessage the new user message to send
   * @param responseSchema the response schema to follow, defaults to text if null
   * @return the assistant’s reply
   * @throws IOException
   */
  public ChatHistory chatWithClient(
      String sessionId,
      @Nullable String systemPrompt,
      @Nullable ChatContent userMessage,
      @Nullable String responseSchema,
      boolean isReplace)
      throws IOException {

    ChatHistory sessionHistory = chatHistoryService.loadHistory(sessionId);

    if (sessionHistory == null) {
      sessionHistory = new ChatHistory();
      sessionHistory.setSessionId(sessionId);
      sessionHistory.setMessages(new ArrayList<>());
    }

    List<ChatMessage> history = sessionHistory.getMessages();

    if (history.isEmpty() || isReplace) {
      history.add(ChatMessageConverter.convertSystemPromptToChatMessage(systemPrompt));
    } else if (userMessage != null) {
      history.add(ChatMessageConverter.convertUserMessageToChatMessage(userMessage));
    }

    List<Message> sdkMessages =
        history.stream()
            .map(
                chatMsg -> {
                  if (Role.USER.equals(chatMsg.getRole())) {
                    return new UserMessage(chatMsg.getContent().getMessage());
                  } else if (Role.ASSISTANT.equals(chatMsg.getRole())) {
                    return new AssistantMessage(chatMsg.getContent().getMessage());
                  } else {
                    return new SystemMessage(chatMsg.getContent().getMessage());
                  }
                })
            .collect(Collectors.toList());

    OpenAiChatOptions options =
        OpenAiChatOptions.builder()
            .model(OpenAiApi.ChatModel.O4_MINI)
            .temperature(1D)
            .responseFormat(getResponseType(responseSchema))
            .build();

    String assistantReply =
        chatClient.prompt().options(options).messages(sdkMessages).call().content();

    ObjectMapper objectMapper = new ObjectMapper();

    ChatContent chatContent = objectMapper.readValue(assistantReply, ChatContent.class);

    if (!isReplace && chatContent.isAsked_expected_output()) {
      List<Message> filteredMessages =
          Arrays.asList(
              //				sdkMessages.get(0),
              //              sdkMessages.get(1),
              sdkMessages.get(sdkMessages.size() - 1),
              new SystemMessage(ClientPrompts.clientTestCasePrompt()));

      String rawRes = generateTestCase(filteredMessages);
      String testCase = sanitizeLLMTestCaseResponse(rawRes);
      chatContent.setTest_case(testCase);
    }

    if (isReplace && history.size() >= 2) {
      history.subList(history.size() - 2, history.size()).clear();
    }

    history.add(ChatMessageConverter.convertLLMResponseToChatMessage(chatContent));

    return chatHistoryService.saveHistory(sessionHistory);
  }

  public String generateTestCase(List<Message> messages) {
    OpenAiChatOptions options =
        OpenAiChatOptions.builder().model(OpenAiApi.ChatModel.O4_MINI).temperature(1D).build();
    return chatClient.prompt().options(options).messages(messages).call().content();
  }

  private String sanitizeLLMTestCaseResponse(String raw) {
    ObjectMapper mapper = new ObjectMapper();
    try {
      JsonNode root = mapper.readTree(raw);
      if (root.has(TEST_ATTRIBUTE_NAME)) {
        return root.get(TEST_ATTRIBUTE_NAME).asText();
      }
    } catch (Exception e) {
      // Not JSON, just return as-is
    }
    return raw;
  }
}
