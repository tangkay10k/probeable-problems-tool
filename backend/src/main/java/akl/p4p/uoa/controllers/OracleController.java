package akl.p4p.uoa.controllers;

import akl.p4p.uoa.models.Oracle;
import akl.p4p.uoa.services.OracleService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("api/oracle")
public class OracleController {

	private final OracleService oracleService;

	OracleController(OracleService oracleService) {
		this.oracleService = oracleService;
	}

	@PostMapping
	public ResponseEntity<Oracle> createNewOracleForProblem(@RequestBody Oracle oracle) {
		return ResponseEntity.ok(oracleService.saveOracle(oracle));
	}

	@GetMapping
	public ResponseEntity<Oracle> getExistingOracleForProblem(@RequestParam String problemId) {
		return ResponseEntity.ok(oracleService.loadOracle(problemId));
	}

}
