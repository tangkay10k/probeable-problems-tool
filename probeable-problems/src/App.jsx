import { Route, Routes } from 'react-router-dom'
import './App.css'
import Home from './pages/home/home'
import QuestionSetup from './pages/question-setup/question-setup'

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/setup" element={<QuestionSetup />} />
      </Routes>
    </>
  )
}

export default App
