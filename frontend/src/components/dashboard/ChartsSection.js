import React, { useState, useRef, useEffect } from 'react';
import { Bar, Pie } from 'react-chartjs-2';
import FishermenPercentageChart from '../charts/FishermenPercentageChart';
import useResizeObserver from '../../hooks/useResizeObserver';

// Import new CSS
import '../../styles/components/fishermen-percentage-chart.css';

const ChartsSection = ({
  fishermenDistributionData,
  populationByMunicipalityData,
  fishermenPercentageData,
  pieOptions,
  barOptions,
  windowWidth,
  getResponsiveChartOptions,
  chartColors
}) => {
  const [chartDimensions, setChartDimensions] = useState({
    width: 0,
    height: 0
  });

  const chartGridRef = useRef(null);

  // Use resize observer to get chart container dimensions
  const dimensions = useResizeObserver(chartGridRef);

  useEffect(() => {
    if (dimensions) {
      setChartDimensions(dimensions);
    }
  }, [dimensions]);

  // Get responsive options based on dimensions
  const getResponsiveBarOptions = (dimensions) => {
    return {
      ...barOptions,
      maintainAspectRatio: false,
      plugins: {
        ...barOptions.plugins,
        legend: {
          ...barOptions.plugins?.legend,
          display: dimensions?.width > 400,
          position: dimensions?.width < 500 ? 'bottom' : 'top',
          labels: {
            boxWidth: dimensions?.width < 500 ? 10 : 15,
            font: { size: dimensions?.width < 500 ? 10 : 12 }
          }
        },
        datalabels: {
          ...barOptions.plugins?.datalabels,
          display: dimensions?.width > 350,
          font: { size: dimensions?.width < 500 ? 9 : 10 }
        }
      },
      scales: {
        ...barOptions.scales,
        y: {
          ...barOptions.scales?.y,
          ticks: {
            ...barOptions.scales?.y?.ticks,
            font: { size: dimensions?.width < 500 ? 9 : 11 }
          }
        },
        x: {
          ...barOptions.scales?.x,
          ticks: {
            ...barOptions.scales?.x?.ticks,
            font: { size: dimensions?.width < 500 ? 9 : 11 }
          }
        }
      }
    };
  };

  // Responsive layout based on screen width
  const layoutClasses = windowWidth < 992
    ? "chart-grid chart-grid-stacked"
    : "chart-grid chart-grid-3-columns";

  return (
    <div className="charts-section">
      <div className={layoutClasses} ref={chartGridRef}>
        {/* Distribution Chart */}
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
              options={getResponsiveBarOptions(chartDimensions)}
            />
          </div>
          <div className="chart-explanation">
            População total e número de pescadores por município
          </div>
        </div>

        {/* Percentage Chart - Using new component */}
        <div className="chart-card">
          <div className="chart-card-header">
            <h3 className="chart-title">Percentual de Pescadores por Município</h3>
          </div>
          <div className="chart-card-body percentage-chart">
            <FishermenPercentageChart
              data={fishermenPercentageData}
              windowWidth={windowWidth}
            />
          </div>
          <div className="chart-explanation">
            Proporção de pescadores em relação à população total por município
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChartsSection;
