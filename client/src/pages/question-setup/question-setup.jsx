import styles from "./question-setup.module.css";
import QuestionSetupContent from "./question-setup-content.jsx";
import { ProblemProvider } from "@/context/problem-context-provider.jsx";
import { useUserProfile } from "@/context/user-context.jsx";
import { useNavigate } from "react-router-dom";

export default function QuestionSetup() {
  const { profile } = useUserProfile();
  const navigate = useNavigate();

  if (profile.role !== "TEACHER") {
    navigate("/problems");
  }

  return (
    <ProblemProvider>
      <div className={styles.pageContainer}>
        <QuestionSetupContent />
      </div>
    </ProblemProvider>
  );
}
