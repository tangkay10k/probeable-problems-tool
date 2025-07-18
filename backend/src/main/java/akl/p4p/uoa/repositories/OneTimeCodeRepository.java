package akl.p4p.uoa.repositories;

import org.springframework.data.mongodb.repository.MongoRepository;

import akl.p4p.uoa.models.OneTimeCode;

public interface OneTimeCodeRepository extends MongoRepository<OneTimeCode, String>{
    
}
