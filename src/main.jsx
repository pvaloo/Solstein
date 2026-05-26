import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./auth/AuthProvider.jsx";
import AppRoot from "./react/AppRoot.jsx";

import "../solstein-tokens.css";
import "../solstein-app.css";
import "../solstein-auth.css";
import "../solstein-operator.css";
import "../solstein-toast.css";
import "./react-app.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <AppRoot />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
