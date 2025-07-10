package akl.p4p.uoa.models;

import akl.p4p.uoa.data.ProblemType;
import akl.p4p.uoa.data.ProgramLanguage;
import akl.p4p.uoa.data.Test;
import lombok.Data;

import java.util.List;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@Document("problems")
public class Problem {

    @Id private String id;

	// Ambiguous problem to start the question given to students.
    private String problemStatement;

    private String modelAnswer;

	private String constraints;

	private String testSuite;

    private ProgramLanguage programLanguage;

	private ProblemType problemType;

	private String defaultProbe;
}
