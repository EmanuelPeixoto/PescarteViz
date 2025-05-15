import React from 'react';
import { Bar, Pie } from 'react-chartjs-2';
import ResponsiveChart from '../ui/ResponsiveChart';

const ChartsSection = ({
  fishermenDistributionData,
  populationByMunicipalityData,
  fishermenPercentageData,
  pieOptions,
  barOptions
}) => {
  // Adjust options for mobile/desktop
  const getResponsiveBarOptions = (dimensions) => {
    const isMobile = dimensions.width < 576;

    return {
      ...barOptions,
      maintainAspectRatio: false,
      responsive: true,
      plugins: {
        ...barOptions.plugins,
        legend: {
          ...barOptions.plugins?.legend,
          position: isMobile ? 'bottom' : 'top',
          labels: {
            ...(barOptions.plugins?.legend?.labels || {}),
            boxWidth: isMobile ? 10 : 12,
            padding: isMobile ? 10 : 15,
            font: {
              ...(barOptions.plugins?.legend?.labels?.font || {}),
              size: isMobile ? 10 : 12
            }
          }
        },
        datalabels: {
          ...(barOptions.plugins?.datalabels || {}),
          display: !isMobile, // Hide data labels on mobile
          font: {
            ...(barOptions.plugins?.datalabels?.font || {}),
            size: isMobile ? 8 : 10
          }
        }
      },
      scales: {
        ...barOptions.scales,
        x: {
          ...barOptions.scales?.x,
          ticks: {
            ...(barOptions.scales?.x?.ticks || {}),
            autoSkip: true,
            maxRotation: isMobile ? 90 : 45,
            font: {
              ...(barOptions.scales?.x?.ticks?.font || {}),
              size: isMobile ? 9 : 11
            }
          }
        },
        y: {
          ...barOptions.scales?.y,
          ticks: {
            ...(barOptions.scales?.y?.ticks || {}),
            font: {
              ...(barOptions.scales?.y?.ticks?.font || {}),
              size: isMobile ? 9 : 11
            }
          }
        }
      }
    };
  };

  const getResponsivePieOptions = (dimensions) => {
    const isMobile = dimensions.width < 576;

    return {
      ...pieOptions,
      maintainAspectRatio: false,
      responsive: true,
      plugins: {
        ...pieOptions.plugins,
        legend: {
          ...pieOptions.plugins?.legend,
          position: isMobile ? 'bottom' : 'right',
          labels: {
            ...(pieOptions.plugins?.legend?.labels || {}),
            boxWidth: isMobile ? 10 : 12,
            padding: isMobile ? 8 : 15,
            font: {
              ...(pieOptions.plugins?.legend?.labels?.font || {}),
              size: isMobile ? 10 : 12
            }
          }
        }
      }
    };
  };

  return (
    <div className="dashboard-charts">
      <div className="charts-layout">
        {/* Population by Municipality - Top row, full width on all devices */}
        <div className="chart-section population-chart">
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
          {/* Distribution of Fishermen */}
          <div className="chart-section fishermen-distribution-chart">
            <h3 className="chart-title">Distribuição de Pescadores</h3>
            <ResponsiveChart
              aspectRatio={dimensions => dimensions.width < 576 ? 1.2 :
                          dimensions.width < 992 ? 1.5 : 1.1}
              minHeight={dimensions => dimensions.width > 992 ? 300 : 220}
              renderChart={(dimensions) => (
                <Pie
                  data={fishermenDistributionData}
                  options={getResponsivePieOptions(dimensions)}
                  height={dimensions.height}
                  width={dimensions.width}
                />
              )}
            />
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
