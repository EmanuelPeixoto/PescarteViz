import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';

// Patch Chart.js globally
if (window.Chart) {
  const originalResize = window.Chart.prototype.resize;
  window.Chart.prototype.resize = function() {
    try {
      if (this.canvas && document.body.contains(this.canvas)) {
        originalResize.apply(this);
      }
    } catch (err) {
      console.log("Prevented chart resize error");
    }
  };
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

serviceWorkerRegistration.register();
