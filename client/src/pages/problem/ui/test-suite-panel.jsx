import { TestSuiteList } from "@/components/text-editor/test-suite-list.jsx";
import styles from "@/pages/problem/problemPage.module.css";

export default function TestSuitePanel({
  tests = [],
  language,
  results,
  setResults,
}) {
  return (
    <div className={styles.testSuiteContainer}>
      <section className={styles.listWrapper}>
        {results?.length > 0 ? (
          <>
            <TestSuiteList
              tests={tests}
              language={language}
              isEditable={false}
              results={results}
              setResults={setResults}
            />
            <div className={styles.gradient} />
          </>
        ) : (
          <div className={styles.testSuiteEmpty}>
            Please run your code first!
          </div>
        )}
      </section>
    </div>
  );
}
