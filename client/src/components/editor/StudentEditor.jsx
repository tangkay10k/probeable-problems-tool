import {CodeEditor} from "./CodeEditor.jsx";
import {Col, Container} from "react-bootstrap";
import {Output} from "./Output.jsx";
import {useRef, useState} from "react";
import {CODE_SNIPPETS} from "./constants.js";


export default function StudentEditor() {
    const [value, setValue] = useState(CODE_SNIPPETS['java'])
    const [language, setLanguage] = useState('java')
    const editorRef = useRef(null)

    const onSelect = (language) => {
        setLanguage(language)
        setValue(CODE_SNIPPETS[language])
    }

    return (
        <Container fluid className="d-flex flex-row">
            <CodeEditor
                editorRef={editorRef}
                language={language}
                onSelect={onSelect}
                value={value}
                setValue={setValue}
            />
            <Output language={language} editorRef={editorRef}/>
        </Container>
    )
}