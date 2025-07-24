package akl.p4p.uoa.controllers;

import akl.p4p.uoa.enums.ProgramLanguage;
import akl.p4p.uoa.enums.TemplateType;
import akl.p4p.uoa.models.Template;
import akl.p4p.uoa.services.TemplateService;
import jakarta.servlet.http.HttpServletRequest;
import java.io.IOException;
import java.net.URI;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/template")
public class TemplateController {

  public final TemplateService templateService;

  public TemplateController(TemplateService templateService) {
    this.templateService = templateService;
  }

  @GetMapping("/{programLanguage}/{type}")
  public ResponseEntity<?> getTemplate(
      @PathVariable String programLanguage, @PathVariable String type) throws IOException {

    TemplateType templateType;
    try {
      templateType = TemplateType.fromStringIgnoreCase(type);
    } catch (IllegalArgumentException e) {
      return ResponseEntity.badRequest().body("Invalid template type: " + type);
    }

    ProgramLanguage templateLanguage;
    try {
      templateLanguage = ProgramLanguage.fromStringIgnoreCase(programLanguage);
    } catch (IllegalArgumentException e) {
      return ResponseEntity.badRequest().body("Invalid ProgramLanguage type: " + programLanguage);
    }

    Template template = templateService.getTemplate(templateLanguage, templateType);

    if (template == null)
      return ResponseEntity.status(HttpStatus.NOT_FOUND)
          .body("No template found for the given programming language and type.");

    return ResponseEntity.ok(template);
  }

  @PostMapping
  public ResponseEntity<?> createTemplate(
      @RequestBody Template template, HttpServletRequest request) throws IOException {
    Template savedTemplate = templateService.createTemplate(template);

    URI location = URI.create(
        request.getRequestURL().toString() + "/" + savedTemplate.getProgramLanguage().name());

    return ResponseEntity.created(location).body(savedTemplate);
  }
}
