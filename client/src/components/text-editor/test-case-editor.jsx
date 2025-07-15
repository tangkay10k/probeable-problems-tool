import useWithLoading from "@/hooks/useWithLoading.js";
import { TextEditor } from "./text-editor";
import { getTestTemplate } from "@/routes/test-template-route.js";
import styles from "./text-editor.module.css";

export function TestCaseEditor({
  setLanguage,
  language,
  src,
  setSource,
  setTestTemplate,
}) {
  const [_, withLoading] = useWithLoading();
  const onSelect = (lang) => {
    withLoading(
      () => getTestTemplate(lang),
      (template) => setTestTemplate(template),
      (err) => console.log(`No template for ${lang}`, err),
    );

    setLanguage(lang);
  };

  return (
    <div className={styles.testCaseEditorWrapper}>
      <TextEditor
        setLanguage={onSelect}
        language={language}
        src={src}
        setSource={setSource}
        showLanguageSelect={false}
        lineNumbers={false}
        fontSize={13}
        fixedHeight={80}
      />
    </div>
  );
}
