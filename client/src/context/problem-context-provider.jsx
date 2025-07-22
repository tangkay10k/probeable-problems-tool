import { createContext, useContext, useState, useEffect } from "react";
import { getTestTemplate } from "@/routes/test-template-route.js";
import useWithLoading from "@/hooks/useWithLoading.js";

const ProblemContext = createContext();

export function ProblemProvider({ children }) {
  const [creationState, setCreationState] = useState(() => {
    const saved = localStorage.getItem("problemUnderCreation");
    return saved
      ? JSON.parse(saved)
      : {
          problem: {
            problemStatement: "",
            modelAnswer: "",
            constraints: "",
            testSuite: [],
            programLanguage: "c",
            problemType: null,
            defaultProbe: null,
          },
          oracle: {
            problemId: null,
            defaultProbes: "",
            sourceCode: "",
          },
        };
  });

  const [testTemplate, setTestTemplate] = useState("");
  const [_, withLoading] = useWithLoading();

  const { problem, oracle } = creationState;

  // Persist entire creationState
  useEffect(() => {
    localStorage.setItem("problemUnderCreation", JSON.stringify(creationState));
  }, [creationState]);

  // Fetch template when language changes
  useEffect(() => {
    withLoading(
      () => getTestTemplate(problem.programLanguage),
      (template) => setTestTemplate(template),
      (err) => console.error(`No template for ${problem.programLanguage}`, err),
    );
  }, [problem.programLanguage]);

  // Problem setters
  const setProblem = (newProblem) => {
    setCreationState((prev) => ({ ...prev, problem: newProblem }));
  };
  const setLanguage = (programLanguage) => {
    setCreationState((prev) => ({
      ...prev,
      problem: { ...prev.problem, programLanguage },
    }));
  };
  const setModelSolution = (modelAnswer) => {
    setCreationState((prev) => ({
      ...prev,
      problem: { ...prev.problem, modelAnswer },
    }));
  };
  const setTestSuite = (testSuite) => {
    setCreationState((prev) => ({
      ...prev,
      problem: { ...prev.problem, testSuite },
    }));
  };

  // Oracle setters
  const setOracle = (newOracle) => {
    setCreationState((prev) => ({ ...prev, oracle: newOracle }));
  };
  const setOracleField = (field, value) => {
    setCreationState((prev) => ({
      ...prev,
      oracle: { ...prev.oracle, [field]: value },
    }));
  };

  return (
    <ProblemContext.Provider
      value={{
        problem,
        setProblem,
        testTemplate,
        setTestTemplate,
        setLanguage,
        setModelSolution,
        setTestSuite,
        oracle,
        setOracle,
        setOracleField,
      }}
    >
      {children}
    </ProblemContext.Provider>
  );
}

export function useProblemContext() {
  const context = useContext(ProblemContext);
  if (!context) {
    throw new Error("useProblemContext must be used within a ProblemProvider");
  }
  return context;
}
