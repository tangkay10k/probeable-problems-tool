import styles from "./nav.module.css";
import ButtonV2 from "@/components/button/buttonV2.jsx";
import { useProblemAttemptContext } from "@/context/problem-attempt-context.js";
import { useNavigate } from "react-router-dom";

export default function BottomNav({ handleStageChange, stage }) {
  const { problemAttempt } = useProblemAttemptContext();
  const navigate = useNavigate();

  return (
    <div className={styles.bottomNavContainer}>
      <div className={styles.prevContainer}>
        {stage === 2 && (
          <ButtonV2 onClick={handleStageChange}>Go back</ButtonV2>
        )}
      </div>

      <div className={styles.nextContainer}>
        {stage === 1 && (
          <ButtonV2 onClick={handleStageChange}>I'm ready to code!</ButtonV2>
        )}

        <section
          style={{
            opacity: problemAttempt.completed ? 1 : 0,
            transition: "opacity 10s",
          }}
        >
          {stage === 2 && (
            <ButtonV2 onClick={() => navigate("/problems")}>
              Back to problem list
            </ButtonV2>
          )}
        </section>
      </div>
    </div>
  );
}
