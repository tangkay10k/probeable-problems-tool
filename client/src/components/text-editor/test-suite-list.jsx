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

const normalize = (s) => (s ?? "").replace(/\r\n/g, "\n"); // avoid CRLF noise
const deriveStatus = (result, expectedRaw) => {
  const hasRun = result?.actual !== undefined; // true even for ""
  if (!hasRun)
    return { hasRun, isCompilationError: false, passed: false, status: null };

  const isCompilationError = result?.actual === "[COMPILATION ERROR]";
  if (isCompilationError)
    return { hasRun, isCompilationError, passed: false, status: "compile" };

  // Prefer the runner's truth if it provided it
  const expected = normalize(expectedRaw);
  const actual = normalize(result?.actual);
  const passed =
    typeof result?.pass === "boolean" ? result.pass : actual === expected;

  return {
    hasRun,
    isCompilationError: false,
    passed,
    status: passed ? "passed" : "failed",
  };
};

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
      console.log(next);

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
      {tests &&
        tests.map((test, idx) => (
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

const StatusPill = ({ status }) => {
  if (!status) return null;

  const map = {
    passed: { cls: styles.pass, label: "✓ Passed" },
    failed: { cls: styles.fail, label: "✗ Failed" },
    compile: { cls: styles.compile, label: "⚠ Compilation Error" },
  };

  const { cls, label } = map[status] ?? map.failed;
  return <span className={`${styles.pill} ${cls}`}>{label}</span>;
};

export function NonEditableTestCase({ index, test, result }) {
  const { addLog } = useLogging();

  const { hasRun, passed, status } = deriveStatus(result, test.expectedStdOut);
  const isCompilationError = result?.actual === "[COMPILATION ERROR]";

  const preventToggleIfLocked = (e) => {
    if (!hasRun || isCompilationError) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  const handleSummaryKeyDown = (e) => {
    if (
      (!hasRun || isCompilationError) &&
      (e.key === " " || e.key === "Enter")
    ) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  const handleToggle = (e) => {
    // safety: if it somehow toggled, immediately close when locked
    if (!hasRun || isCompilationError) {
      e.preventDefault();
      e.currentTarget.open = false;
      return;
    }

    const isOpen = e.currentTarget.open;
    const contentStr = `Input: ${test.code || "<empty>"} | Expected: ${
      test.expectedStdOut || "<empty>"
    } | Actual: ${result.actual ?? "<not run>"} | Hidden: ${
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
      aria-disabled={!hasRun || isCompilationError}
    >
      <summary
        onClick={preventToggleIfLocked}
        onKeyDown={handleSummaryKeyDown}
        aria-disabled={!hasRun || isCompilationError}
        title={
          !hasRun
            ? "Run the test to view details"
            : isCompilationError
              ? "Fix compilation errors to view details"
              : undefined
        }
      >
        {test.hidden ? (
          <>
            <section className={styles.locked}>
              <LockedIcon />
              <h1>Hidden Test</h1>
            </section>
            <StatusPill status={status} />
          </>
        ) : (
          <>
            <section className={styles.locked}>
              {(!hasRun || isCompilationError) && <LockedIcon />}
              <h1>Test {index + 1}</h1>
            </section>
            <StatusPill status={status} />
          </>
        )}
      </summary>

      {!test.hidden && !isCompilationError && (
        <div className={styles.detailContent}>
          <p>
            <strong>Input:</strong>
          </p>
          <pre>{test.code}</pre>
          <DiffView actual={result?.actual} expected={test.expectedStdOut} />
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
            leftText="Visible"
            rightText="Hidden"
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
