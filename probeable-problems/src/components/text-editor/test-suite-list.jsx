import React, { createContext, useContext } from "react";
import { TestCaseEditor } from "@/components/text-editor/test-case-editor.jsx";
import TextArea from "@/components/inputs/text-area.jsx";
import styles from "./test-suite.module.css";
import Button from "@/components/button/button.jsx";
import DeleteButton from "@/components/button/delete-button";

const TestSuiteContext = createContext(null);

export function TestSuiteList({
  tests,
  setTests,
  language,
  setLanguage,
  results,
  setResults,
  setTestTemplate,
}) {
  const updateTest = (index, field, value) => {
    const updated = tests.map((test, i) =>
      i === index ? { ...test, [field]: value } : test,
    );
    setTests(updated);
  };

  const addTestCase = () => {
    setTests([...tests, { code: "", expectedStdOut: "" }]);
  };

  const deleteTest = (index) => {
    setTests(tests.filter((_, i) => i !== index));
    setResults(results.filter((_, i) => i !== index));
  };

  return (
    <TestSuiteContext.Provider
      value={{
        tests,
        results,
        language,
        setLanguage,
        updateTest,
        deleteTest,
        setTestTemplate,
      }}
    >
      <div className={styles.testContainer}>
        {tests.map((test, index) => (
          <TestCase key={index} index={index} />
        ))}

        <div className={styles.addButtonContainer}>
          <Button onClick={addTestCase}>Add Test Case</Button>
        </div>
      </div>
    </TestSuiteContext.Provider>
  );
}

function TestCase({ index }) {
  const {
    tests,
    results,
    language,
    setLanguage,
    updateTest,
    deleteTest,
    setTestTemplate,
  } = useContext(TestSuiteContext);
  const test = tests[index];
  const result = results?.[index];

  return (
    <div
      className={`${styles.testCase} ${
        result
          ? result.actual === result.expected
            ? styles.pass
            : styles.fail
          : ""
      }`}
    >
      <div className={styles.testHeader}>
        <h3>Test {index + 1}</h3>
        <DeleteButton onClick={() => deleteTest(index)}>X</DeleteButton>
      </div>

      <TestCaseEditor
        language={language}
        setLanguage={setLanguage}
        src={test.code}
        setSource={(newCode) => updateTest(index, "code", newCode)}
        setTestTemplate={setTestTemplate}
      />

      <div className={styles.expectedBlock}>
        <label>Expected:</label>
        <TextArea
          rows={1}
          resizable={false}
          placeholder="Enter expected value"
          value={test.expectedStdOut}
          onChange={(e) => updateTest(index, "expectedStdOut", e.target.value)}
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
