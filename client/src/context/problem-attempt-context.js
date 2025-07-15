import { createContext, useContext } from "react";

const ProblemAttemptContext = createContext(null);

export const useProblemAttemptContext = () => useContext(ProblemAttemptContext);

export default ProblemAttemptContext;
