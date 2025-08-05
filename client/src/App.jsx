import { Route, Routes, useLocation } from "react-router-dom";
import Home from "./pages/home/home";
import QuestionSetup from "./pages/question-setup/question-setup";
import NavBar from "@/components/nav/navbar.jsx";
import "./App.css";
import { Slide, ToastContainer } from "react-toastify";
import ProblemPage from "@/pages/problem/problem-page.jsx";
import Login from "@/pages/login/login.jsx";
import PrivateRoutes from "@/components/router/private-route.jsx";
import NotFound from "@/pages/not-found/not-found.jsx";

function App() {
  return (
    <div className="app">
      <NavBar />
      <ToastContainer
        position="bottom-right"
        closeButton={false}
        autoClose={2000}
        hideProgressBar={true}
        newestOnTop={false}
        closeOnClick={false}
        rtl={false}
        draggable
        pauseOnHover
        theme="dark"
        transition={Slide}
      />
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="*" element={<NotFound />} />

        <Route element={<PrivateRoutes />}>
          <Route path="/problems" element={<Home />} />
          <Route path="/setup" element={<QuestionSetup />} />
          <Route path="/problem/:problemId" element={<ProblemPage />} />
        </Route>
      </Routes>
    </div>
  );
}

export default App;
