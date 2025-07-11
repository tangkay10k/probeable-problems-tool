import { TextEditor } from "@/components/text-editor/text-editor.jsx";
import TextArea from "@/components/inputs/text-area.jsx";
import styles from './code-and-output.module.css'
import Button from "@/components/button/button.jsx";
import DeleteButton from "@/components/button/delete-button";
export function CodeAndOutput({ tests, setTests, language, setLanguage, results, setResults }) {
    const updateCodeAtIndex = (index, newCode) => {
        const updatedTests = [...tests];

        updatedTests[index] = {
            ...updatedTests[index],
            code: newCode,
        };
        setTests(updatedTests);
    };

    const updateExpectedOutputAtIndex = (index, newValue) => {
        const updatedTests = [...tests];

        updatedTests[index] = {
            ...updatedTests[index],
            expectedStdOut: newValue,
        };
        setTests(updatedTests);
    };

    const addTestCase = () => {
        const newTest = {
            code: "",
            expectedStdOut: "",
        };

        const updatedTests = [...tests, newTest];
        setTests(updatedTests);
    };

    const deleteTest = (index) => {
        const updatedTests = tests.filter((_, i) => i !== index);
        const updatedResults = results.filter((_, i) => i !== index);

        setTests(updatedTests);
        setResults(updatedResults);
    }

    return (
        <div className={styles.testContainer}>
            {tests && tests.map((test, index) => (
                <div
                    key={index}
                    className={`${styles.editor} ${results?.[index]
                        ? results[index].actual === results[index].expected
                            ? styles.pass
                            : styles.fail
                        : ""
                        }`}
                >
                    <div className={styles.testHeader}>
                        <div className={styles.testLabel}>{`Test ${index + 1}`}</div>
                        <DeleteButton onClick={() => deleteTest(index)}>X</DeleteButton>
                    </div>
                    <TextEditor
                        language={language}
                        setLanguage={setLanguage}
                        src={test.code}
                        setSource={(newCode) => updateCodeAtIndex(index, newCode)}
                        fixedHeight={100}
                    />

                    <label className={styles.outputLabel}>Expected Output</label>
                    <TextArea
                        rows={1}
                        placeholder="Expected output: ..."
                        value={test.expectedStdOut}
                        onChange={(e) => updateExpectedOutputAtIndex(index, e.target.value)}
                    />

                    {results?.[index] && (
                        <div className={styles.resultBlock}>
                            <div>
                                <span className={styles.resultLabel}>Actual:</span>{' '}
                                <code>{results[index].actual}</code>
                            </div>
                        </div>
                    )}
                </div>
            ))}
            <div className={styles.addButtonContainer}>
                <Button onClick={addTestCase}>Add Test Case</Button>
            </div>
        </div>
    );
}
