import { useLocation } from 'react-router-dom'
import StudentEditor from '../components/editor/StudentEditor.jsx'
import { Container } from 'react-bootstrap'

export function Problem() {
  const { state } = useLocation()
  const { problem } = state || {}

  return (
    <Container
      fluid
      className="p-0"
      style={{
        width: '95vw',
        height: '85vh',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <StudentEditor problem={problem} />
    </Container>
  )
}
