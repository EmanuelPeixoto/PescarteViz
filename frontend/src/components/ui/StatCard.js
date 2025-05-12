import React from 'react';

const StatCard = ({ title, value, subtitle }) => {
  return (
    <div className="stat-card pulse">
      <h3>{title}</h3>
      <div className="stat-value">{value}</div>
      {subtitle && <div className="stat-subtitle">{subtitle}</div>}
    </div>
  );
};

export default StatCard;