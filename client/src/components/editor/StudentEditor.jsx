import { CodeEditor } from './CodeEditor.jsx'
import { Container } from 'react-bootstrap'
import { Output } from './Output.jsx'
import { useRef, useState } from 'react'
import { Oracle } from './Oracle.jsx'
import QuestionHistoryList from './QuestionHistoryList.jsx'

export default function StudentEditor({ problem }) {
  const [value, setValue] = useState('')
  const [language, setLanguage] = useState('java')
  const [questionHistory, setQuestionHistory] = useState([
    { probe: 'Can a and b be inclusive or exclusive?', response: 'Both inclusive and exclusive cases can be considered based on the context.' },
    { probe: 'What is polymorphism?', response: 'Polymorphism allows objects of different classes to be treated as instances of the same class through inheritance.' },
    { probe: 'Can a and b be inclusive or exclusive?', response: 'Both inclusive and exclusive cases can be considered based on the context.' },
  ])

  const editorRef = useRef(null)

  return (
    <Container
      fluid
      className="d-flex p-0"
      style={{ width: '100%', height: '100%', overflow: 'hidden' }}
    >
      <Container
        fluid
        className="d-flex flex-column p-2"
        style={{ flex: 1, overflow: 'hidden' }}
      >
        <CodeEditor
          height="100%"
          editorRef={editorRef}
          language={language}
          setLanguage={setLanguage}
          src={value}
          setSource={setValue}
        />
      </Container>
      <Container
        fluid
        className="d-flex flex-column p-2"
        style={{
          flex: 1,
          overflowY: 'auto',
          borderLeft: '1px solid #ccc',
          borderRight: '1px solid #ccc',
        }}
      >
        <Oracle language={language} intialProbe={problem?.defaultProbe} />
        <Output language={language} editorRef={editorRef} />
      </Container>
      <Container
        fluid
        className="d-flex flex-column p-2"
        style={{
          width: '200px',
          minWidth: '200px',
          maxWidth: '250px',
          overflowY: 'auto',
          borderLeft: '1px solid #ccc',
          backgroundColor: '#f9f9f9',
        }}
      >
        <QuestionHistoryList questionHistory={questionHistory} />
      </Container>
    </Container>
  )
}
