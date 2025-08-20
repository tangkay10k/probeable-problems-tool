package akl.p4p.uoa.services;

import static akl.p4p.uoa.data.ChatMessageConverter.convertSystemPromptToChatMessage;
import static akl.p4p.uoa.data.ChatMessageConverter.convertUserMessageToChatMessage;

import akl.p4p.uoa.data.*;
import akl.p4p.uoa.data.ChatMessage.Role;
import akl.p4p.uoa.data.ChatMessageConverter;
import akl.p4p.uoa.models.ChatHistory;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.mongodb.lang.Nullable;
import java.io.IOException;
import java.util.ArrayList;
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

  private final String CLIENT_RESPONSE_SCHEMA_NAME = "CLIENT_PROBE_SCHEMA";

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
      OpenAiApi.ChatModel model,
      double topP,
      double temperature) {
    return executeOneTimeLLMCall(systemPrompt, responseSchema, topP, temperature, model);
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

  public ResponseFormat getResponseType(String responseSchema, String schemaName) {
    ResponseFormat rf = new ResponseFormat();
    if (responseSchema != null) {
      rf.setType(ResponseFormat.Type.JSON_SCHEMA);

      ResponseFormat.JsonSchema js =
          ResponseFormat.JsonSchema.builder()
              .name(schemaName)
              .schema(responseSchema)
              .strict(Boolean.TRUE)
              .build();

      rf.setJsonSchema(js);
    } else {
      rf.setType(ResponseFormat.Type.TEXT);
    }
    return rf;
  }

  public ChatHistory createNewChat(String sessionId, String systemPrompt) {

    var sessionHistory = new ChatHistory();
    sessionHistory.setSessionId(sessionId);

    List<ChatMessage> messageHistory = new ArrayList<>();
    messageHistory.add(convertSystemPromptToChatMessage(systemPrompt));

    sessionHistory.setMessages(messageHistory);
    return chatHistoryService.saveHistory(sessionHistory);
  }

  /**
   * Send a user message within a session, maintaining the chat history.
   *
   * @param sessionId a unique key for this conversation (e.g. user ID or UUID)
   * @param userMessage the new user message to send
   * @param responseSchema the response schema to follow, defaults to text if null
   * @return the assistant’s reply
   * @throws IOException if the LLM call fails or the response cannot be parsed
   */
  public ChatHistory chatWithClient(
      String sessionId, ChatContent userMessage, String responseSchema) throws IOException {

    ChatHistory sessionHistory = chatHistoryService.loadHistory(sessionId);

    if (sessionHistory == null) {
      throw new RuntimeException("Chat History with id: " + sessionId + " does not exist!");
    }

    List<ChatMessage> nativeMessages = sessionHistory.getMessages();
    nativeMessages.add(convertUserMessageToChatMessage(userMessage));
    List<Message> messages = convertNativeChatHistoryToMessages(nativeMessages);

    var options = getStudentDefaultOptions(responseSchema);
    String assistantReply = callLLM(options, messages);

    sessionHistory.setMessages(
        parseLLMResponseAndAppendToMessageHistory(nativeMessages, assistantReply));

    return chatHistoryService.saveHistory(sessionHistory);
  }

  public String generateTestCase(List<Message> messages) {
    OpenAiChatOptions options =
        OpenAiChatOptions.builder().model(OpenAiApi.ChatModel.O4_MINI).temperature(1D).build();
    return chatClient.prompt().options(options).messages(messages).call().content();
  }

  /**
   * Overwrite the most recent ASSISTANT message in a session's history.
   *
   * @param sessionId the chat session id
   * @param replacement the ChatMessage to store (role will be forced to ASSISTANT)
   * @param appendIfMissing if true and no assistant message exists, append instead of throwing
   * @return the updated ChatHistory
   * @throws IllegalStateException if no history exists or no assistant message and
   *     appendIfMissing=false
   */
  public ChatHistory overwriteLastAssistantMessage(
      String sessionId, ChatMessage replacement, boolean appendIfMissing) {
    ChatHistory sessionHistory = chatHistoryService.loadHistory(sessionId);
    if (sessionHistory == null || sessionHistory.getMessages() == null) {
      throw new IllegalStateException("No chat history found for sessionId=" + sessionId);
    }

    List<ChatMessage> history = sessionHistory.getMessages();

    // Find last ASSISTANT message
    int idx = -1;
    for (int i = history.size() - 1; i >= 0; i--) {
      ChatMessage m = history.get(i);
      if (m.getRole() == Role.ASSISTANT) {
        idx = i;
        break;
      }
    }

    // Normalize role to ASSISTANT no matter what came in
    replacement.setRole(Role.ASSISTANT);

    if (idx >= 0) {
      history.set(idx, replacement);
    } else if (appendIfMissing) {
      history.add(replacement);
    } else {
      throw new IllegalStateException(
          "No assistant message to overwrite for sessionId=" + sessionId);
    }

    return chatHistoryService.saveHistory(sessionHistory);
  }

  /** Convenience overload: pass a ChatContent and wrap it as an ASSISTANT ChatMessage. */
  public ChatHistory overwriteLastAssistantMessage(
      String sessionId, ChatContent content, boolean appendIfMissing) {
    ChatMessage msg = ChatMessageConverter.convertLLMResponseToChatMessage(content);
    // Just in case the converter doesn't set role to ASSISTANT:
    msg.setRole(Role.ASSISTANT);
    return overwriteLastAssistantMessage(sessionId, msg, appendIfMissing);
  }

  /** Convenience overload: overwrite using a plain string. */
  public ChatHistory overwriteLastAssistantMessage(
      String sessionId, String assistantText, boolean appendIfMissing) {
    ChatContent content = new ChatContent();
    content.setMessage(assistantText);
    return overwriteLastAssistantMessage(sessionId, content, appendIfMissing);
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

  private OpenAiChatOptions getStudentDefaultOptions(String responseSchema) {
    return OpenAiChatOptions.builder()
        .model(OpenAiApi.ChatModel.O4_MINI)
        .temperature(1D)
        .responseFormat(getResponseType(responseSchema, CLIENT_RESPONSE_SCHEMA_NAME))
        .build();
  }

  private String callLLM(OpenAiChatOptions options, List<Message> messages) {
    return chatClient.prompt().options(options).messages(messages).call().content();
  }

  private List<Message> convertNativeChatHistoryToMessages(List<ChatMessage> chatHistory) {
    return chatHistory.stream()
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
  }

  private List<ChatMessage> parseLLMResponseAndAppendToMessageHistory(
      List<ChatMessage> messagesToAppendTo, String reply) throws JsonProcessingException {
    ObjectMapper objectMapper = new ObjectMapper();
    ChatContent chatContent = objectMapper.readValue(reply, ChatContent.class);
    messagesToAppendTo.add(ChatMessageConverter.convertLLMResponseToChatMessage(chatContent));
    return messagesToAppendTo;
  }
}
