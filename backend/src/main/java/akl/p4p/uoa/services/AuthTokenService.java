package akl.p4p.uoa.services;

import akl.p4p.uoa.models.AuthToken;
import akl.p4p.uoa.repositories.AuthTokenRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AuthTokenService {
  private final AuthTokenRepository authTokenRepository;

  public AuthTokenService(AuthTokenRepository authTokenRepository) {
    this.authTokenRepository = authTokenRepository;
  }

  public void verifyAuthToken(String token) {
    authTokenRepository
        .findById(token)
        .map(AuthToken::getToken)
        .orElseThrow(
            () ->
                new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Authentication token has expired. Please log in again."));
  }

  public void createToken(String token) {
    authTokenRepository.save(new AuthToken(token));
  }

  public void deleteToken(String token) {
    authTokenRepository.deleteById(token);
  }
}
