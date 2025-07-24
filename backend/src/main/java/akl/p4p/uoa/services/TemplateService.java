package akl.p4p.uoa.services;

import akl.p4p.uoa.enums.ProgramLanguage;
import akl.p4p.uoa.enums.TemplateType;
import akl.p4p.uoa.models.Template;
import akl.p4p.uoa.repositories.TemplateRepository;
import java.util.Optional;
import org.springframework.stereotype.Service;

@Service
public class TemplateService {
  private final TemplateRepository templateRepository;

  public TemplateService(TemplateRepository templateRepository) {
    this.templateRepository = templateRepository;
  }

  public Template getTemplate(ProgramLanguage programLanguage, TemplateType templateType) {
    Optional<Template> optionalTemplate = templateRepository.findByProgramLanguageAndType(programLanguage,
        templateType);
    return optionalTemplate.orElse(null);
  }

  public Template createTemplate(Template template) {
    return templateRepository.save(template);
  }
}
