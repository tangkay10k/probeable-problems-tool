import { createContext, useContext } from "react";

const ProblemAttemptContext = createContext(null);

export const useProblemContext = () => useContext(ProblemAttemptContext);

export default ProblemAttemptContext;
