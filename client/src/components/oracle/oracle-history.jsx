import styles from "./oracle.module.css";
import { useProblemAttemptContext } from "@/context/problem-attempt-context.js";
import AnimatedList from "@/components/list/animated-list/animated-list.jsx";
import React from "react";

export default function OracleHistory() {
  const { oracleExecutionHistory } = useProblemAttemptContext();

  return (
    <div className={styles.historyContainer}>
      <AnimatedList
        items={oracleExecutionHistory}
        renderItem={({ testCase, expectedOutput }) => (
          <div className={styles.executionBlock}>
            <code>{testCase}</code>
            <hr />
            <code>Output: {expectedOutput}</code>
          </div>
        )}
        showGradients={true}
        enableArrowNavigation={true}
        displayScrollbar={false}
        className={styles.oracleList}
        itemClassName={styles.listItem}
      />
    </div>
  );
}
