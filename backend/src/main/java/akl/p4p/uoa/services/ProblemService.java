package akl.p4p.uoa.services;

import akl.p4p.uoa.models.Problem;
import akl.p4p.uoa.repositories.ProblemRepository;

import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ProblemService {

    private final ProblemRepository problemRepository;

    public ProblemService(MongoTemplate mongoTemplate, ProblemRepository problemRepository) {
        this.problemRepository = problemRepository;
    }

    public List<Problem> getAllProblems(boolean isStudent) {
        List<Problem> problems = problemRepository.findAll();
        if (isStudent) {
            for (Problem p : problems) {
                p.setModelAnswer(null);
            }
        }
        return problems;
    }

    public Problem createProblem(Problem problem) {
        return problemRepository.save(problem);
    }

    public Problem getMatchingProblemByTitle(String title) {
        return problemRepository.findFirstByTitleIgnoreCase(title.trim());
    }

    public Problem getProblemById(String problemId) {
        Optional<Problem> probOptional = problemRepository.findById(problemId);
        if (probOptional.isEmpty()) return null;
        return probOptional.get();
    }
}
