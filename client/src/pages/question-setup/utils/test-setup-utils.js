import { executeCodePistonDirect } from "@/routes/code-route.js";
import { toast } from "react-toastify";

import { SPLIT_STRING } from "../../../constants/setup-constants";

const inputCVariables = (problem, implementation, testTemplate) => {
  const generatedTests = problem.testSuite
    .map(
      (test, i) => `
    void test_${i + 1}() {
        ${test.code}
    }
    `,
    )
    .join("\n");

  const switchTests = problem.testSuite
    .map(
      (_, i) => `
        case ${i}: test_${i + 1}(); break;
    `,
    )
    .join("\n");

  const numTests = problem.testSuite.length.toString();

  return testTemplate.template
    .replace("//VAR_IMPLEMENTATION", implementation)
    .replace("//VAR_SPLIT", SPLIT_STRING)
    .replace("//VAR_NUM_TESTS", numTests)
    .replace("//VAR_TESTS", generatedTests)
    .replace("//VAR_SWITCH_TESTS", switchTests);
};

const createTestSuiteFromFile = (problem, implementation, testTemplate) => {
  let testSuiteFromFile;
  switch (problem.programLanguage) {
    case "c":
      testSuiteFromFile = inputCVariables(
        problem,
        implementation,
        testTemplate,
      );
      break;
    case "java":
      //TODO
      break;
    default:
      //TODO
      break;
  }
  return testSuiteFromFile;
};

export const handleTestSuiteExecution = async (
  problem,
  implementation,
  testTemplate,
  resultsCallback,
) => {
  const testSuiteFromFile = createTestSuiteFromFile(
    problem,
    implementation,
    testTemplate,
  );

  await executeCodePistonDirect(problem.programLanguage, testSuiteFromFile)
    .then((execution) => resultsCallback(execution))
    .catch((err) => toast.error(err));
};
