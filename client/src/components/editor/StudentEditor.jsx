import { CodeEditor } from './CodeEditor.jsx'
import { Col, Container } from 'react-bootstrap'
import { Output } from './Output.jsx'
import { useRef, useState } from 'react'
import { CODE_SNIPPETS } from './constants.js'

export default function StudentEditor({ problem, height }) {
  const [value, setValue] = useState(
    problem ? problem.defaultProbe : CODE_SNIPPETS['java']
  )
  const [language, setLanguage] = useState('java')
  const editorRef = useRef(null)

  return (
    <Container fluid className="d-flex flex-row gap-1">
      <CodeEditor
        height={height}
        editorRef={editorRef}
        language={language}
        setLanguage={setLanguage}
        src={value}
        setSource={setValue}
      />
      <Output language={language} editorRef={editorRef} />
    </Container>
  )
}
