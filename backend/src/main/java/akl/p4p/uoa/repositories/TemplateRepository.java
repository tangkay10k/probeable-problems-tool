package akl.p4p.uoa.repositories;

import akl.p4p.uoa.enums.ProgramLanguage;
import akl.p4p.uoa.enums.TemplateType;
import akl.p4p.uoa.models.Template;

import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;

public interface TemplateRepository extends MongoRepository<Template, ProgramLanguage> {
    Optional<Template> findByProgramLanguageAndType(ProgramLanguage programLanguage, TemplateType type);
}
