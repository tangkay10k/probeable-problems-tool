package akl.p4p.uoa.services;

import akl.p4p.uoa.data.JsonSchemaDefinition;
import akl.p4p.uoa.data.Prompts;
import akl.p4p.uoa.models.ChatHistory;
import akl.p4p.uoa.models.Problem;
import akl.p4p.uoa.models.ProblemAttempt;
import akl.p4p.uoa.repositories.ProblemAttemptRepository;
import akl.p4p.uoa.repositories.ProblemRepository;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;
import java.util.UUID;

@Service
public class ProblemAttemptService {

	private final AIService aiService;

	private final ProblemRepository problemRepository;

	private final ProblemAttemptRepository problemAttemptRepository;


	ProblemAttemptService(ProblemAttemptRepository problemAttemptRepository, ProblemRepository problemRepository,
						  AIService aiService) {
		this.problemAttemptRepository = problemAttemptRepository;
		this.problemRepository = problemRepository;
		this.aiService = aiService;
	}


	public ProblemAttempt retrieveLatestOrCreateProblemAttempt(String problemId, String studentEmail) {
		List<ProblemAttempt> attempts = problemAttemptRepository.findAllByStudentEmailOrderByCreatedDateDesc(studentEmail);

		if (attempts.isEmpty()) {
			Problem problem = problemRepository.findById(problemId).orElseThrow(() -> new RuntimeException("Problem not " +
				"found: " + problemId));

			var attempt = new ProblemAttempt();
			attempt.setProblemId(problem.getId());
			attempt.setStudentEmail(studentEmail);
			attempt.setCreatedDate(new Date());

			// Set up client persona
			String systemPrompt = Prompts.getClientInitialisationPrompt(problem.getModelAnswer(), problem.getConstraints());
			ChatHistory chatHistory = aiService.chatWithClient(UUID.randomUUID().toString(), systemPrompt, null,
				JsonSchemaDefinition.getClientProbeSchema());

			attempt.setChatHistoryId(chatHistory.getSessionId());
			attempt.setMessageList(chatHistory.getMessages());

			return problemAttemptRepository.save(attempt);
		} else {
			return attempts.get(0);
		}
	}

}
