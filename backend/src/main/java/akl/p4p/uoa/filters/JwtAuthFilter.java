package akl.p4p.uoa.filters;

import akl.p4p.uoa.constants.AuthConstants;
import akl.p4p.uoa.services.AuthTokenService;
import akl.p4p.uoa.services.JwtService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.List;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

@Component
public class JwtAuthFilter extends OncePerRequestFilter {

  private final AuthTokenService authTokenService;
  private final JwtService jwtService;

  public JwtAuthFilter(AuthTokenService authTokenService, JwtService jwtService) {
    this.authTokenService = authTokenService;
    this.jwtService = jwtService;
  }

  @Override
  protected void doFilterInternal(
      HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
      throws ServletException, IOException {

    String authHeader = request.getHeader(AuthConstants.P4P_AUTH_HEADER);

    if (authHeader != null && authHeader.startsWith("Bearer ")) {
      String token = authHeader.substring(7);

      authTokenService.verifyAuthToken(token);

      String role = jwtService.extractRole(token);

      List<GrantedAuthority> authorities = List.of(new SimpleGrantedAuthority("ROLE_" + role));

      Authentication auth = new UsernamePasswordAuthenticationToken(null, null, authorities);
      SecurityContextHolder.getContext().setAuthentication(auth);
    }

    filterChain.doFilter(request, response);
  }
}
