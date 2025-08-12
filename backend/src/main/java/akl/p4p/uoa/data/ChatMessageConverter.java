package akl.p4p.uoa.data;

import akl.p4p.uoa.data.ChatMessage.Role;
import java.time.Instant;

public class ChatMessageConverter {

  /**
   * Convert a raw user‐input String into an embeddable ChatMessage.
   *
   * @param userContent the text the user sent
   * @return a ChatMessage with role="user", the given content, and a timestamp of now
   */
  public static ChatMessage convertUserMessageToChatMessage(ChatContent userContent) {
    ChatMessage chatMsg = new ChatMessage();
    chatMsg.setRole(Role.USER);
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
  public static ChatMessage convertLLMResponseToChatMessage(ChatContent assistantMessage) {
    ChatMessage chatMsg = new ChatMessage();
    chatMsg.setRole(Role.ASSISTANT);
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
    chatMsg.setRole(Role.SYSTEM);
    chatMsg.setContent(new ChatContent(systemPrompt));
    chatMsg.setTimestamp(Instant.now());
    return chatMsg;
  }
}
