import { useRef, useState } from "react";
import { Editor } from "@monaco-editor/react";
import LanguageSelector from "./language-selector.jsx";
import { CODE_SNIPPETS } from "./data/constants.js";
import styles from "./text-editor.module.css";
import {
  getTestTemplate,
} from "@/routes/test-template-route.js";

export function TextEditor({
  setLanguage,
  language,
  src,
  setSource,
  showLanguageSelect = true,
  lineNumbers = true,
  fontSize = 13,
  isResizable = false, // new prop to control resizable behavior
  fixedHeight = 200, // height to use when not resizable
  setTestTemplate
}) {
  // Track editor height in state
  const [editorHeight, setEditorHeight] = useState(fixedHeight);
  const containerRef = useRef();

  const onSelect = async (lang) => {
    if (setTestTemplate) {
      try{
      const template = await getTestTemplate(lang)
      setTestTemplate(template);
      }catch(e){
        console.log(`No Template exists for ${lang}`)
      }
    }

    setLanguage(lang);
    setSource(CODE_SNIPPETS[lang]);
  };

  // Config options
  const options = {
    automaticLayout: true,
    minimap: { enabled: false },
    fontSize,
    lineNumbers,
    wordWrap: "on",
    fontLigatures: true,
    fontFamily: "JetBrains Mono, monospace",
    scrollBeyondLastLine: false,
  };

  // When editor mounts, conditionally hook content-size changes
  function handleEditorDidMount(editor, monaco) {
    if (isResizable) {
      // Only auto-resize if isResizable is true
      const lineHeight = editor.getOption(
        monaco.editor.EditorOption.lineHeight,
      );

      editor.onDidContentSizeChange((e) => {
        const newHeight = e.contentHeight + lineHeight;
        setEditorHeight(newHeight);
        editor.layout();
      });
    } else {
      // For fixed height, just ensure initial layout
      editor.layout();
    }
  }

  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
        height: isResizable ? editorHeight : fixedHeight,
        // Add resize handle styling when resizable
        resize: isResizable ? "vertical" : "none",
        overflow: "hidden",
        minHeight: isResizable ? "100px" : fixedHeight,
      }}
    >
      {showLanguageSelect && (
        <LanguageSelector language={language} onLanguageSelect={onSelect} />
      )}
      <Editor
        className={styles.textEditor}
        width="100%"
        height={isResizable ? editorHeight : fixedHeight}
        theme="vs-dark"
        language={language}
        value={src}
        onChange={(value) => setSource(value)}
        onMount={handleEditorDidMount}
        options={options}
      />
      {showLanguageSelect && <div className={styles.textEditorFooter} />}
    </div>
  );
}
