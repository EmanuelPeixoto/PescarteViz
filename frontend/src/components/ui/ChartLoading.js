import React from 'react';

const ChartLoading = ({ height = 300 }) => {
  return (
    <div className="chart-loading" style={{ height: `${height}px` }}>
      <div className="chart-loading-spinner"></div>
      <div className="chart-loading-text">Carregando visualização...</div>
    </div>
  );
};

export default ChartLoading;

