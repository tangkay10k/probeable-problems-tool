package akl.p4p.uoa.models;

import akl.p4p.uoa.data.ChatMessage;
import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.Transient;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Date;
import java.util.List;

@Data
@Document("problemAttempts")
public class ProblemAttempt {

	@Id
	private String id;

	private String studentEmail; // TODO: Potentially swap to a student object.

	private Date createdDate;

	private String problemId;

	private String chatHistoryId;

	@Transient
	List<ChatMessage> messageList;
}
