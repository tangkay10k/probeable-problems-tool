import styles from "./question-setup.module.css";
import { ProblemProvider } from "@/context/problem-context-provider.jsx";
import QuestionSetupContent from "./question-setup-content.jsx";

export default function QuestionSetup() {
  return (
    <ProblemProvider>
      <div className={styles.pageContainer}>
        <QuestionSetupContent />
      </div>
    </ProblemProvider>
  );
}
