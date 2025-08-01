package akl.p4p.uoa.controllers;

import akl.p4p.uoa.data.PastedContent;
import akl.p4p.uoa.services.StudentLogService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/log")
public class StudentLogController {

  public final StudentLogService studentLogService;

  public StudentLogController(StudentLogService studentLogService) {
    this.studentLogService = studentLogService;
  }

  @PostMapping("/paste/{problemAttemptId}")
  public ResponseEntity<?> logPastedContent(
      @PathVariable String problemAttemptId,
      @RequestBody PastedContent pastedContent) {
    studentLogService.savePastedLog(problemAttemptId, pastedContent);

    return ResponseEntity.ok().build();
  }
}
