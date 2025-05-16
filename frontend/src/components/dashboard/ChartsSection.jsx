import React, { useRef, useEffect, useState } from 'react';
import { Pie, Bar } from 'react-chartjs-2';
import useResizeObserver from '../../hooks/useResizeObserver';
import FishermenPercentageChart from '../charts/FishermenPercentageChart';
import PopulationFishermenComparisonChart from '../charts/PopulationFishermenComparisonChart';
import MotivationChart from '../charts/MotivationChart'; // Import the new component
import { formatMotivationData } from '../../utils/dataFormatters'; // Import the new formatter

// Import the CSS file
import '../../styles/components/charts.css';

const ChartsSection = ({
  fishermenDistributionData,
  populationByMunicipalityData,
  fishermenPercentageData,
  communitiesData,
  pieOptions,
  barOptions,
  windowWidth,
  chartColors
}) => {
  const chartGridRef = useRef(null);
  const [chartDimensions, setChartDimensions] = useState({ width: 0, height: 0 });

  // Format motivation data
  const motivationData = formatMotivationData(communitiesData, windowWidth < 576);

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
    <div className="charts-container">
      {/* Top row of charts */}
      <div className="chart-row top-charts">
        {/* Fishermen Distribution Chart */}
        <div className="chart-card">
          <div className="chart-card-header">
            <h3 className="chart-title">Distribuição de Pescadores</h3>
          </div>
          <div className="chart-card-body">
            <Pie
              data={fishermenDistributionData}
              options={pieOptions}
            />
          </div>
          <div className="chart-explanation">
            Distribuição do número total de pescadores por município
          </div>
        </div>

        {/* Population by Municipality Chart */}
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
              themeColor=" #e67e22" // PESCARTE blue
            />
          </div>
          <div className="chart-explanation">
            Proporção de pescadores em relação à população total por município
          </div>
        </div>

        {/* New Motivation Chart */}
        <div className="chart-card">
          <div className="chart-card-header">
            <h3 className="chart-title">Motivação Profissional dos Pescadores</h3>
          </div>
          <div className="chart-card-body">
            <MotivationChart
              data={motivationData}
              windowWidth={windowWidth}
            />
          </div>
          <div className="chart-explanation">
            Principais fatores que motivam a escolha pela profissão de pescador
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChartsSection;
