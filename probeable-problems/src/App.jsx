import { Route, Routes } from 'react-router-dom'
import Home from './pages/home/home'
import QuestionSetup from './pages/question-setup/question-setup'
import NavBar from "@/components/nav/navbar.jsx";
import "./App.css"

function App() {
  return (
    <div className="app">
      <NavBar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/setup" element={<QuestionSetup />} />
      </Routes>
    </div>
  )
}

export default App
