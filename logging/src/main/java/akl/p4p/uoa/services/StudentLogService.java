package akl.p4p.uoa.services;

import akl.p4p.uoa.data.PastedContent;
import akl.p4p.uoa.models.StudentLog;
import akl.p4p.uoa.repositories.StudentLogRepository;

import java.util.ArrayList;

import org.springframework.stereotype.Service;

@Service
public class StudentLogService {
  private final StudentLogRepository studentLogRepository;

  public StudentLogService(StudentLogRepository studentLogRepository) {
    this.studentLogRepository = studentLogRepository;
  }

  public StudentLog savePastedLog(String problemAttemptId, PastedContent pastedContent) {
    StudentLog log = studentLogRepository.findById(problemAttemptId).orElseGet(() -> {
      StudentLog newLog = new StudentLog();
      newLog.setProblemAttemptId(problemAttemptId);
      newLog.setPastedContents(new ArrayList<>());
      return newLog;
    });

    log.getPastedContents().add(pastedContent);

    return studentLogRepository.save(log);
  }
}
