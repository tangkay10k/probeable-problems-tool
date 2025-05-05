import { Button, Container } from 'react-bootstrap'
import { CodeEditor } from './CodeEditor'
import Form from 'react-bootstrap/Form'
import { useState } from 'react'

export function Oracle({ intialProbe, language }) {
  const [probe, setProbe] = useState(intialProbe)

  const sendProbe = () => {
    console.log('TO DO: SEND')
  }

  return (
    <Container className="bg-secondary w-100 h-100 rounded mb-3 p-2 pb-3">
      <p className="text-light mb-0 pb-0">
        Probe to understand what the client is looking for!
      </p>
      <CodeEditor
        height="6em"
        lineNumbers="off"
        showLanguageSelect={false}
        src={probe}
        setSource={setProbe}
        setLanguage={language}
      />
      <p className="text-light mb-0 pb-0">
        Please describe your thought process with this probe:
      </p>
      <div className="d-flex flex-row gap-2 m-0 p-0">
        <Form.Control
          as="textarea"
          placeholder="E.g. I'm testing if this function takes in 3 parameters"
        />
        <Button onClick={sendProbe}>Probe!</Button>
      </div>
      <p className="text-light mt-1 mb-0 pb-0">Output:</p>
      <Form.Control as="textarea" disabled />
      <p className="text-light mt-1 mb-0 pb-0">Comments:</p>
      <Form.Control as="textarea" disabled />
    </Container>
  )
}
