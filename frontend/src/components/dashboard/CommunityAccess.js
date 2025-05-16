import React from 'react';
import MunicipalityCard from '../ui/MunicipalityCard';
import ViewAllMunicipalitiesCard from '../ui/ViewAllMunicipalitiesCard';

const CommunityAccess = ({ communitiesData }) => {
  // Calculate how many municipalities aren't shown
  const displayedCount = Math.min(3, communitiesData.length);
  const remainingCount = communitiesData.length - displayedCount;

  return (
    <div className="community-access-section">
      <div className="municipality-cards-grid">
        {communitiesData.slice(0, 3).map((municipality, index) => (
          <MunicipalityCard key={index} municipality={municipality} />
        ))}
      </div>

      {communitiesData.length > 3 && (
        <div className="view-all-container">
          <ViewAllMunicipalitiesCard
            totalMunicipalities={communitiesData.length}
            remainingCount={remainingCount}
          />
        </div>
      )}
    </div>
  );
};

export default CommunityAccess;
