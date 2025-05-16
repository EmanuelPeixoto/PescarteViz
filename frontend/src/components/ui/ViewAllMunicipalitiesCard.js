import React from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';

const ViewAllMunicipalitiesCard = ({ totalMunicipalities, remainingCount }) => {
  return (
    <div className="view-all-municipalities-card">
      <div className="view-all-content">
        <div className="view-all-icon">
          <i className="fas fa-map-marked-alt"></i>
        </div>
        <div className="view-all-text">
          <h3>Explore Todos os Municípios</h3>
          <p>Visualize dados completos de todos os {totalMunicipalities} municípios monitorados</p>
          {remainingCount > 0 && (
            <span className="remaining-badge">+{remainingCount} municípios não exibidos</span>
          )}
        </div>
      </div>
      <Link to="/communities" className="view-all-button">
        Ver todos
        <i className="fas fa-arrow-right"></i>
      </Link>
    </div>
  );
};

ViewAllMunicipalitiesCard.propTypes = {
  totalMunicipalities: PropTypes.number.isRequired,
  remainingCount: PropTypes.number.isRequired
};

export default ViewAllMunicipalitiesCard;