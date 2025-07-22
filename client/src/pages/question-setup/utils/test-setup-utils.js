import { executeCodePistonDirect } from "@/routes/code-route.js";
import { toast } from "react-toastify";

const inputCVariables = (problem, testTemplate, splitString) => {
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
    .replace("//VAR_IMPLEMENTATION", problem.modelAnswer)
    .replace("//VAR_SPLIT", splitString)
    .replace("//VAR_NUM_TESTS", numTests)
    .replace("//VAR_TESTS", generatedTests)
    .replace("//VAR_SWITCH_TESTS", switchTests);
};

const createTestSuiteFromFile = (
  problem,
  testTemplate,
  splitString,
  language,
) => {
  let testSuiteFromFile;
  switch (language) {
    case "c":
      testSuiteFromFile = inputCVariables(problem, testTemplate, splitString);
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
  testTemplate,
  resultsCallback,
) => {
  const testSuiteFromFile = createTestSuiteFromFile(
    problem,
    testTemplate,
    SPLIT_STRING,
    problem.programLanguage,
  );

  await executeCodePistonDirect(problem.programLanguage, testSuiteFromFile)
    .then((execution) => resultsCallback(execution))
    .catch((err) => toast.error(err));
};

export const SPLIT_STRING = "$_@_BBJ_SPL1T_@_$";
