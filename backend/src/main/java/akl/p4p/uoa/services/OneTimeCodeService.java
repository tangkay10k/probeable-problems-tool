package akl.p4p.uoa.services;

import akl.p4p.uoa.models.OneTimeCode;
import akl.p4p.uoa.repositories.OneTimeCodeRepository;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.concurrent.ThreadLocalRandom;
import org.springframework.stereotype.Service;

@Service
public class OneTimeCodeService {
  EmailService emailService;
  OneTimeCodeRepository oneTimeCodeRepository;

  public OneTimeCodeService(
      EmailService emailService, OneTimeCodeRepository oneTimeCodeRepository) {
    this.emailService = emailService;
    this.oneTimeCodeRepository = oneTimeCodeRepository;
  }

  public void sendCode(String email) {
    String code = generateCode();
    LocalDateTime dateTime = LocalDateTime.now();
    OneTimeCode oneTimeCode = new OneTimeCode(email, code, dateTime);

    oneTimeCodeRepository.save(oneTimeCode);
    emailService.sendEmail(
        email,
        "This is your one time code: " + code + ". \n It will expire in 15 minutes.",
        "Probeable Problems One Time Code");
  }

  public boolean verifyCode(String email, String code) {
    OneTimeCode oneTimeCode = oneTimeCodeRepository.findById(email).orElse(null);
    if (oneTimeCode == null) {
      return false;
    }

    if (!oneTimeCode.getCode().equals(code)) {
      return false;
    }

    LocalDateTime date = oneTimeCode.getDate();
    LocalDateTime now = LocalDateTime.now();

    Duration duration = Duration.between(date, now);

    if (duration.toMinutes() > 15) {
      return false;
    }

    return true;
  }

  public String generateCode() {
    int number = ThreadLocalRandom.current().nextInt(0, 1_000_000);
    return String.format("%06d", number);
  }
}
