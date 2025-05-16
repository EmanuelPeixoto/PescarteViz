import React, { lazy, Suspense } from "react";
import { BrowserRouter as Router, Routes, Route, NavLink, Link } from "react-router-dom";
import "./styles/main.css";
import Footer from "./components/Footer";
import pescarteLogoBlue from './assets/pescarte_logo.svg';
import { ThemeProvider } from './contexts/ThemeContext';
import ThemeToggle from './components/ThemeToggle';
import CommunityCoordinatesAdmin from './components/admin/CommunityCoordinatesAdmin';

// Code-split your components
const Dashboard = lazy(() => import("./components/Dashboard"));
const CommunitiesDashboard = lazy(() => import("./components/CommunitiesDashboard"));
const CommunityDetails = lazy(() => import("./components/CommunityDetails"));
const CommunityComparison = lazy(() => import("./components/CommunityComparison"));
const AdvancedAnalysis = lazy(() => import("./components/AdvancedAnalysis"));

function App() {
  return (
    <ThemeProvider>
      <Router>
        <div className="App">
          <header className="App-header">
            <nav className="main-nav">
              <div className="nav-container">
                <div className="logo-nav-section">
                  <Link to="/" className="logo-link">
                    <img src={pescarteLogoBlue} alt="Logo PESCARTE" className="pescarte-logo" />
                    <span className="site-title"></span>
                  </Link>
                </div>
                <div className="nav-links">
                  <NavLink to="/" end>Dashboard</NavLink>
                  <NavLink to="/communities">Comunidades</NavLink>
                  <NavLink to="/compare">Comparar Comunidades</NavLink>
                  <NavLink to="/analysis">Análise Avançada</NavLink>
                </div>
              </div>
            </nav>
            <ThemeToggle />
          </header>
          <main>
            <Suspense fallback={<div className="loading-container">Carregando...</div>}>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/communities" element={<CommunitiesDashboard />} />
                <Route path="/community/:id" element={<CommunityDetails />} />
                <Route path="/compare" element={<CommunityComparison />} />
                <Route path="/analysis" element={<AdvancedAnalysis />} />
                <Route path="/admin/coordinates" element={<CommunityCoordinatesAdmin />} />
              </Routes>
            </Suspense>
          </main>
          <Footer />
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
