import { CodeEditor } from './CodeEditor.jsx'
import { Col, Container } from 'react-bootstrap'
import { Output } from './Output.jsx'
import { useRef, useState } from 'react'
import { CODE_SNIPPETS } from './constants.js'
import { Oracle } from './Oracle.jsx'

export default function StudentEditor({ problem, height }) {
  const [value, setValue] = useState('')
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
      <Container className="d-flex flex-column">
        <Oracle language={language} intialProbe={problem.defaultProbe} />
        <Output language={language} editorRef={editorRef} />
      </Container>
    </Container>
  )
}
