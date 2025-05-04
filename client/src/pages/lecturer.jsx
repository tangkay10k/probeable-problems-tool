import {CodeEditor} from "../components/editor/CodeEditor.jsx";
import {useRef, useState} from "react";
import {CODE_SNIPPETS} from "../components/editor/constants.js";
import {Container} from "react-bootstrap";
import {Output} from "../components/editor/Output.jsx";


export default function Lecturer() {
    const [solution, setSolution] = useState("")
    const [testSuite, setTestSuite] = useState("")
    const [probes, setProbes] = useState("")
    const [language, setLanguage] = useState('java')
    const solutionEditorRef = useRef(null)
    const testSuiteEditorRef = useRef(null)
    const probeEditorRef = useRef(null)

    return (
        <Container className='bg-light rounded p-2'>
            <h5>Please Enter the model solution: </h5>
            <p><i>This will be used as the problem oracle.</i></p>
            <CodeEditor
                height="30em"
                editorRef={solutionEditorRef}
                language={language}
                setLanguage={setLanguage}
                src={solution}
                setSource={setSolution}
            />
            <Output
                language={language}
                editorRef={solutionEditorRef}
                minHeight="5em"
                heading="Check your solution compiles"
                initialText="Validate your solution"
                buttonColour='primary'
                buttonText='Check!'
            />
            <h5>Create your test suite: </h5>
            <p><i>Note that these are test test cases that student's submissions will be validated against</i></p>
            <CodeEditor
                height="30em"
                editorRef={testSuiteEditorRef}
                language={language}
                setLanguage={setLanguage}
                src={testSuite}
                setSource={setTestSuite}
            />
            <Output
                language={language}
                editorRef={testSuiteEditorRef}
                minHeight="5em"
                heading={"Check your test suite compiles"}
                buttonColour='primary'
                buttonText='Check!'
            />
            <h5>Enter initial probes: </h5>
            <p><i>These will be the initial probes displayed to students when they first receive the question.</i></p>
                <CodeEditor
                    height="10em"
                    editorRef={probeEditorRef}
                    language={language}
                    setLanguage={setLanguage}
                    src={probes}
                    setSource={setProbes}
                />
                <Output
                    language={language}
                    editorRef={probeEditorRef}
                    minHeight="5em"
                    heading={"Check your probes work!"}
                    buttonColour='primary'
                    buttonText='Check!'
                />
        </Container>

)
}