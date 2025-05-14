import { Button, Container } from 'react-bootstrap'
import { CodeEditor } from './CodeEditor'
import Form from 'react-bootstrap/Form'
import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { executeProbe } from '../../routes/code-route'
import { LANGUAGE_VERSIONS, PISTON_TO_BACKEND } from './constants'
import { Loading } from './Loading'
import { submitThoughtProcess, checkQuestionDuplication } from '../../routes/ai-route'

export function Oracle({ intialProbe, language, questionHistory, setQuestionHistory }) {
  const [probe, setProbe] = useState(intialProbe)
  const [userThoughts, setUserThoughts] = useState('')
  const [output, setOutput] = useState('')
  const [AIOutput, setAIOutput] = useState('')
  const [isLoadingTestCode, setIsLoadingTestCode] = useState(false)
  const [isLoadingProbe, setIsLoadingProbe] = useState(false)
  const { id } = useParams()

  const sendProbe = async () => {
    const thoughts = {
      problemId: id,
      input: userThoughts
    }

    const duplicateDataRequest = {
      questionsAsked: questionHistory.map((item) => item.probe),
      probe: userThoughts
    }

    setIsLoadingProbe(true)

    const aiData = await submitThoughtProcess(thoughts)

    const duplicateData = await checkQuestionDuplication(duplicateDataRequest);

    if (duplicateData.isDuplicateQuestion) {
      if (duplicateData.suggestion) {
        setAIOutput(duplicateData.suggestion)
      }
    } else {
      setQuestionHistory((prevQuestions) => [
        ...prevQuestions,
        { probe: userThoughts, response: aiData.explanation }
      ]);
      if (aiData.explanation) {
        setAIOutput(aiData.explanation)
      }
    }


    setIsLoadingProbe(false)
  }

  const sendTestCode = async () => {
    const payload = {
      problemId: id,
      programLanguage: PISTON_TO_BACKEND[language], // Convert to backend acceptable enum
      languageVersion: LANGUAGE_VERSIONS[language],
      input: probe,
    }

    setIsLoadingTestCode(true)
    const data = await executeProbe(payload)

    if (data.run.output) {
      setOutput(data.run.output)
    }

    setIsLoadingTestCode(false)
  }

  return (
    <Container className="bg-secondary w-100 h-100 rounded mb-3 p-2 pb-3">
      <p className="text-light mb-0 pb-0">
        Probe the client understand what the client is looking for!
      </p>
      <div className="d-flex flex-row gap-2 m-0 p-0">
        <Form.Control
          as="textarea"
          placeholder="E.g. I'm testing if this function takes in 3 parameters"
          value={userThoughts}
          onChange={(e) => setUserThoughts(e.target.value)}
        />
        <Button
          variant={isLoadingProbe ? 'secondary' : 'primary'}
          onClick={sendProbe}
          disabled={isLoadingProbe}
        >
          Probe!
        </Button>
      </div>
      {isLoadingProbe && <Loading />}
      <p className="text-light mt-1 mb-0 pb-0">Comments:</p>
      <Form.Control
        as="textarea"
        rows={5}
        readOnly
        value={AIOutput}
      />
      <p className="text-light mb-0 pb-0">
        Input to test expected output
      </p>
      <CodeEditor
        height="6em"
        lineNumbers="off"
        showLanguageSelect={false}
        src={probe}
        setSource={setProbe}
        setLanguage={language}
      />
      <div className="d-flex flex-row gap-2 m-0 p-0">
        <Button
          variant={isLoadingTestCode ? 'secondary' : 'primary'}
          onClick={sendTestCode}
          disabled={isLoadingTestCode}
        >
          Check!
        </Button>
      </div>
      {isLoadingTestCode && <Loading />}
      <p className="text-light mt-1 mb-0 pb-0">Output:</p>
      <Form.Control as="textarea" rows={5} readOnly value={output} />
    </Container>
  )
}
