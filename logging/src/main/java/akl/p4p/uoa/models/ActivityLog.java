package akl.p4p.uoa.models;

import akl.p4p.uoa.data.Activity;

import java.util.ArrayList;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Document(collection = "activityLog")
public class ActivityLog {
  public ActivityLog(String problemAttemptId, String email) {
    this.problemAttemptId = problemAttemptId;
    this.email = email;
  }

  @Id
  private String problemAttemptId;

  private String email;

  private List<Activity> activities = new ArrayList<>();
}
