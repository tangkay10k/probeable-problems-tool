import ProblemAttemptProvider from "@/context/problem-attempt-context-provider.jsx";
import ProblemContent from "./problem-content.jsx";

export default function ProblemPage() {
  return (
    <ProblemAttemptProvider>
      <ProblemContent />
    </ProblemAttemptProvider>
  );
}
