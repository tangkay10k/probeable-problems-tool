import ProblemAttemptProvider from "@/context/problem-attempt-context-provider.jsx";
import ProblemContent from "./problem-content.jsx";
import { LoggingProvider } from "@/context/logging-context-provider.jsx";

export default function ProblemPage() {
  return (
    <ProblemAttemptProvider>
      <LoggingProvider>
        <ProblemContent />
      </LoggingProvider>
    </ProblemAttemptProvider>
  );
}
