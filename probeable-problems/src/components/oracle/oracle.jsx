import styles from "./oracle.module.css";
import { TextEditor } from "@/components/text-editor/text-editor.jsx";
import Button from "@/components/button/button.jsx";
import TextArea from "@/components/inputs/text-area.jsx";

export default function Oracle() {
  return (
    <div className={styles.oracleWrapper}>
      <div className={styles.header}>
        <div className={styles.icon}>
          <img src={"/oracle.svg"} alt={"Oracle"} />
        </div>
        <h3>Mysterious Code Box</h3>
      </div>
      <div className={styles.oracle}>
        <div className={styles.editorContainer}>
          <div className={styles.editorWrapper}>
            <TextEditor
              // TODO: Derive language for problem from backend
              showLanguageSelect={false}
              lineNumbers={false}
              isResizable={false}
              fixedHeight={50}
              fontSize={12}
            />
          </div>

          <Button>Run</Button>
        </div>
        <TextArea
          placeholder={"Output: "}
          disabled={true}
          resizable={false}
          rows={3}
        ></TextArea>
      </div>
    </div>
  );
}
