import React from 'react';
import { Link } from 'react-router-dom';

const MunicipalityCard = ({ municipality, onSelect }) => {
  // Format values for display
  const formattedPopulation = parseInt(municipality.total_pessoas).toLocaleString('pt-BR');
  const formattedFishermen = parseInt(municipality.total_pescadores).toLocaleString('pt-BR');
  const percentFishermen = ((parseInt(municipality.total_pescadores) / parseInt(municipality.total_pessoas)) * 100).toFixed(1);

  // Split municipality name into words and check if it needs truncation
  const municipalityNameWords = municipality.municipio.split(' ');
  const municipalityDisplayName = municipalityNameWords.length > 10
    ? municipalityNameWords.slice(0, 10).join(' ') + '...'
    : municipality.municipio;

  // Verificar o comprimento do nome do município e quantidade de comunidades
  const communityLabel = municipality.municipio.length > 16
    ? "c."
    : (municipality.num_comunidades == 1 ? "comunidade" : "comunidades");

  return (
    <div className="municipality-card">
      <div className="municipality-header">
        <div className="municipality-title-container">
          <h3 className="municipality-title" title={municipality.municipio}>
            {municipalityDisplayName}
          </h3>
        </div>
        <div className="community-count">
          {municipality.num_comunidades}{" "}
          {communityLabel}
        </div>
      </div>

      <div className="municipality-stats">
        <div className="stat-row">
          <div className="stat-icon">👥</div>
          <div className="stat-details">
            <span className="stat-label">População:</span>
            <span className="stat-value">{formattedPopulation}</span>
          </div>
        </div>

        <div className="stat-row">
          <div className="stat-icon">🎣</div>
          <div className="stat-details">
            <span className="stat-label">Pescadores:</span>
            <span className="stat-value">{formattedFishermen}</span>
          </div>
        </div>

        <div className="stat-row">
          <div className="stat-icon">📊</div>
          <div className="stat-details">
            <span className="stat-label">Percentual:</span>
            <span className="stat-value">{percentFishermen}%</span>
          </div>
        </div>
      </div>

      <div className="card-action-footer">
        {/* Use onSelect prop when provided, otherwise use Link component */}
        {onSelect ? (
          <button
            onClick={onSelect}
            className="view-communities-button"
            aria-label={`Ver comunidades de ${municipality.municipio}`}>
            Ver comunidades
            <span className="arrow-icon">→</span>
          </button>
        ) : (
          <Link
            to={`/communities?municipio=${municipality.municipio_id}`}
            className="view-communities-button"
            aria-label={`Ver comunidades de ${municipality.municipio}`}>
            Ver comunidades
            <span className="arrow-icon">→</span>
          </Link>
        )}
      </div>
    </div>
  );
};

export default MunicipalityCard;
