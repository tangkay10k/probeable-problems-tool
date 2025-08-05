import React, { useCallback } from "react";
import { TestCaseEditor } from "@/components/text-editor/test-case-editor.jsx";
import TextArea from "@/components/inputs/text-area.jsx";
import styles from "./test-suite.module.css";
import Button from "@/components/button/button.jsx";
import DeleteButton from "@/components/button/delete-button";
import ToggleButton from "@/components/button/toggle-button";
import { FaLock as LockedIcon } from "react-icons/fa";

export function TestSuiteList({
  tests,
  setTests,
  language,
  results,
  setResults,
  isEditable = true,
}) {
  const updateTest = useCallback(
    (index, field, value) =>
      setTests((prev) =>
        prev.map((t, i) => (i === index ? { ...t, [field]: value } : t)),
      ),
    [setTests],
  );

  const addTestCase = useCallback(() => {
    setTests((prev) => [...prev, { code: "", expectedStdOut: "" }]);
    setResults((prev) => [...prev, { actual: "" }]);
  }, [setTests, setResults]);

  const deleteTest = useCallback(
    (index) => {
      setTests((prev) => prev.filter((_, i) => i !== index));
      setResults((prev) => prev.filter((_, i) => i !== index));
    },
    [setTests, setResults],
  );

  return (
    <div className={styles.testContainer}>
      {tests.map((test, idx) => (
        <TestCase
          key={idx}
          index={idx}
          test={test}
          result={results[idx]}
          language={language}
          isEditable={isEditable}
          onUpdate={(field, value) => updateTest(idx, field, value)}
          onDelete={() => deleteTest(idx)}
        />
      ))}

      {isEditable && (
        <div className={styles.addButtonContainer}>
          <Button onClick={addTestCase}>Add Test Case</Button>
        </div>
      )}
    </div>
  );
}

const StatusPill = ({ hasRun, passed }) =>
  hasRun ? (
    <span className={`${styles.pill} ${passed ? styles.pass : styles.fail}`}>
      {passed ? "✓ Passed" : "✗ Failed"}
    </span>
  ) : null;

function TestCase({
  index,
  test,
  result,
  language,
  isEditable,
  onUpdate,
  onDelete,
}) {
  const hasRun = Boolean(result?.actual);
  const passed = hasRun && result.actual === test.expectedStdOut;

  if (!isEditable) {
    return (
      <details
        className={`${styles.testDetail} ${test.hidden ? styles.hidden : ""}`}
      >
        <summary>
          {test.hidden ? (
            <>
              <section className={styles.locked}>
                <LockedIcon />
                <h1>Hidden Test</h1>
              </section>
              <StatusPill hasRun={hasRun} passed={passed} />
            </>
          ) : (
            <>
              <h1>Test {index + 1}</h1>
              <StatusPill hasRun={hasRun} passed={passed} />
            </>
          )}
        </summary>
        {!test.hidden && (
          <div className={styles.detailContent}>
            <p>
              <strong>Input:</strong>
            </p>
            <pre>{test.code}</pre>
            <p>Expected: {test.expectedStdOut}</p>
            {hasRun && <p>Actual: {result.actual}</p>}
          </div>
        )}
      </details>
    );
  }

  return (
    <div
      className={`${styles.testCase} ${
        passed ? styles.passLight : result ? styles.failLight : ""
      }`}
    >
      <div className={styles.testHeader}>
        <section>
          <h3>Test {index + 1}:</h3>
          <p>{test.explanation}</p>
        </section>

        <div className={styles.testHeaderActions}>
          <ToggleButton
            checked={test.hidden}
            onChange={() => onUpdate("hidden", !test.hidden)}
            leftText="Hidden"
            rightText="Visible"
          />
          <DeleteButton onClick={onDelete}>X</DeleteButton>
        </div>
      </div>

      <TestCaseEditor
        language={language}
        src={test.code}
        setSource={(code) => onUpdate("code", code)}
      />

      <div className={styles.expectedBlock}>
        <label>Expected:</label>
        <TextArea
          rows={1}
          resizable={false}
          placeholder="Enter expected value"
          value={test.expectedStdOut}
          onChange={(e) => onUpdate("expectedStdOut", e.target.value)}
        />
      </div>

      {result && (
        <div className={styles.actualBlock}>
          <label>Actual:</label> <code>{result.actual}</code>
        </div>
      )}
    </div>
  );
}
