import { Alert, Button, Container } from 'react-bootstrap'
import { useState } from 'react'
import { executeCode } from '../../routes/code-route.js'
import { Loading } from './Loading.jsx'

export function Output({
  editorRef,
  language,
  minHeight = '20em',
  heading = 'Output:',
  initialText = 'Run your code to see results.',
  buttonColour = 'success',
  buttonText = 'Submit',
}) {
  const [output, setOutput] = useState(initialText)
  const [isLoading, setIsLoading] = useState(false)
  const [stdErr, setStdErr] = useState(null)

  async function submitCode() {
    const src = editorRef.current.getValue()
    if (!src) return
    try {
      setIsLoading(true)
      setStdErr(null)
      const { run } = await executeCode(language, src)
      setOutput(run.output)
      if (run.stderr) {
        setStdErr(run.stderr)
      }
      setIsLoading(false)
    } catch (error) {}
  }

  return (
    <Container fluid className="bg-secondary p-2 rounded mb-2 mt-0">
      <h5>
        <b className="text-white">{heading}</b>
      </h5>
      <hr className="mt-0 mb-1" />
      <Alert
        className="mb-1"
        style={{ minHeight: minHeight }}
        variant={stdErr ? 'danger' : 'secondary'}
      >
        {isLoading ? <Loading /> : output}
      </Alert>
      <div className="d-flex justify-content-end">
        <Button
          size="sm"
          className="m-0"
          variant={buttonColour}
          disabled={isLoading}
          onClick={() => {
            submitCode()
          }}
        >
          {buttonText}
        </Button>
      </div>
    </Container>
  )
}
