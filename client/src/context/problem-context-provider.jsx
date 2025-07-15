import { createContext, useContext, useState, useEffect } from "react";
import { getTestTemplate } from "@/routes/test-template-route.js";
import useWithLoading from "@/hooks/useWithLoading.js";

const ProblemContext = createContext();

export function ProblemProvider({ children }) {
  const [problem, setProblem] = useState({
    problemStatement: "",
    modelAnswer: "",
    constraints: "",
    testSuite: [],
    programLanguage: "c",
    problemType: null,
    defaultProbe: null,
  });
  const [testTemplate, setTestTemplate] = useState("");
  const [_, withLoading] = useWithLoading();

  // fetch template when language changes
  useEffect(() => {
    withLoading(
      () => getTestTemplate(problem.programLanguage),
      (template) => setTestTemplate(template),
      (err) => console.error(`No template for ${problem.programLanguage}`, err),
    );
  }, [problem.programLanguage]);

  // setters
  const setLanguage = (programLanguage) => {
    setProblem((prev) => ({ ...prev, programLanguage }));
  };
  const setModelSolution = (modelAnswer) => {
    setProblem((prev) => ({ ...prev, modelAnswer }));
  };
  const setTestSuite = (testSuite) => {
    setProblem((prev) => ({ ...prev, testSuite }));
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
