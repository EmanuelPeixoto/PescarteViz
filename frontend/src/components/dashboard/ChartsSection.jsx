import React, { useRef, useEffect, useState } from 'react';
import { Pie, Bar } from 'react-chartjs-2';
import useResizeObserver from '../../hooks/useResizeObserver';
import FishermenPercentageChart from '../charts/FishermenPercentageChart';
import PopulationFishermenComparisonChart from '../charts/PopulationFishermenComparisonChart';

// Import the new CSS file
import '../../styles/components/charts.css';

const ChartsSection = ({
  fishermenDistributionData,
  populationByMunicipalityData,
  fishermenPercentageData,
  communitiesData,  // Add this prop for the new chart
  pieOptions,
  barOptions,
  windowWidth,
}) => {
  const chartGridRef = useRef(null);
  const [chartDimensions, setChartDimensions] = useState({ width: 0, height: 0 });
  
  // Use resize observer to get chart container dimensions
  const dimensions = useResizeObserver(chartGridRef);
  
  useEffect(() => {
    if (dimensions) {
      setChartDimensions(dimensions);
    }
  }, [dimensions]);
  
  // Responsive layout based on screen width
  const layoutClasses = windowWidth < 992 
    ? "chart-grid chart-grid-stacked" 
    : "chart-grid chart-grid-2-columns";

  return (
    <div className="charts-section">
      <div className={layoutClasses} ref={chartGridRef}>
        {/* Fishermen Distribution Chart */}
        <div className="chart-card">
          <div className="chart-card-header">
            <h3 className="chart-title">Distribuição de Pescadores</h3>
          </div>
          <div className="chart-card-body">
            <Pie data={fishermenDistributionData} options={pieOptions} />
          </div>
          <div className="chart-explanation">
            Distribuição do número total de pescadores por município
          </div>
        </div>

        {/* Population Chart */}
        <div className="chart-card">
          <div className="chart-card-header">
            <h3 className="chart-title">População por Município</h3>
          </div>
          <div className="chart-card-body">
            <Bar 
              data={populationByMunicipalityData} 
              options={{
                ...barOptions,
                maintainAspectRatio: false,
              }}
            />
          </div>
          <div className="chart-explanation">
            População total e número de pescadores por município
          </div>
        </div>

        {/* Improved Percentage Chart */}
        <div className="chart-card">
          <div className="chart-card-header">
            <h3 className="chart-title">Percentual de Pescadores por Município</h3>
          </div>
          <div className="chart-card-body">
            <FishermenPercentageChart 
              data={fishermenPercentageData}
              windowWidth={windowWidth}
            />
          </div>
          <div className="chart-explanation">
            Proporção de pescadores em relação à população total por município
          </div>
        </div>

        {/* New Population vs Fishermen Comparison Chart */}
        <div className="chart-card">
          <div className="chart-card-header">
            <h3 className="chart-title">Comparação População/Pescadores</h3>
          </div>
          <div className="chart-card-body">
            <PopulationFishermenComparisonChart 
              communitiesData={communitiesData}
              windowWidth={windowWidth}
            />
          </div>
          <div className="chart-explanation">
            Comparativo visual entre população total e pescadores nos municípios
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChartsSection;