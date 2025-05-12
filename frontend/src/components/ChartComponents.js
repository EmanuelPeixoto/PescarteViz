import React from 'react';
import PieChart from './charts/PieChart';
import BarChart from './charts/BarChart';
import HorizontalBarChart from './charts/HorizontalBarChart';

const ChartComponents = ({ data }) => {
  const {
    fishermenDistributionData,
    populationByMunicipalityData,
    fishermenPercentageData,
    pieOptions,
    chartOptions
  } = data;

  return (
    <div className="dashboard-grid">
      <PieChart
        data={fishermenDistributionData}
        options={pieOptions}
        title="Distribuição de Pescadores"
      />

      <BarChart
        data={populationByMunicipalityData}
        options={{
          ...chartOptions,
          maintainAspectRatio: false,
          indexAxis: 'x'  // Force vertical bars
        }}
        title="População por Município"
      />

      <PieChart
        data={fishermenPercentageData}
        options={pieOptions}
        title="Percentual de Pescadores"
      />
    </div>
  );
};

export default ChartComponents;
