package akl.p4p.uoa.controllers.repositories;

import akl.p4p.uoa.models.Problem;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface ProblemRepository extends MongoRepository<Problem, String> {

    List<Problem> findAll();

    Problem findFirstByTitleIgnoreCase(String title);
}
