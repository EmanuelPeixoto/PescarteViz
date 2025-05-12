import React from 'react';
import StatCard from '../ui/StatCard';

const StatsSummary = ({ stats }) => {
  return (
    <div className="pescarte-stats-overview">
      <StatCard title="Municípios" value={stats.totalMunicipios} />
      <StatCard title="Comunidades" value={stats.totalCommunities} />
      <StatCard 
        title="Pescadores" 
        value={stats.totalFishermen} 
        subtitle={`${stats.averageFishermenPercentage}% da população`}
      />
      <StatCard title="População Total" value={stats.totalPeople} />
    </div>
  );
};

export default StatsSummary;