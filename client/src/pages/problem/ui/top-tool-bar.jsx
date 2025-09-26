import ButtonGroup from "@/components/button/button-group.jsx";
import ButtonV2 from "@/components/button/buttonV2.jsx";
import {
  MdRestartAlt as RestartIcon,
  MdOutlinePlayArrow as PlayIcon,
} from "react-icons/md";
import { FaCircleCheck as CompletedIcon } from "react-icons/fa6";
import styles from "@/pages/problem/problemPage.module.css";
import { useProblemAttemptContext } from "@/context/problem-attempt-context.js";

export default function TopToolbar({
  selectedIndex,
  onSelectIndex,
  onToggleCode,
  onToggleTests,
  isLoading,
  onReset,
  onRun,
}) {
  const { problemAttempt, problem } = useProblemAttemptContext();
  const numTestsTotal = problem?.testSuite?.length;
  const showPenalties =
    problemAttempt.failedAttempts !== 0 && problem.penaltiesEnabled;
  const showCoins = problemAttempt.completed && problem.penaltiesEnabled;

  return (
    <div className={styles.toggleButtonContainer}>
      <ButtonGroup
        selectedIndex={selectedIndex}
        onSelectedIndexChange={onSelectIndex}
        labels={["Code", "Tests"]}
        onClickHandlers={[onToggleCode, onToggleTests]}
      />

      <section className={styles.topBarButtons}>
        {problemAttempt.testsPassed !== -1 && (
          <p className={styles.testResults}>
            Tests:{" "}
            <span
              className={styles.testsPassed}
            >{`${problemAttempt.testsPassed}/${numTestsTotal}`}</span>
            {showPenalties && (
              <span>
                {" | "}
                Failed Attempts:{" "}
                <span className={styles.penalty}>
                  {problemAttempt.failedAttempts}
                </span>
              </span>
            )}
            {showCoins && (
              <>
                <span className={styles.coinsEarned}>
                  {" | "}
                  <img
                    src="/coin.png"
                    alt="Dennies"
                    className={styles.coin}
                  />{" "}
                  Earned:{" "}
                  <span className={styles.finalScore}>
                    {problemAttempt.finalScore}
                  </span>
                </span>
              </>
            )}
          </p>
        )}
        {problemAttempt.completed && (
          <span className={styles.completed}>
            <CompletedIcon />
          </span>
        )}
        <ButtonV2
          onClick={onReset}
          disabled={isLoading}
          className={styles.resetBtn}
        >
          <RestartIcon />
        </ButtonV2>
        <ButtonV2
          onClick={onRun}
          disabled={isLoading}
          className={styles.runBtn}
        >
          <PlayIcon /> Check
        </ButtonV2>
      </section>
    </div>
  );
}
