import {Alert, Button, Container} from "react-bootstrap";
import {useState} from "react";
import {executeCode} from "../../routes/code-route.js";
import {Loading} from "./Loading.jsx";

export function Output({editorRef, language}) {
    const [output, setOutput] = useState("Run your code to see results.")
    const [isLoading, setIsLoading] = useState(false)
    const [stdErr, setStdErr] = useState(null)

    async function submitCode() {
        const src = editorRef.current.getValue()
        if (!src) return
        try {
            setIsLoading(true)
            setStdErr(null)
            const {run} = await executeCode(language, src)
            setOutput(run.output)
            if (run.stderr) {
                setStdErr(run.stderr)
            }
            setIsLoading(false)
        } catch (error) {

        }
    }

    return (
        <Container fluid className="bg-secondary p-2 rounded m-0">
            <Alert.Heading className="mb-0">Output:</Alert.Heading>
            <hr className="mt-1 mb-2"/>
            <Alert style={{height: "20vh"}} variant={stdErr ? "danger" : "secondary"}>
                {isLoading ? <Loading/> : output}
            </Alert>
            <div className='d-flex justify-content-end'>
                <Button
                    size='sm'
                    className="mb-1 me-2"
                    variant='success'
                    disabled={isLoading}
                    onClick={() => {
                        submitCode()
                    }}
                >Submit
                </Button>
            </div>
        </Container>
    )
}