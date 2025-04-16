import {Editor, useMonaco} from "@monaco-editor/react"
import {useEffect, useRef, useState} from "react"
import LanguageSelector from "./LanguageSelector.jsx";
import {Container} from "react-bootstrap";
import {CODE_SNIPPETS} from "./constants.js";

export function CodeEditor() {
    const monaco = useMonaco()
    const editorRef = useRef(null)
    const [value, setValue] = useState(CODE_SNIPPETS['java'])
    const [language, setLanguage] = useState('java')

    const onSelect = (language) => {
        setLanguage(language)
        setValue(CODE_SNIPPETS[language])
    }

    function handleEditorValidation(markers) {
        // model markers
        markers.forEach((marker) => console.log('onValidate:', marker.message));
    }

    useEffect(() => {
        if (monaco) {
            console.log('here is the monaco instance:', monaco);
        }
    }, [monaco])

    function handleMount(editor) {
        editorRef.current = editor
        editor.focus()
    }

    return (
        <Container
            fluid
            className="bg-dark p-3 rounded pt-0"
            style={{width: '70vw'}}>>
            <div className='d-flex align-items-start mt-0'>
                <LanguageSelector
                    language={language}
                    onSelect={onSelect}/>
            </div>
            <Editor
                height={"65vh"}
                theme="vs-dark"
                defaultLanguage={language}
                defaultValue={value}
                value={value}
                onChange={(value) => setValue(value)}
                onMount={handleMount}
                onValidate={handleEditorValidation}
            />
        </Container>
    )
}