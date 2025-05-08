import React, { useState } from "react";
import "./App.css";
import Dashboard from "./components/Dashboard";
import CommunitiesDashboard from "./components/CommunitiesDashboard";

function App() {
  const [activeTab, setActiveTab] = useState('sales');

  return (
    <div className="App">
      <header className="App-header">
        <h1>Data Visualization Project</h1>
        <nav className="main-nav">
          <button
            className={activeTab === 'sales' ? 'active' : ''}
            onClick={() => setActiveTab('sales')}
          >
            Sales Dashboard
          </button>
          <button
            className={activeTab === 'communities' ? 'active' : ''}
            onClick={() => setActiveTab('communities')}
          >
            Fishing Communities
          </button>
        </nav>
      </header>
      <main>
        {activeTab === 'sales' ? <Dashboard /> : <CommunitiesDashboard />}
      </main>
      <footer>
        <p>Data Visualization Project - {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
}

export default App;
