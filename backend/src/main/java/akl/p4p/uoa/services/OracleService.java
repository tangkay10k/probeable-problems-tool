package akl.p4p.uoa.services;

import akl.p4p.uoa.models.Oracle;
import akl.p4p.uoa.models.Problem;
import akl.p4p.uoa.repositories.OracleRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
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
        .orElseThrow(
            () ->
                new RuntimeException(
                    "Oracle associated with " + "problem: " + problemId + " does not exist!"));
  }

  public Oracle parseLLMGeneratedOracle(Problem problem, String jsonResponse)
      throws JsonProcessingException {
    ObjectMapper objectMapper = new ObjectMapper();
    JsonNode jsonNode = objectMapper.readTree(jsonResponse);
    var src = jsonNode.get("source_code").asText();
    var probes = jsonNode.get("default_probes").asText();

    Oracle oracle = new Oracle();
    oracle.setSourceCode(src);
    oracle.setDefaultProbes(probes);
    oracle.setProblemId(problem.getId());

    return oracle;
  }
}
