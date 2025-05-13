import React from "react";
import { NavLink } from "react-router-dom";

// Import logos
import pescarteLogo from "../assets/pescarte_logo.svg";
import petrobrasLogo from "../assets/footer/petrobras_logo.svg";
import uenfLogo from "../assets/footer/uenf_logo.svg";
import ibamaLogo from "../assets/footer/ibama_logo.svg";
import ipeadLogo from "../assets/footer/logo_ipead.svg";

const Footer = () => {
  return (
    <footer>
      <div className="footer-wave-top"></div>

      {/* Seção principal do footer com links e contato */}
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
                <li>
                  <NavLink to="/analysis">Análise Avançada</NavLink>
                </li>
              </ul>
            </div>

            <div className="footer-links-column">
              <h4>Contato</h4>
              <ul>
                <li>
                  <a href="mailto:contato@pescarte.org.br">
                    contato@pescarte.org.br
                  </a>
                </li>
                <li>
                  <a href="tel:+55-21-2629-5562">+55 (21) 2629-5562</a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Linha divisória sutil */}
        <div className="footer-divider"></div>

        {/* Nova seção redesenhada de parceiros */}
        <div className="footer-partners">
          <div className="partners-grid">
            <div className="partner-item">
              <h5>Projeto</h5>
              <div className="partner-logo-wrapper">
                <img src={pescarteLogo} alt="PESCARTE" />
              </div>
            </div>

            <div className="partner-item">
              <h5>Execução</h5>
              <div className="partner-logo-wrapper">
                <img src={ipeadLogo} alt="IPEAD" />
              </div>
            </div>

            <div className="partner-item">
              <h5>Empreendedor</h5>
              <div className="partner-logo-wrapper">
                <img src={petrobrasLogo} alt="Petrobras" />
              </div>
            </div>

            <div className="partner-item">
              <h5>Órgão Licenciador</h5>
              <div className="partner-logo-wrapper">
                <img src={ibamaLogo} alt="IBAMA" />
              </div>
            </div>
          </div>

          <div className="footer-disclaimer">
            <p>
              A realização do Projeto Pescarte é uma medida de mitigação exigida
              pelo licenciamento ambiental federal, conduzido pelo IBAMA.
            </p>
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
