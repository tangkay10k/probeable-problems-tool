import { Route, Routes, useLocation } from "react-router-dom";
import Home from "./pages/home/home";
import QuestionSetup from "./pages/question-setup/question-setup";
import NavBar from "@/components/nav/navbar.jsx";
import "./App.css";
import { Bounce, ToastContainer } from "react-toastify";
import ProblemPage from "@/pages/problem/problem-page.jsx";
import Login from "@/pages/login/login.jsx";
import PrivateRoutes from "@/components/router/private-route.jsx";

function App() {
  const location = useLocation();

  return (
    <div className="app">
      {!location.pathname.startsWith("/problem/") && <NavBar />}
      <ToastContainer
        position="bottom-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
        transition={Bounce}
      />
      <Routes>
        <Route path="/" element={<Login />} />

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