import { useLocation } from 'react-router-dom'
import StudentEditor from '../components/editor/StudentEditor.jsx'
import { Container } from 'react-bootstrap'

export function Problem() {
  const { state } = useLocation()
  const { problem } = state || {}

  return (
    <Container>
      <StudentEditor problem={problem} />
    </Container>
  )
}
