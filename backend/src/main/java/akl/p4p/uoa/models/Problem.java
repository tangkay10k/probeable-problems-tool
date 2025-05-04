package akl.p4p.uoa.models;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@Document("problems")
public class Problem {

    @Id
    private String id;

    private String title; // This is what an instructor will remember the problem by.

    private String description; // Contains the ambiguous problem statement given to students.

    private String modelAnswer;

    private String defaultProbe;

    private String problemLanguage;

}
