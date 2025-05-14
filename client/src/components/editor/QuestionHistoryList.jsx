import { useState } from 'react'
import { Container, Modal, Button } from 'react-bootstrap'

export default function QuestionHistoryList({ questionHistory }) {
  const [selectedQuestion, setSelectedQuestion] = useState(null)

  const handleQuestionClick = (item) => {
    setSelectedQuestion(item)
  }

  const handleClose = () => {
    setSelectedQuestion(null)
  }

  return (
    <Container
      fluid
      className="d-flex flex-column gap-2 p-2"
      style={{
        overflowY: 'auto',
        height: '100%',
        width: 'clamp(150px, 14vw, 250px)',
        maxWidth: '250px',
        minWidth: '150px',
        backgroundColor: '#f9f9f9',
        borderLeft: '1px solid #ccc',
        boxSizing: 'border-box',
      }}
    >
      {questionHistory.map((item, index) => (
        <div
          key={index}
          className="p-2 border border-secondary rounded"
          style={{
            cursor: 'pointer',
            textAlign: 'center',
            backgroundColor: '#fff',
          }}
          onClick={() => handleQuestionClick(item)}
        >
          {item.probe}
        </div>
      ))}

      <Modal show={!!selectedQuestion} onHide={handleClose} centered>
        <Modal.Header closeButton>
          <Modal.Title>Probe & Response</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <h5>{selectedQuestion?.probe}</h5>
          <p>{selectedQuestion?.response}</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  )
}
