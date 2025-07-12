import useWithLoading from "@/hooks/useWithLoading.js";
import { TextEditor } from "./text-editor";
import {
    getTestTemplate,
} from "@/routes/test-template-route.js";

export function TestCaseEditor({
    setLanguage,
    language,
    src,
    setSource,
    showLanguageSelect = false,
    lineNumbers = false,
    fontSize = 13,
    fixedHeight = 200, 
    setTestTemplate
}) {
    const [_, withLoading] = useWithLoading();
    const onSelect = (lang) => {
        withLoading(
            () =>  getTestTemplate(lang),
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
            fixedHeight={fixedHeight}
        />
    )
}
