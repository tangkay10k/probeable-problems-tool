import { TextEditor } from "./text-editor";
import styles from "./text-editor.module.css";

export function TestCaseEditor({ language, src, setSource }) {
  return (
    <div className={styles.testCaseEditorWrapper}>
      <TextEditor
        language={language}
        src={src}
        setSource={setSource}
        showLanguageSelect={false}
        lineNumbers={false}
        fontSize={13}
        fixedHeight={60}
      />
    </div>
  );
}
