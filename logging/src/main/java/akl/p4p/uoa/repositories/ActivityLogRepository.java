package akl.p4p.uoa.repositories;

import org.springframework.data.mongodb.repository.MongoRepository;

import akl.p4p.uoa.models.ActivityLog;

public interface ActivityLogRepository extends MongoRepository<ActivityLog, String> {}