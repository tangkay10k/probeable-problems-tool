package akl.p4p.uoa.controllers;

import akl.p4p.uoa.enums.ProgramLanguage;
import akl.p4p.uoa.models.TestTemplate;
import akl.p4p.uoa.services.TestTemplateService;
import jakarta.servlet.http.HttpServletRequest;
import java.io.IOException;
import java.net.URI;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/testTemplate")
public class TestTemplateController {

  public final TestTemplateService testTemplateService;

  public TestTemplateController(TestTemplateService testTemplateService) {
    this.testTemplateService = testTemplateService;
  }

  @GetMapping("/{programLanguage}")
  public ResponseEntity<?> getTemplate(@PathVariable ProgramLanguage programLanguage)
      throws IOException {
    TestTemplate template = testTemplateService.getTestTemplate(programLanguage);

    if (template == null)
      return ResponseEntity.status(HttpStatus.NOT_FOUND)
          .body("There is no current template for the programming language chosen.");

    return ResponseEntity.ok(template);
  }

  @PostMapping
  public ResponseEntity<?> createTemplate(
      @RequestBody TestTemplate testTemplate, HttpServletRequest request) throws IOException {
    TestTemplate savedTemplate = testTemplateService.createTestTemplate(testTemplate);

    URI location =
        URI.create(
            request.getRequestURL().toString() + "/" + savedTemplate.getProgramLanguage().name());

    return ResponseEntity.created(location).body(savedTemplate);
  }
}
