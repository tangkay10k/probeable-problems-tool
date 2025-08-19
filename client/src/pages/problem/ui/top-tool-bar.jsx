import ButtonGroup from "@/components/button/button-group.jsx";
import ButtonV2 from "@/components/button/buttonV2.jsx";
import {
  MdRestartAlt as RestartIcon,
  MdOutlinePlayArrow as PlayIcon,
} from "react-icons/md";
import { IoMdPaperPlane as PlaneIcon } from "react-icons/io";
import { FaCircleCheck as CompletedIcon } from "react-icons/fa6";
import styles from "@/pages/problem/problemPage.module.css";
import { useProblemAttemptContext } from "@/context/problem-attempt-context.js";

export default function TopToolbar({
  selectedIndex,
  onSelectIndex,
  onToggleCode,
  onToggleTests,
  isLoading,
  hasCompleted,
  onReset,
  onRun,
  onSubmit,
}) {
  const { problemAttempt } = useProblemAttemptContext();

  return (
    <div className={styles.toggleButtonContainer}>
      <ButtonGroup
        selectedIndex={selectedIndex}
        onSelectedIndexChange={onSelectIndex}
        labels={["Code", "Tests"]}
        onClickHandlers={[onToggleCode, onToggleTests]}
      />

      <section className={styles.leftButtons}>
        <section className={styles.stageTwoBtnGroup}>
          {hasCompleted && (
            <>
              <p>
                Tests: {problemAttempt.testsPassed} |{" "}
                {problemAttempt.failedAttempts !== 0 && (
                  <>
                    Penalty:{" "}
                    <span className={styles.penalty}>
                      {problemAttempt.failedAttempts}%
                    </span>
                    {" | "}
                  </>
                )}
                Score:{" "}
                <span className={styles.finalScore}>
                  {(Math.round(problemAttempt.finalScore * 100) / 100).toFixed(
                    2,
                  )}
                </span>
              </p>
              <span className={styles.completed}>
                <CompletedIcon />
              </span>
            </>
          )}
          <ButtonV2
            onClick={onReset}
            disabled={isLoading}
            className={`${styles.resetBtn} ${styles.resetBtnStage2}`}
          >
            <RestartIcon />
          </ButtonV2>
          <ButtonV2
            onClick={onRun}
            disabled={isLoading}
            className={styles.runBtn}
          >
            <PlayIcon /> Run
          </ButtonV2>
          <ButtonV2 onClick={onSubmit} disabled={isLoading}>
            <PlaneIcon size={15} /> Submit
          </ButtonV2>
        </section>
      </section>
    </div>
  );
}
