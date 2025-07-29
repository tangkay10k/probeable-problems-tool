import React from "react";
import { TestCaseEditor } from "@/components/text-editor/test-case-editor.jsx";
import TextArea from "@/components/inputs/text-area.jsx";
import styles from "./test-suite.module.css";
import Button from "@/components/button/button.jsx";
import DeleteButton from "@/components/button/delete-button";

export function TestSuiteList({
  tests,
  setTests,
  language,
  results,
  setResults,
  isEditable = true,
}) {
  const updateTest = (index, field, value) =>
    setTests(tests.map((t, i) => (i === index ? { ...t, [field]: value } : t)));

  const addTestCase = () => {
    setTests([...tests, { code: "", expectedStdOut: "" }]);
    setResults([...results, { actual: "" }]);
  };

  const deleteTest = (index) => {
    setTests(tests.filter((_, i) => i !== index));
    setResults(results.filter((_, i) => i !== index));
  };

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
          updateTest={(field, value) => updateTest(idx, field, value)}
          deleteTest={() => deleteTest(idx)}
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

function TestCase({
  index,
  test,
  result,
  language,
  isEditable,
  updateTest,
  deleteTest,
}) {
  const hasRun = result?.actual != null && result.actual !== "";
  const passed = hasRun && result.actual === test.expectedStdOut;

  if (!isEditable) {
    return (
      <details key={index} className={styles.testDetail}>
        <summary>
          <h1>Test {index + 1}</h1>
          {hasRun && (
            <span
              className={`${styles.pill} ${passed ? styles.pass : styles.fail}`}
            >
              {passed ? "✓ Passed" : "✗ Failed"}
            </span>
          )}
        </summary>
        <div className={styles.detailContent}>
          <p>
            <strong>Input:</strong> <br />
          </p>
          <pre>{test.code}</pre>
          <br />
          <p>Expected: {test.expectedStdOut}</p>
          {hasRun && <p> Actual: {result?.actual ?? "N/A"}</p>}
        </div>
      </details>
    );
  }

  return (
    <div
      className={`${styles.testCase} ${passed ? styles.passLight : result ? styles.failLight : ""}`}
    >
      <div className={styles.testHeader}>
        <h3>Test {index + 1}</h3>
        <DeleteButton onClick={deleteTest}>X</DeleteButton>
      </div>

      <TestCaseEditor
        language={language}
        src={test.code}
        setSource={(newCode) => updateTest("code", newCode)}
      />

      <div className={styles.expectedBlock}>
        <label>Expected:</label>
        <TextArea
          rows={1}
          resizable={false}
          placeholder="Enter expected value"
          value={test.expectedStdOut}
          onChange={(e) => updateTest("expectedStdOut", e.target.value)}
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
