package akl.p4p.uoa.services;

import akl.p4p.uoa.data.Activity;
import akl.p4p.uoa.models.ActivityLog;
import akl.p4p.uoa.repositories.ActivityLogRepository;

import org.springframework.stereotype.Service;

@Service
public class ActivityLogService {
    private final ActivityLogRepository activityLogRepository;

    public ActivityLogService(ActivityLogRepository activityLogRepository) {
        this.activityLogRepository = activityLogRepository;
    }

    public ActivityLog saveActivityLog(String problemAttemptId, Activity activities, String email) {
        ActivityLog activityLog = activityLogRepository
                .findById(problemAttemptId)
                .orElseGet(
                        () -> {
                            ActivityLog newLog = new ActivityLog(problemAttemptId, email);
                            return newLog;
                        });

        activityLog.getActivities().add(activities);

        return activityLogRepository.save(activityLog);
    }
}
