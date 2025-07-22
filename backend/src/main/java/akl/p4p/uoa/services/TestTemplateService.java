package akl.p4p.uoa.services;

import akl.p4p.uoa.enums.ProgramLanguage;
import akl.p4p.uoa.models.TestTemplate;
import akl.p4p.uoa.repositories.TestTemplateRepository;
import java.util.Optional;
import org.springframework.stereotype.Service;

@Service
public class TestTemplateService {
  private final TestTemplateRepository testTemplateRepository;

  public TestTemplateService(TestTemplateRepository testTemplateRepository) {
    this.testTemplateRepository = testTemplateRepository;
  }

  public TestTemplate getTestTemplate(ProgramLanguage programLanguage) {
    Optional<TestTemplate> optionalTestTemplate = testTemplateRepository.findById(programLanguage);
    return optionalTestTemplate.orElse(null);
  }

  public TestTemplate createTestTemplate(TestTemplate testTemplate) {
    return testTemplateRepository.save(testTemplate);
  }
}
