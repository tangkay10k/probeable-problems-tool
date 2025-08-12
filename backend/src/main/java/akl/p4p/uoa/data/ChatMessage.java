package akl.p4p.uoa.data;

import java.time.Instant;
import lombok.Data;

@Data
public class ChatMessage {

  private Role role;
  private ChatContent content;
  private Instant timestamp;

  public enum Role {
    USER,
    ASSISTANT,
    SYSTEM;

    @com.fasterxml.jackson.annotation.JsonCreator
    public static Role fromString(String value) {
      return value == null ? null : Role.valueOf(value.toUpperCase());
    }

    @com.fasterxml.jackson.annotation.JsonValue
    public String toValue() {
      return this.name().toLowerCase();
    }
  }
}
