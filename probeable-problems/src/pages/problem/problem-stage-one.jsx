import ProblemAttemptProvider from "@/context/problem-attempt-context-provider.jsx";
import ProblemStageOneContent from "./stage-one-content.jsx";

export default function ProblemStageOne() {
  return (
    <ProblemAttemptProvider>
      <ProblemStageOneContent />
    </ProblemAttemptProvider>
  );
}
