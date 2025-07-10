package akl.p4p.uoa.data;

import lombok.Data;

import java.time.Instant;

@Data
public class ChatMessage {
	private String role;
	private String content;
	private Instant timestamp;
}
