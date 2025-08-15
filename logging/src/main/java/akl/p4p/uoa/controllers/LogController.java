package akl.p4p.uoa.controllers;

import akl.p4p.uoa.data.PastedContent;
import akl.p4p.uoa.data.Activity;
import akl.p4p.uoa.services.ActivityLogService;
import akl.p4p.uoa.services.StudentLogService;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/log")
public class LogController {

  public final StudentLogService studentLogService;
  public final ActivityLogService activityLogService;

  public LogController(StudentLogService studentLogService, ActivityLogService activityLogService) {
    this.studentLogService = studentLogService;
    this.activityLogService = activityLogService;
  }

  @PostMapping("/paste/{problemAttemptId}")
  public ResponseEntity<?> logPastedContent(
      @PathVariable String problemAttemptId, @RequestBody PastedContent pastedContent) {
    studentLogService.savePastedLog(problemAttemptId, pastedContent);

    return ResponseEntity.ok().build();
  }

  @PostMapping("/activity/{problemAttemptId}")
  public ResponseEntity<?> logActivity(
      @PathVariable String problemAttemptId, @RequestBody List<Activity> activities) {
    activityLogService.saveActivityLog(problemAttemptId, activities);

    return ResponseEntity.ok().build();
  }
}
