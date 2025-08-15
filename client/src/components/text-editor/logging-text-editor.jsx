import { forwardRef, useRef } from "react";
import { useProblemAttemptContext } from "@/context/problem-attempt-context.js";
import { logPastedContent } from "@/routes/log-route.js";
import { TextEditor } from "@/components/text-editor/text-editor.jsx";
import { useLogging } from "@/context/logging-context-provider.jsx";
import { Action, Component } from "@/constants/logConstants.js"

export const LoggingTextEditor = forwardRef(function LoggingTextEditor(
  {
    setLanguage,
    language,
    src,
    setSource,
    showLanguageSelect = true,
    lineNumbers = true,
    fontSize = 15,
    isResizable = false,
    fixedHeight = "100%",
    minHeight = 100,
    disableLanguageSelect = true,
  },
  ref
) {
  const { problemAttempt } = useProblemAttemptContext();
  const { addLog } = useLogging();
  const typingTimerRef = useRef(null);
  const TYPING_DEBOUNCE_MS = 2000;

  function handleLogPaste(editor) {
    editor.onDidPaste((e) => {
      const model = editor.getModel();
      const pastedText = model.getValueInRange(e.range);
      const fullText = editor.getValue();
      if (problemAttempt && pastedText) {
        logPastedContent(problemAttempt.id, {
          pastedContent: pastedText,
          afterPastedContent: fullText,
        });
      }
    });
  }

  function handleLogTyping(editor) {
    editor.onDidType(() => {
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
      typingTimerRef.current = setTimeout(() => {
        const value = editor.getValue();
        addLog({
          component: Component.CODE_EDITOR,
          action: Action.TYPED,
          content: `${value}`,
        });
      }, TYPING_DEBOUNCE_MS);
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
      handleLogTyping={handleLogTyping}
    />
  );
});
