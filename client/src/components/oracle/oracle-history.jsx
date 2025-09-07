import styles from "./oracle.module.css";
import { useProblemAttemptContext } from "@/context/problem-attempt-context.js";
import AnimatedList from "@/components/list/animated-list/animated-list.jsx";
import React from "react";
import CodeBlockViewer from "@/components/code/code-block-viewer.jsx";

export default function OracleHistory() {
  const { oracleExecutionHistory } = useProblemAttemptContext();

  return (
    <div className={styles.historyContainer}>
      {oracleExecutionHistory?.length > 0 ? (
        <AnimatedList
          insertDirection={"head"}
          items={oracleExecutionHistory}
          renderItem={({ testCase, expectedOutput }) => (
            <CodeBlockViewer
              code={testCase}
              childComponents={
                <ExpectedOutput expectedOutput={expectedOutput} />
              }
            />
          )}
          showGradients={true}
          enableArrowNavigation={true}
          displayScrollbar={false}
          className={styles.oracleList}
        />
      ) : (
        <div className={styles.emptyHistory}>
          Execute code in the Run tab to see history!
        </div>
      )}
    </div>
  );
}

function ExpectedOutput({ expectedOutput }) {
  return (
    <div className={styles.output}>
      <p>Output:</p>
      <section className={styles.executionBlock}>{expectedOutput}</section>
    </div>
  );
}
