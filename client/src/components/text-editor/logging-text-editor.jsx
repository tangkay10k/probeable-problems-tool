import { forwardRef } from "react";
import { useProblemAttemptContext } from "@/context/problem-attempt-context.js";
import { logPastedContent } from "@/routes/log-route.js";
import { TextEditor } from "@/components/text-editor/text-editor.jsx";

//NOTE only use this component as a child of problemAttemptProvider
export const LoggingTextEditor = forwardRef(
  (
    {
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
      disableLanguageSelect = false,
    },
    ref,
  ) => {
    const { problemAttempt } = useProblemAttemptContext();

    function handleLogPaste(editor) {
      editor.onDidPaste((e) => {
        const model = editor.getModel();
        const pastedRange = e.range;

        const pastedText = model.getValueInRange(pastedRange);

        const fullText = editor.getValue();
        if (problemAttempt && pastedText) {
          logPastedContent(problemAttempt.id, {
            pastedContent: pastedText,
            afterPastedContent: fullText,
          });
        }
      });
    }

    return (
      <TextEditor
        setLanguage={setLanguage}
        language={language}
        src={src}
        setSource={setSource}
        showLanguageSelect={showLanguageSelect}
        lineNumbers={lineNumbers}
        fontSize={fontSize}
        isResizable={isResizable}
        fixedHeight={fixedHeight}
        minHeight={minHeight}
        disableLanguageSelect={disableLanguageSelect}
        isLogging
        ref={ref}
        handleLogPaste={handleLogPaste}
      />
    );
  },
);
