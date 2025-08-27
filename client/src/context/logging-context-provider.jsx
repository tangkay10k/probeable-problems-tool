import { createContext, useContext, useState, useCallback } from "react";
import { useProblemAttemptContext } from "@/context/problem-attempt-context.js";
import { logActivity } from "@/routes/log-route.js";
import { useUserProfile } from "@/context/user-context.jsx";

const LoggingContext = createContext();

const LOGGING_ENABLED = import.meta.env.PROD;

export function LoggingProvider({ children }) {
  const [logs, setLogs] = useState([]);
  const { profile } = useUserProfile();
  const { problemAttempt } = useProblemAttemptContext();
  
  const addLog = useCallback(
    (entry) => {
      console.log(import.meta.env.PROD)
      if (!LOGGING_ENABLED) {
        return;
      }

      const stampedEntry = {
        ...entry,
        timestamp: new Date().toISOString(),
      };

      const email = profile.email;

      setLogs((prev) => {
        const next = [...prev, stampedEntry];

        logActivity(problemAttempt?.id, stampedEntry, email);

        return next;
      });
    },
    [problemAttempt?.id],
  );

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
