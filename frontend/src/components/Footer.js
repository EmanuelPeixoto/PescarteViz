import React from 'react';
import { NavLink } from 'react-router-dom';

// Import logos
import pescarteLogo from "../assets/pescarte_logo.svg";
import petrobrasLogo from '../assets/footer/petrobras_logo.svg';
import uffLogo from '../assets/footer/uenf_logo.svg';
import ibamaLogo from '../assets/footer/ibama_logo.svg';
import ipeadLogo from '../assets/footer/logo_ipead.svg';

const Footer = () => {
  return (
    <footer>
      <div className="footer-wave-top"></div>
      <div className="footer-container">
        <div className="footer-main">
          <div className="footer-logo-section">
            <img
              src={pescarteLogo}
              alt="Logo PESCARTE"
              className="footer-logo"
            />
            <p className="footer-tagline">
              Projeto de Educação Ambiental do Licenciamento da Produção e
              Escoamento de Petróleo e Gás Natural no Polo Pré-Sal da Bacia de
              Santos e da Bacia de Campos
            </p>
          </div>

          <div className="footer-links">
            <div className="footer-links-column">
              <h4>Links Rápidos</h4>
              <ul>
                <li>
                  <NavLink to="/">Dashboard</NavLink>
                </li>
                <li>
                  <NavLink to="/communities">Comunidades</NavLink>
                </li>
                <li>
                  <NavLink to="/compare">Comparar</NavLink>
                </li>
              </ul>
            </div>

            <div className="footer-links-column">
              <h4>Ferramentas</h4>
              <ul>
                <li>
                  <NavLink to="/upload">Importar Dados</NavLink>
                </li>
                <li>
                  <NavLink to="/environments">Ambientes</NavLink>
                </li>
              </ul>
            </div>

            <div className="footer-links-column">
              <h4>Contato</h4>
              <ul>
                <li>contato@pescarte.org.br</li>
                <li>+55 (21) 2629-5562</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="footer-partners">
          <h4>Parceiros</h4>
          <div className="partners-logos">
            <img src={uffLogo} alt="UFF" className="partner-logo" />
            <img src={petrobrasLogo} alt="Petrobras" className="partner-logo" />
            <img src={ibamaLogo} alt="IBAMA" className="partner-logo" />
            <img src={ipeadLogo} alt="Ipead" className="partner-logo" />
          </div>
        </div>

        <div className="footer-copyright">
          <p>
            &copy; {new Date().getFullYear()} PESCARTE - UENF - Todos os
            direitos reservados
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
