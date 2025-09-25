package akl.p4p.uoa.controllers;

import akl.p4p.uoa.data.ActivityLogRequest;
import akl.p4p.uoa.services.ActivityLogService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/log")
public class LogController {
  public final ActivityLogService activityLogService;

  public LogController(ActivityLogService activityLogService) {
    this.activityLogService = activityLogService;
  }

  @PostMapping("/activity/{problemAttemptId}")
  public ResponseEntity<?> logActivity(
      @PathVariable String problemAttemptId, @RequestBody ActivityLogRequest activitiesRequest) {
    activityLogService.saveActivityLog(problemAttemptId, activitiesRequest.getActivities(), activitiesRequest.getEmail());

    return ResponseEntity.ok().build();
  }
}
