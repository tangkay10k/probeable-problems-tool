package akl.p4p.uoa.repositories;

import akl.p4p.uoa.models.AuthToken;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface AuthTokenRepository extends MongoRepository<AuthToken, String> {}
