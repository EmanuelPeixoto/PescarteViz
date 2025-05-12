import React from 'react';
import { Link } from 'react-router-dom';
import MunicipalityCard from '../ui/MunicipalityCard';

const CommunityAccess = ({ communitiesData }) => {
  return (
    <div className="community-links-section">
      <h2>Acesso Rápido às Comunidades</h2>
      <div className="community-links-container">
        {communitiesData.slice(0, 3).map((municipality, index) => (
          <MunicipalityCard key={index} municipality={municipality} />
        ))}

        {communitiesData.length > 3 && (
          <Link to="/communities" className="see-all-link">
            Ver todos os municípios ({communitiesData.length})
          </Link>
        )}
      </div>
    </div>
  );
};

export default CommunityAccess;