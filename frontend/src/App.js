import React from "react";
import { BrowserRouter as Router, Routes, Route, NavLink } from "react-router-dom";
import "./App.css";
import Dashboard from "./components/Dashboard";
import CommunitiesDashboard from "./components/CommunitiesDashboard";
import CommunityDetails from "./components/CommunityDetails";
import DataUploadForm from "./components/DataUploadForm";
import FishingEnvironments from "./components/FishingEnvironments";
import CommunityComparison from "./components/CommunityComparison";
import Footer from "./components/Footer";
import pescarteLogoBlue from './assets/pescarte_logo.svg';

function App() {
  return (
    <Router>
      <div className="App">
        <header className="App-header">
          <div className="header-container">
            <div className="logo-container">
              <img src={pescarteLogoBlue} alt="Logo PESCARTE" className="pescarte-logo" />
            </div>
            <h1> - Monitoramento de Comunidades Pesqueiras</h1>
          </div>
          <nav className="main-nav">
            <NavLink to="/" end>Dashboard</NavLink>
            <NavLink to="/communities">Comunidades</NavLink>
            <NavLink to="/upload">Importar Dados</NavLink>
            <NavLink to="/environments">Ambientes de Pesca</NavLink>
            <NavLink to="/compare">Comparar Comunidades</NavLink>
          </nav>
        </header>
        <main>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/communities" element={<CommunitiesDashboard />} />
            <Route path="/community/:id" element={<CommunityDetails />} />
            <Route path="/upload" element={<DataUploadForm />} />
            <Route path="/environments" element={<FishingEnvironments />} />
            <Route path="/compare" element={<CommunityComparison />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
