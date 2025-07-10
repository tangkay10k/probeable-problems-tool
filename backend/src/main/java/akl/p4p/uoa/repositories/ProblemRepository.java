package akl.p4p.uoa.repositories;

import akl.p4p.uoa.models.Problem;
import java.util.List;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface ProblemRepository extends MongoRepository<Problem, String> {

  List<Problem> findAll();
}
