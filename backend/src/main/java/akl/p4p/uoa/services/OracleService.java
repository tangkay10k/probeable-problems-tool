package akl.p4p.uoa.services;

import akl.p4p.uoa.models.Oracle;
import akl.p4p.uoa.repositories.OracleRepository;
import org.springframework.stereotype.Service;

@Service
public class OracleService {

	private final OracleRepository oracleRepository;

	OracleService(OracleRepository oracleRepository) {
		this.oracleRepository = oracleRepository;
	}

	public Oracle saveOracle(Oracle oracle) {
		if (oracle.getProblemId() == null || oracle.getProblemId().isEmpty()) {
			throw new RuntimeException("Oracle must be associated with a problem!");
		}
		return oracleRepository.save(oracle);
	}

	public Oracle loadOracle(String problemId) {
		return oracleRepository
			.findById(problemId)
			.orElseThrow(() -> new RuntimeException("Oracle associated with " +
			"problem: " + problemId + " does not exist!"));
	}
}
