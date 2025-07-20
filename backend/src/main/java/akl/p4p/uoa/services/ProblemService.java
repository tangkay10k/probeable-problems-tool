package akl.p4p.uoa.services;

import akl.p4p.uoa.models.Problem;
import akl.p4p.uoa.repositories.ProblemRepository;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.NoSuchElementException;
import java.util.Optional;

import static akl.p4p.uoa.utils.ModelUtils.getNullPropertyNames;

@Service
public class ProblemService {

	private final ProblemRepository problemRepository;

	public ProblemService(ProblemRepository problemRepository) {
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

	public Problem getProblemById(String problemId) {
		Optional<Problem> probOptional = problemRepository.findById(problemId);
		return probOptional.orElse(null);
	}

	// This function specifically sanitises the problem retrieved from the database only returning the testcases.
	public Problem getProblemTestSuite(String problemId) {
		return problemRepository.findById(problemId)
			.map(problem -> {
				var sanitised = new Problem();
				sanitised.setId(problem.getId());
				sanitised.setTestSuite(problem.getTestSuite());
				return sanitised;
			})
			.orElseThrow(() -> new NoSuchElementException("Problem with ID " + problemId + " not found"));
	}
	
	public Problem updateProblem(Problem incoming) {
		Problem existing =
			problemRepository
				.findById(incoming.getId())
				.orElseThrow(() -> new RuntimeException("Problem not found: " + incoming.getId()));

		BeanUtils.copyProperties(incoming, existing, getNullPropertyNames(incoming));

		return problemRepository.save(existing);
	}
}
