import React, { useState } from 'react';
import { Pie, Bar } from 'react-chartjs-2';
import ResponsiveChart from '../ui/ResponsiveChart';

const ChartsSection = ({
  fishermenDistributionData,
  populationByMunicipalityData,
  fishermenPercentageData,
  pieOptions,
  barOptions,
  windowWidth
}) => {
  const [distributionViewType, setDistributionViewType] = useState('pie');

  // Toggle between pie and bar chart for distribution view
  const toggleDistributionView = () => {
    setDistributionViewType(distributionViewType === 'pie' ? 'bar' : 'pie');
  };

  // Filter out "outros" category from distribution data
  const filteredDistributionData = {
    ...fishermenDistributionData,
    labels: fishermenDistributionData.labels.filter(label => label !== 'Outros'),
    datasets: [{
      ...fishermenDistributionData.datasets[0],
      data: fishermenDistributionData.datasets[0].data.filter((_, i) =>
        fishermenDistributionData.labels[i] !== 'Outros'
      ),
      backgroundColor: fishermenDistributionData.datasets[0].backgroundColor.filter((_, i) =>
        fishermenDistributionData.labels[i] !== 'Outros'
      ),
      borderColor: fishermenDistributionData.datasets[0].borderColor.filter((_, i) =>
        fishermenDistributionData.labels[i] !== 'Outros'
      )
    }]
  };

  // Get responsive pie options with adjusted padding to prevent cropping
  const getResponsivePieOptions = (dimensions) => {
    const isMobile = dimensions.width < 576;

    return {
      ...pieOptions,
      maintainAspectRatio: false,
      responsive: true,
      layout: {
        padding: {
          left: 20,
          right: 20,
          top: 10,
          bottom: 10
        }
      },
      plugins: {
        ...pieOptions.plugins,
        legend: {
          ...pieOptions.plugins?.legend,
          position: isMobile ? 'bottom' : 'right',
        }
      }
    };
  };

  // Get responsive bar options
  const getResponsiveBarOptions = (dimensions) => {
    return {
      ...barOptions,
      maintainAspectRatio: false,
      responsive: true
    };
  };

  return (
    <div className="dashboard-charts">
      <div className="chart-grid">
        {/* Main chart - takes full width */}
        <div className="chart-card full-width">
          <div className="chart-card-header">
            <h3 className="chart-title">População por Município</h3>

          </div>
          <div className="chart-card-body full-width">
            <ResponsiveChart
              chartType="full-width-bar"
              minHeight={windowWidth < 768 ? 280 : 320}
              renderChart={dimensions => (
                <Bar
                  data={populationByMunicipalityData}
                  options={getResponsiveBarOptions(dimensions)}
                />
              )}
            />
          </div>
        </div>

        {/* Two equal width charts with optimized containers */}
        <div className="chart-card">
          <div className="chart-card-header">
            <h3 className="chart-title">Distribuição de Pescadores</h3>
            <div className="chart-view-toggle">
              <button
                className={`toggle-btn ${distributionViewType === 'pie' ? 'active' : ''}`}
                onClick={() => setDistributionViewType('pie')}
                aria-label="Visualizar como gráfico de pizza"
              >
                <i className="fas fa-chart-pie"></i>
              </button>
              <button
                className={`toggle-btn ${distributionViewType === 'bar' ? 'active' : ''}`}
                onClick={() => setDistributionViewType('bar')}
                aria-label="Visualizar como gráfico de barras"
              >
                <i className="fas fa-chart-bar"></i>
              </button>
            </div>
          </div>
          <div className={`chart-card-body ${distributionViewType === 'pie' ? 'pie-chart' : 'bar-chart'}`}>
            <ResponsiveChart
              chartType={distributionViewType}
              minHeight={windowWidth > 992 ? 300 : 260}
              renderChart={(dimensions) => (
                distributionViewType === 'pie' ? (
                  <Pie
                    data={filteredDistributionData}
                    options={getResponsivePieOptions(dimensions)}
                  />
                ) : (
                  <Bar
                    data={{
                      labels: filteredDistributionData.labels,
                      datasets: [{
                        label: 'Pescadores',
                        data: filteredDistributionData.datasets[0].data,
                        backgroundColor: filteredDistributionData.datasets[0].backgroundColor,
                        borderColor: filteredDistributionData.datasets[0].borderColor,
                        borderWidth: 1
                      }]
                    }}
                    options={{
                      ...getResponsiveBarOptions(dimensions),
                      indexAxis: 'y'
                    }}
                  />
                )
              )}
            />
          </div>
        </div>

        <div className="chart-card">
          <div className="chart-card-header">
            <h3 className="chart-title">Percentual de Pescadores</h3>
          </div>
          <div className="chart-card-body bar-chart">
            <ResponsiveChart
              chartType="bar"
              minHeight={windowWidth > 992 ? 300 : 260}
              renderChart={(dimensions) => (
                <Bar
                  data={fishermenPercentageData}
                  options={getResponsiveBarOptions(dimensions)}
                />
              )}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChartsSection;
