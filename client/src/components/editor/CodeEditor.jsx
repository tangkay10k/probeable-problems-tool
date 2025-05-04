import {Editor, useMonaco} from "@monaco-editor/react"
import {useEffect, useRef, useState} from "react"
import LanguageSelector from "./LanguageSelector.jsx";
import {Col, Container, Row} from "react-bootstrap";
import {CODE_SNIPPETS, LANGUAGE_VERSIONS} from "./constants.js";
import {Output} from "./Output.jsx";
import {getRuntimes} from "../../routes/code-route.js";
import {trigger} from "./resize-event.jsx";

export function CodeEditor({ editorRef, setLanguage, language, src, setSource, height='50em'}) {

    function handleMount(editor) {
        if (editorRef && !editorRef.current) {
            editorRef.current = editor
        }
        editor.focus()
    }

    const onSelect = (language) => {
        setLanguage(language)
        setSource(CODE_SNIPPETS[language])
    }

    /* Add code editor configuration options here */
    const options = {
        minimap: { enabled: false }
    }

    return (
        <Container className="bg-dark p-2 rounded mb-2">
            <Col className="d-flex align-items-start">
                <LanguageSelector
                    language={language}
                    onSelect={onSelect}
                />
            </Col>
            <Editor
                height={height}
                theme="vs-dark"
                language={language}
                value={src}
                onChange={(value) => setSource(value)}
                onMount={handleMount}
                options={options}
            />
        </Container>
    )
}

export function EditorWrapper() {
    const [side, setSide] = useState(false)
    const onClickHandler = () => {
        setSide(!side)
        trigger()
    }

    return (
        <div >
            <button onClick={onClickHandler}>TOGGLE</button>
            {side && <div></div>}

            <div>
                <CodeEditor />
            </div>
        </div>
    )
}