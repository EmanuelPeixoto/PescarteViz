import React, { useState } from 'react';
import { Pie, Bar } from 'react-chartjs-2';
import ResponsiveChart from '../ui/ResponsiveChart';

const ChartsSection = ({
  fishermenDistributionData,
  populationByMunicipalityData,
  fishermenPercentageData,
  pieOptions,
  barOptions
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
      <div className="charts-layout">
        {/* Full width chart - Population by Municipality */}
        <div className="chart-section">
          <h3 className="chart-title">População por Município</h3>
          <ResponsiveChart
            aspectRatio={dimensions => dimensions.width > 992 ? 2.2 : 1.8}
            minHeight={280}
            renderChart={(dimensions) => (
              <Bar
                data={populationByMunicipalityData}
                options={getResponsiveBarOptions(dimensions)}
                height={dimensions.height}
                width={dimensions.width}
              />
            )}
          />
        </div>

        {/* Bottom row with two charts side by side on desktop, stacked on mobile */}
        <div className="chart-row">
          {/* Distribution of Fishermen with view toggle */}
          <div className="chart-section fishermen-distribution-chart">
            <div className="chart-header">
              <h3 className="chart-title">Distribuição de Pescadores</h3>
              <div className="chart-controls">
                <button
                  className={`view-toggle ${distributionViewType === 'pie' ? 'active' : ''}`}
                  onClick={toggleDistributionView}
                  aria-label="Visualizar como gráfico de pizza"
                >
                  <span className="icon">🥧</span>
                </button>
                <button
                  className={`view-toggle ${distributionViewType === 'bar' ? 'active' : ''}`}
                  onClick={toggleDistributionView}
                  aria-label="Visualizar como gráfico de barras"
                >
                  <span className="icon">📊</span>
                </button>
              </div>
            </div>
            <div className="chart-container">
              <ResponsiveChart
                aspectRatio={dimensions => dimensions.width < 576 ? 1.2 :
                              dimensions.width < 992 ? 1.5 : 1.1}
                minHeight={dimensions => dimensions.width > 992 ? 300 : 220}
                renderChart={(dimensions) => (
                  distributionViewType === 'pie' ? (
                    <Pie
                      data={filteredDistributionData}
                      options={getResponsivePieOptions(dimensions)}
                      height={dimensions.height}
                      width={dimensions.width}
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
                      height={dimensions.height}
                      width={dimensions.width}
                    />
                  )
                )}
              />
            </div>
          </div>

          {/* Percentage of Fishermen */}
          <div className="chart-section fishermen-percentage-chart">
            <h3 className="chart-title">Percentual de Pescadores</h3>
            <ResponsiveChart
              aspectRatio={dimensions => dimensions.width < 576 ? 1.2 :
                          dimensions.width < 992 ? 1.5 : 1.8}
              minHeight={dimensions => dimensions.width > 992 ? 300 : 220}
              renderChart={(dimensions) => (
                <Bar
                  data={fishermenPercentageData}
                  options={getResponsiveBarOptions(dimensions)}
                  height={dimensions.height}
                  width={dimensions.width}
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
