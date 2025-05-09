import React from 'react';
import { Pie, Bar } from 'react-chartjs-2';

const ChartComponents = ({ data }) => {
  const {
    fishermenDistributionData,
    populationByMunicipalityData,
    fishermenPercentageData,
    chartOptions,
    pieOptions
  } = data;

  return (
    <div className="dashboard-grid">
      <div className="chart-container">
        <h2>Distribuição de Pescadores</h2>
        <div className="chart-wrapper">
          <Pie data={fishermenDistributionData} options={pieOptions} />
        </div>
      </div>

      <div className="chart-container">
        <h2>População por Município</h2>
        <div className="chart-wrapper">
          <Bar data={populationByMunicipalityData} options={chartOptions} />
        </div>
      </div>

      <div className="chart-container">
        <h2>Percentual de Pescadores</h2>
        <div className="chart-wrapper">
          <Pie data={fishermenPercentageData} options={pieOptions} />
        </div>
      </div>
    </div>
  );
};

export default ChartComponents;