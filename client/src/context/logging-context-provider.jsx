import { createContext, useContext, useState, useCallback } from "react";
import { useProblemAttemptContext } from "@/context/problem-attempt-context.js";
import { logActivity } from "@/routes/log-route.js";

const LoggingContext = createContext();

export function LoggingProvider({ children }) {
  const [logs, setLogs] = useState([]);
  const { problemAttempt } = useProblemAttemptContext();

  const addLog = useCallback((entry) => {
    const stampedEntry = {
      ...entry,
      timestamp: new Date().toISOString(),
    };

    setLogs((prev) => {
      const next = [...prev, stampedEntry];

      logActivity(problemAttempt?.id, stampedEntry);

      return next;
    });
  }, [problemAttempt?.id]);

  return (
    <LoggingContext.Provider value={{ logs, addLog }}>
      {children}
    </LoggingContext.Provider>
  );
}

export function useLogging() {
  const context = useContext(LoggingContext);
  if (!context) {
    throw new Error("useLogging must be used within a LoggingProvider");
  }
  return context;
}
