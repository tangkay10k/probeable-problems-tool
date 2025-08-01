package akl.p4p.uoa.repositories;

import akl.p4p.uoa.models.StudentLog;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface StudentLogRepository extends MongoRepository<StudentLog, String> {
}
