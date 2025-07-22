package akl.p4p.uoa.repositories;

import akl.p4p.uoa.models.OneTimeCode;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface OneTimeCodeRepository extends MongoRepository<OneTimeCode, String> {}
