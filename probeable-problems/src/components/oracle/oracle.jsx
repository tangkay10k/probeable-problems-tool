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
          {/*<TextEditor showLanguageSelect={false} height={60} />*/}
          <Button>Run</Button>
        </div>
        <TextArea
          placeholder={"Output: "}
          disabled={true}
          rows={2}
          resizable={false}
        ></TextArea>
      </div>
    </div>
  );
}
