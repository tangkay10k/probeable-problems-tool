package akl.p4p.uoa.controllers;

import akl.p4p.uoa.data.PastedContent;
import akl.p4p.uoa.data.ActivityLogRequest;
import akl.p4p.uoa.services.ActivityLogService;
import akl.p4p.uoa.services.StudentLogService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "*")
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
      @PathVariable String problemAttemptId, @RequestBody ActivityLogRequest activitiesRequest) {
    activityLogService.saveActivityLog(problemAttemptId, activitiesRequest.getActivities(), activitiesRequest.getEmail());

    return ResponseEntity.ok().build();
  }
}
