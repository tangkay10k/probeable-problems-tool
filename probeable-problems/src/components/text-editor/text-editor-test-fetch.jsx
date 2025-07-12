import useWithLoading from "@/hooks/useWithLoading.js";
import { TextEditor } from "./text-editor";
import {
    getTestTemplate,
} from "@/routes/test-template-route.js";

export function TextEditorTestFetch({
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
    const [_, withLoading] = useWithLoading();
    const onSelect = (lang) => {
        withLoading(
            async () => await getTestTemplate(lang),
            (template) => setTestTemplate(template),
            (err) => console.log(`No template for ${lang}`, err)
        );

        setLanguage(lang);
    };

    return (
        <TextEditor
            setLanguage={onSelect}
            language={language}
            src={src}
            setSource={setSource}
            showLanguageSelect={showLanguageSelect}
            lineNumbers={lineNumbers}
            fontSize={fontSize}
            isResizable={isResizable}
            fixedHeight={fixedHeight}
        />
    )
}
