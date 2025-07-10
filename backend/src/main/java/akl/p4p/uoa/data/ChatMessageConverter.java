package akl.p4p.uoa.data;

import java.time.Instant;

public class ChatMessageConverter {

  /**
   * Convert a raw user‐input String into an embeddable ChatMessage.
   *
   * @param userContent the text the user sent
   * @return a ChatMessage with role="user", the given content, and a timestamp of now
   */
  public static ChatMessage convertUserMessageToChatMessage(String userContent) {
    ChatMessage chatMsg = new ChatMessage();
    chatMsg.setRole("user");
    chatMsg.setContent(userContent);
    chatMsg.setTimestamp(Instant.now());
    return chatMsg;
  }

  /**
   * Convert a raw LLM response into an embeddable ChatMessage.
   *
   * @param assistantMessage the message the received by the LLM
   * @return a ChatMessage with role="assistant", the given content, and a timestamp of now
   */
  public static ChatMessage convertLLMResponseToChatMessage(String assistantMessage) {
    ChatMessage chatMsg = new ChatMessage();
    chatMsg.setRole("assistant");
    chatMsg.setContent(assistantMessage);
    chatMsg.setTimestamp(Instant.now());
    return chatMsg;
  }

  /**
   * Convert a raw LLM response into an embeddable ChatMessage.
   *
   * @param systemPrompt the message the received by the LLM
   * @return a ChatMessage with role="system", the given content, and a timestamp of now
   */
  public static ChatMessage convertSystemPromptToChatMessage(String systemPrompt) {
    ChatMessage chatMsg = new ChatMessage();
    chatMsg.setRole("system");
    chatMsg.setContent(systemPrompt);
    chatMsg.setTimestamp(Instant.now());
    return chatMsg;
  }
}
