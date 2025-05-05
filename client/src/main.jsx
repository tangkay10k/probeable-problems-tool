import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { Problem } from './pages/problem.jsx'
import Lecturer from './pages/lecturer.jsx'
import { ProblemList } from './pages/problem-list.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/lecturer" element={<Lecturer />} />
        {/*TO DO: once we set up DB change this to /problem:problemId */}
        <Route path="/problem-list" element={<ProblemList />} />
        <Route path="/problem/:id" element={<Problem />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
)
