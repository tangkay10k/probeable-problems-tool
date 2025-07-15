package akl.p4p.uoa.repositories;

import akl.p4p.uoa.models.Oracle;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface OracleRepository extends MongoRepository<Oracle, String> {}
