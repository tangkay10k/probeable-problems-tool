import { useEffect, useRef, useState } from "react";
import { Editor } from "@monaco-editor/react";
import LanguageSelector from "./language-selector.jsx";
import { CODE_SNIPPETS } from "./data/constants.js";
import styles from "./text-editor.module.css";

export function TextEditor({
  setLanguage,
  language,
  src,
  setSource,
  showLanguageSelect = true,
  lineNumbers = true,
  fontSize = 13,
  isResizable = false,
  fixedHeight = 200,
  minHeight = 100,
}) {
  const [editorHeight, setEditorHeight] = useState(fixedHeight);
  const containerRef = useRef(null);
  const editorRef = useRef(null);

  const onSelect = (lang) => {
    setLanguage(lang);
    setSource(CODE_SNIPPETS[lang]);
  };

  const options = {
    automaticLayout: false,
    minimap: { enabled: false },
    fontSize,
    lineNumbers,
    wordWrap: "on",
    fontLigatures: true,
    fontFamily: "JetBrains Mono, monospace",
    scrollBeyondLastLine: false,
  };

  function handleEditorDidMount(editor, monaco) {
    editorRef.current = editor;
    editor.layout();

    if (isResizable) {
      const lineHeight = editor.getOption(
        monaco.editor.EditorOption.lineHeight,
      );
      editor.onDidContentSizeChange((e) => {
        const newHeight = e.contentHeight + lineHeight;
        setEditorHeight(newHeight);
        editor.layout();
      });
    }
  }

  useEffect(() => {
    if (!isResizable || !containerRef.current) return;
    const ro = new ResizeObserver(() => {
      const height = containerRef.current.clientHeight;
      setEditorHeight(height);
      if (editorRef.current) {
        editorRef.current.layout();
      }
    });
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, [isResizable]);

  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
        height: isResizable ? editorHeight : fixedHeight,
        resize: isResizable ? "vertical" : "none",
        overflow: isResizable ? "auto" : "hidden",
        display: "flex",
        flexDirection: "column",
        minHeight: isResizable ? minHeight : fixedHeight,
      }}
    >
      {showLanguageSelect && (
        <LanguageSelector language={language} onLanguageSelect={onSelect} />
      )}
      <Editor
        className={styles.textEditor}
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
