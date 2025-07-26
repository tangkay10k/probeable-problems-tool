import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import { GoogleOAuthProvider } from '@react-oauth/google';

createRoot(document.getElementById("root")).render(
  <GoogleOAuthProvider clientId="694933505323-ul2k8fm8tv2q36p1k6m341jenunces2v.apps.googleusercontent.com">
    <StrictMode>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </StrictMode>
  </GoogleOAuthProvider>,
);
