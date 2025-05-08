import React from "react";
import "./App.css";
import Dashboard from "./components/Dashboard";

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Data Visualization Project</h1>
      </header>
      <main>
        <Dashboard />
      </main>
      <footer>
        <p>Data Visualization Project - {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
}

export default App;

