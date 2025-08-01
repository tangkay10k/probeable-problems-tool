import { createContext, useContext, useState, useEffect } from "react";
import {
  getTestTemplate,
  getExecuteTemplate,
} from "@/routes/template-route.js";
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
        };
  });

  const [testTemplate, setTestTemplate] = useState("");
  const [executeTemplate, setExecuteTemplate] = useState("");
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
      (err) =>
        console.error(`No TEST template for ${problem.programLanguage}`, err),
    );

    withLoading(
      () => getExecuteTemplate(problem.programLanguage),
      (template) => {
        setExecuteTemplate(template);
      },
      (err) =>
        console.error(
          `No EXECUTE template for ${problem.programLanguage}`,
          err,
        ),
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

  const setOracle = (defaultProbe) => {
    setCreationState((prev) => ({
      ...prev,
      problem: { ...prev.problem, defaultProbe },
    }));
  };

  return (
    <ProblemContext.Provider
      value={{
        problem,
        setProblem,
        executeTemplate,
        setExecuteTemplate,
        testTemplate,
        setTestTemplate,
        setLanguage,
        setModelSolution,
        setTestSuite,
        oracle,
        setOracle,
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
