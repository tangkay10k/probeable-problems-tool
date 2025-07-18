package akl.p4p.uoa.services;

import java.io.IOException;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.sendgrid.Method;
import com.sendgrid.Request;
import com.sendgrid.Response;
import com.sendgrid.SendGrid;
import com.sendgrid.helpers.mail.Mail;
import com.sendgrid.helpers.mail.objects.Content;
import com.sendgrid.helpers.mail.objects.Email;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
public class EmailService {
    @Value("${SENDGRID_API_KEY}")
    String sendGridApiKey;

    @Value("${ADMIN_EMAIL}")
    String adminEmail;

    public void sendEmail(String toEmail, String body, String subject) {
        Email from = new Email(adminEmail);
        Email to = new Email(toEmail);
        Email replyTo = new Email(adminEmail);
        Content content = new Content("text/html", body);
        Mail mail = new Mail(from, subject, to, content);
        SendGrid sg = new SendGrid(sendGridApiKey);
        Request request = new Request();

        mail.setReplyTo(replyTo);

        try {
            request.setMethod(Method.POST);
            request.setEndpoint("mail/send");
            request.setBody(mail.build());
            Response response = sg.api(request);
            log.info(
                    "Email sent and returned response with response:\n code: {}\n body: {}\n headers: {}",
                    response.getStatusCode(),
                    response.getBody(),
                    response.getHeaders());
        } catch (IOException ex) {
            log.info("Email failed to be sent to email: {} with exception {}", toEmail, ex.getMessage());
        }
    }
}
