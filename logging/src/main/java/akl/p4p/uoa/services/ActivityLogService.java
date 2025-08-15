package akl.p4p.uoa.services;

import akl.p4p.uoa.data.Activity;
import akl.p4p.uoa.models.ActivityLog;
import akl.p4p.uoa.repositories.ActivityLogRepository;
import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;

@Service
public class ActivityLogService {
    private final ActivityLogRepository activityLogRepository;

    public ActivityLogService(ActivityLogRepository activityLogRepository) {
        this.activityLogRepository = activityLogRepository;
    }

    public ActivityLog saveActivityLog(String problemAttemptId, List<Activity> activities) {
        ActivityLog activityLog = activityLogRepository
                .findById(problemAttemptId)
                .orElseGet(
                        () -> {
                            ActivityLog newLog = new ActivityLog(problemAttemptId, new ArrayList<>());
                            return newLog;
                        });

        activityLog.getActivities().addAll(activities);

        return activityLogRepository.save(activityLog);
    }
}
