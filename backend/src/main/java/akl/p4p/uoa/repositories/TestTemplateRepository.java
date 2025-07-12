package akl.p4p.uoa.repositories;

import akl.p4p.uoa.data.ProgramLanguage;
import akl.p4p.uoa.models.TestTemplate;

import org.springframework.data.mongodb.repository.MongoRepository;

public interface TestTemplateRepository extends MongoRepository<TestTemplate, ProgramLanguage> {}
