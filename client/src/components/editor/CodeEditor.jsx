import {Editor, useMonaco} from "@monaco-editor/react"
import {useEffect, useRef, useState} from "react"
import LanguageSelector from "./LanguageSelector.jsx";
import {Col, Container, Row} from "react-bootstrap";
import {CODE_SNIPPETS, LANGUAGE_VERSIONS} from "./constants.js";
import {Output} from "./Output.jsx";
import {getRuntimes} from "../../routes/code-route.js";

export function CodeEditor() {
    const monaco = useMonaco()
    const editorRef = useRef(null)
    const [value, setValue] = useState(CODE_SNIPPETS['java'])
    const [language, setLanguage] = useState('java')

    useEffect(() => {
        async function fetchRuntimes() {
            try {
                const array = await getRuntimes()
                for (const key in array) {
                    if (LANGUAGE_VERSIONS.hasOwnProperty(array[key].language)) {
                        LANGUAGE_VERSIONS[key] = array[key].version
                    }
                }
            } catch (error) {
                console.error(error)
            }
        }

        fetchRuntimes()
    }, [])

    const onSelect = (language) => {
        setLanguage(language)
        setValue(CODE_SNIPPETS[language])
    }
    
    function handleMount(editor) {
        editorRef.current = editor
        editor.focus()
    }

    return (
        <Container fluid className="bg-dark p-3 rounded w-100">
            <Row className="mb-0">
                <Col className="d-flex align-items-start">
                    <LanguageSelector
                        language={language}
                        onSelect={onSelect}
                    />
                </Col>
            </Row>
            <Row>
                <Col md={6} className='p-1'>
                    <Editor
                        height={"65vh"}
                        theme="vs-dark"
                        language={language}
                        value={value}
                        onChange={(value) => setValue(value)}
                        onMount={handleMount}
                    />
                </Col>
                <Col className='p-1' md={6}>
                    <Output language={language} editorRef={editorRef}/>
                </Col>
            </Row>
        </Container>
    )
}