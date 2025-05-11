import { Button, Container } from 'react-bootstrap'
import { CodeEditor } from './CodeEditor'
import Form from 'react-bootstrap/Form'
import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { executeProbe } from '../../routes/code-route'
import { LANGUAGE_VERSIONS, PISTON_TO_BACKEND } from './constants'
import { Loading } from './Loading'
import { submitThoughtProcess } from '../../routes/ai-route'
import { formatThoughtProcess } from '../../utils/thought-process'

export function Oracle({ intialProbe, language }) {
  const [probe, setProbe] = useState(intialProbe)
  const [userThoughts, setUserThoughts] = useState('')
  const [output, setOutput] = useState('')
  const [AIOutput, setAIOutput] = useState('')
  const [isThoughtValid, setIsThoughtValid] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const { id } = useParams()

  const sendProbe = async () => {
    const payload = {
      problemId: id,
      programLanguage: PISTON_TO_BACKEND[language], // Convert to backend acceptable enum
      languageVersion: LANGUAGE_VERSIONS[language],
      input: probe,
    }

    const thoughts = {
      problemId: id,
      input: formatThoughtProcess(probe, userThoughts),
    }

    setIsLoading(true)
    const data = await executeProbe(payload)

    const aiData = await submitThoughtProcess(thoughts)
    console.log('RES FROM GPT:', aiData)

    if (data.run.output) {
      setOutput(data.run.output)
    }

    if (aiData.explanation) {
      setAIOutput(aiData.explanation)
      setIsThoughtValid(aiData.is_valid)
    }
    setIsLoading(false)
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
          value={userThoughts}
          onChange={(e) => setUserThoughts(e.target.value)}
        />
        <Button
          variant={isLoading ? 'secondary' : 'primary'}
          onClick={sendProbe}
          disabled={isLoading}
        >
          Probe!
        </Button>
      </div>
      <p className="text-light mt-1 mb-0 pb-0">Output:</p>
      {isLoading && <Loading />}
      <Form.Control as="textarea" rows={5} readOnly value={output} />
      <p className="text-light mt-1 mb-0 pb-0">Comments:</p>
      <Form.Control
        as="textarea"
        rows={5}
        readOnly
        value={AIOutput}
        style={{
          backgroundColor: isThoughtValid ? '#d4edda' : '#f8d7da',
          borderColor: isThoughtValid ? '#28a745' : '#dc3545',
          color: isThoughtValid ? '#155724' : '#721c24',
        }}
      />
    </Container>
  )
}
