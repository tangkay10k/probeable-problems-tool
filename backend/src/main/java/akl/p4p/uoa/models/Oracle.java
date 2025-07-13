package akl.p4p.uoa.models;

import lombok.Data;
import org.springframework.data.annotation.Id;

@Data
public class Oracle {

	@Id private String problemId;

	private String oracle; // Source code to execute oracle. <- needs inputs replaced.
}
