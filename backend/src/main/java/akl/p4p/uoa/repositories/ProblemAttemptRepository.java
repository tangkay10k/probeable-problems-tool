package akl.p4p.uoa.repositories;

import akl.p4p.uoa.models.ProblemAttempt;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface ProblemAttemptRepository extends MongoRepository<ProblemAttempt, String> {

	// Returns list of problem attempts by a student with the latest first.
	List<ProblemAttempt> findAllByStudentEmailOrderByCreatedDateDesc(String studentEmail);

}
