import {StrictMode} from 'react'
import {createRoot} from 'react-dom/client'
import App from './App.jsx'
import {BrowserRouter, Route, Routes} from "react-router-dom"
import {Problem} from "./pages/problem.jsx"

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<App/>}/>
                {/*TO DO: once we set up DB change this to /problem:problemId */}
                <Route path="/problem" element={<Problem/>}/>
            </Routes>
        </BrowserRouter>
    </StrictMode>,
)
