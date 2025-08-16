import { useCallback } from "react";
import { TestCaseEditor } from "@/components/text-editor/test-case-editor.jsx";
import TextArea from "@/components/inputs/text-area.jsx";
import styles from "./test-suite.module.css";
import Button from "@/components/button/button.jsx";
import DeleteButton from "@/components/button/delete-button";
import ToggleButton from "@/components/button/toggle-button";
import { FaLock as LockedIcon } from "react-icons/fa";
import { useLogging } from "@/context/logging-context-provider.jsx";
import { Action, Component } from "@/constants/logConstants.js";
import DiffView from "@/components/diff-view/diff-view.jsx";

export function TestSuiteList({
  tests = [],
  setTests,
  language,
  results = [],
  setResults,
  isEditable = true,
}) {
  const updateTest = useCallback(
    (index, field, value) => {
      const next = Array.isArray(tests)
        ? tests.map((t, i) => (i === index ? { ...t, [field]: value } : t))
        : [];

      setTests(next);
    },
    [tests, setTests],
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

export function NonEditableTestCase({ index, test, result }) {
  const { addLog } = useLogging();
  const hasRun = Boolean(result?.actual);
  const passed = hasRun && result.actual === test.expectedStdOut;

  const preventToggleIfLocked = (e) => {
    if (!hasRun) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  const handleSummaryKeyDown = (e) => {
    if (!hasRun && (e.key === " " || e.key === "Enter")) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  const handleToggle = (e) => {
    const isOpen = e.currentTarget.open;

    const contentStr = `Input: ${test.code || "<empty>"} | Expected: ${
      test.expectedStdOut || "<empty>"
    } | Actual: ${rawResult ?? "<not run>"} | Hidden: ${
      test.hidden ? "yes" : "no"
    } | Passed: ${passed ? "yes" : "no"}`;

    addLog({
      component: Component.TEST_CASE,
      action: isOpen ? Action.OPENED : Action.CLOSED,
      name: `Test ${index + 1}`,
      content: contentStr,
    });
  };

  return (
    <details
      className={`${styles.testDetail} ${test.hidden ? styles.hidden : ""}`}
      onToggle={handleToggle}
    >
      <summary
        onClick={preventToggleIfLocked}
        onKeyDown={handleSummaryKeyDown}
        aria-disabled={!hasRun}
        title={!hasRun ? "Run the test to view details" : undefined}
      >
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
            <section className={styles.locked}>
              {!passed && !hasRun && <LockedIcon />}
              <h1>Test {index + 1}</h1>
            </section>
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
          {result?.actual && (
            <DiffView actual={result?.actual} expected={test.expectedStdOut} />
          )}
          {/*<p>Expected: {test.expectedStdOut}</p>*/}
          {/*{hasRun && <p>Actual: {rawResult}</p>}*/}
        </div>
      )}
    </details>
  );
}

export function EditableTestCase({
  index,
  test,
  result,
  language,
  onUpdate,
  onDelete,
}) {
  const hasRun = Boolean(result?.actual);
  const passed = hasRun && result.actual === test.expectedStdOut;

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

export default function TestCase(props) {
  const { isEditable, ...rest } = props;
  return isEditable ? (
    <EditableTestCase {...rest} />
  ) : (
    <NonEditableTestCase {...rest} />
  );
}
