import styles from "./question-setup.module.css";
import QuestionSetupContent from "./question-setup-content.jsx";
import { ProblemProvider } from "@/context/problem-context-provider.jsx";

export default function QuestionSetup() {
  return (
    <ProblemProvider>
      <div className={styles.pageContainer}>
        <QuestionSetupContent />
      </div>
    </ProblemProvider>
  );
}
