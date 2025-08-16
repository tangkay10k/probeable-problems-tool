import { forwardRef } from "react";
import { LoggingTextEditor } from "@/components/text-editor/logging-text-editor.jsx";
import styles from "@/pages/problem/problemPage.module.css";

const EditorPanel = forwardRef(function EditorPanel(
  { language, src, setSource },
  ref,
) {
  return (
    <div className={styles.editorWrapper}>
      <LoggingTextEditor
        ref={ref}
        language={language}
        src={src}
        setSource={setSource}
      />
    </div>
  );
});

export default EditorPanel;
