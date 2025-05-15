import React from "react";
import ReactDOM from "react-dom/client";
import "./styles/main.css"; // This should be the ONLY main CSS import
// Remove any import of App.css if it exists here
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import * as serviceWorkerRegistration from './serviceWorkerRegistration';

// Patch Chart.js globally
if (window.Chart) {
  const originalResize = window.Chart.prototype.resize;
  window.Chart.prototype.resize = function () {
    try {
      if (this.canvas && document.body.contains(this.canvas)) {
        originalResize.apply(this);
      }
    } catch (err) {
      console.log("Prevented chart resize error");
    }
  };
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

serviceWorkerRegistration.register();
