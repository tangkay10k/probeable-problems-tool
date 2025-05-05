package akl.p4p.uoa.services;

import java.util.List;
import akl.p4p.uoa.repositories.ProblemRepository;
import akl.p4p.uoa.models.Problem;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.stereotype.Service;

@Service
public class ProblemService {

    private final ProblemRepository problemRepository;
    private final MongoTemplate mongoTemplate;

    @Value("${spring.data.mongodb.database}")
    String DATABASE_NAME;

    public ProblemService(MongoTemplate mongoTemplate, ProblemRepository problemRepository) {
        this.mongoTemplate = mongoTemplate;
        this.problemRepository = problemRepository;
    }

    public List<Problem> getAllProblems() {
        return problemRepository.findAll();
    }

    public Problem createProblem(Problem problem) {
        return problemRepository.save(problem);
    }

    public Problem getMatchingProblemByTitle(String title) {
        return problemRepository.findFirstByTitleIgnoreCase(title.trim());
    }

}
