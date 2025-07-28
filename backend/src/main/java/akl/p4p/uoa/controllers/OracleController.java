package akl.p4p.uoa.controllers;

import akl.p4p.uoa.constants.AuthConstants;
import akl.p4p.uoa.models.Oracle;
import akl.p4p.uoa.services.OracleService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("api/oracle")
public class OracleController {

  private final OracleService oracleService;

  OracleController(OracleService oracleService) {
    this.oracleService = oracleService;
  }

  @PostMapping
  @PreAuthorize(AuthConstants.HAS_ROLE_TEACHER)
  public ResponseEntity<Oracle> createNewOracleForProblem(@RequestBody Oracle oracle) {
    return ResponseEntity.ok(oracleService.saveOracle(oracle));
  }

  @GetMapping
  @PreAuthorize(AuthConstants.IS_AUTHENTICATED)
  public ResponseEntity<Oracle> getExistingOracleForProblem(@RequestParam String problemId) {
    return ResponseEntity.ok(oracleService.loadOracle(problemId));
  }
}
