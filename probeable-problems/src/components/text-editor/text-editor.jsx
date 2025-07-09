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
  height = 200, // Height in px
  fontSize = 13,
}) {
  const onSelect = (language) => {
    setLanguage(language);
    setSource(CODE_SNIPPETS[language]);
  };

  /* Add code editor configuration options here */
  const options = {
    minimap: { enabled: false },
    fontSize: fontSize,
    lineNumbers: lineNumbers,
    wordWrap: "on",
    fontLigatures: true,
    fontFamily: "JetBrains Mono, monospace",
  };

  return (
    <div>
      {showLanguageSelect && (
        <LanguageSelector language={language} onLanguageSelect={onSelect} />
      )}
      <Editor
        className={styles.textEditor}
        height={`${height}px`}
        theme="vs-dark"
        language={language}
        value={src}
        onChange={(value) => setSource(value)}
        options={options}
      />
      {showLanguageSelect && <div className={styles.textEditorFooter} />}
    </div>
  );
}
