import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router } from "react-router-dom";
import ThemeProvider from "./utils/ThemeContext";
import Auth0ProviderWrapper from "./Auth0Provider";
import App from "./App";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Router>
      <Auth0ProviderWrapper>
        <ThemeProvider>
          <App />
        </ThemeProvider>
      </Auth0ProviderWrapper>
    </Router>
  </React.StrictMode>
);
