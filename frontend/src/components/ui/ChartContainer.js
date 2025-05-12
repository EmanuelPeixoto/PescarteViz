import React from 'react';

const ChartContainer = ({ title, children, isLoading }) => {
  return (
    <div className="chart-container">
      <h3>{title}</h3>
      {isLoading ? (
        <div className="loading-indicator">Carregando...</div>
      ) : (
        children
      )}
    </div>
  );
};

export default ChartContainer;