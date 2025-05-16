import React, { useRef } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

// Register required Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const FishermenPercentageChart = ({
  data,
  windowWidth = window.innerWidth,
  className = '',
  themeColor = ' #e67e22' // PESCARTE blue as default
}) => {
  const chartContainer = useRef(null);

  // Calculate average percentage
  const calculateAverage = () => {
    if (!data?.datasets?.[0]?.data || data.datasets[0].data.length === 0) return 0;
    const sum = data.datasets[0].data.reduce((acc, val) => acc + parseFloat(val), 0);
    return (sum / data.datasets[0].data.length).toFixed(1);
  };

  // Sort data by percentage values (highest to lowest)
  const sortData = () => {
    if (!data?.labels || !data?.datasets?.[0]?.data) return data;

    // Create paired array of labels and values
    const pairs = data.labels.map((label, i) => ({
      label,
      value: parseFloat(data.datasets[0].data[i])
    }));

    // Sort by values (descending)
    pairs.sort((a, b) => b.value - a.value);

    // Create color gradient based on value intensity
    const getColorWithOpacity = (opacity) => {
      // Extract RGB components from themeColor
      const rgbMatch = ' #e67e22';
      if (rgbMatch) {
        const [_, r, g, b] = rgbMatch;
        return `rgba(${r}, ${g}, ${b}, ${opacity})`;
      }
      return `rgba(0, 76, 153, ${opacity})`; // Default if parsing fails
    };

    const getOpacity = (value, maxValue) => {
      // Calculate opacity based on percentage of max value (between 0.3 and 1.0)
      return 0.3 + (value / maxValue) * 0.7;
    };

    const maxValue = Math.max(...pairs.map(p => p.value));

    // Rebuild sorted data object with gradient opacity
    return {
      labels: pairs.map(pair => pair.label),
      datasets: [{
        ...data.datasets[0],
        data: pairs.map(pair => pair.value),
        backgroundColor: pairs.map(pair => getColorWithOpacity(getOpacity(pair.value, maxValue))),
        borderColor: themeColor,
        borderWidth: 1
      }]
    };
  };

  const sortedData = sortData();
  const average = calculateAverage();

  // Options for the horizontal bar chart
  const options = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `Percentual de pescadores: ${context.raw.toFixed(1)}%`;
          },
          afterLabel: function(context) {
            const diff = context.raw - average;
            return `${diff >= 0 ? 'Acima' : 'Abaixo'} da média regional por ${Math.abs(diff).toFixed(1)}%`;
          }
        }
      }
    },
    scales: {
      x: {
        beginAtZero: true,
        max: Math.ceil(Math.max(...(sortedData.datasets[0].data || [0])) * 1.1),
        title: {
          display: windowWidth > 576,
          text: 'Percentual de Pescadores (%)',
          font: {
            weight: 'bold'
          }
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        },
        ticks: {
          callback: function(value) {
            return value + '%';
          }
        }
      },
      y: {
        ticks: {
          callback: function(value) {
            const label = this.getLabelForValue(value);
            // Truncate municipality names on smaller screens
            return windowWidth < 576 && label.length > 12
              ? label.substring(0, 12) + '...'
              : label;
          },
          font: {
            size: windowWidth < 768 ? 10 : 12
          }
        }
      }
    }
  };

  // Calculate dynamic height based on number of municipalities
  const getChartHeight = () => {
    const baseHeight = 150;
    const perItem = 30;
    const count = sortedData.labels?.length || 0;

    // Set minimum and maximum heights
    const calculatedHeight = baseHeight + (count * perItem);
    return Math.min(Math.max(calculatedHeight, 250), 500);
  };

  return (
    <div className={`fishermen-percentage-chart ${className}`}>
      <div
        className="chart-container"
        ref={chartContainer}
        style={{ height: `${getChartHeight()}px` }}
      >
        <Bar data={sortedData} options={options} />
      </div>

      <div className="chart-insights">
        <div className="insight-boxes">
          <div className="insight-box">
            <div className="insight-value">{average}%</div>
            <div className="insight-label">Média Regional</div>
          </div>
          {sortedData.datasets && sortedData.datasets[0] && sortedData.datasets[0].data && (
            <>
              <div className="insight-box">
                <div className="insight-value highlight-high">
                  {sortedData.datasets[0].data[0]?.toFixed(1)}%
                </div>
                <div className="insight-label">Maior</div>
                <div className="insight-sublabel">
                  {windowWidth >= 400 && sortedData.labels && sortedData.labels[0]}
                </div>
              </div>
              <div className="insight-box">
                <div className="insight-value highlight-low">
                  {sortedData.datasets[0].data[sortedData.datasets[0].data.length - 1]?.toFixed(1)}%
                </div>
                <div className="insight-label">Menor</div>
                <div className="insight-sublabel">
                  {windowWidth >= 400 && sortedData.labels && sortedData.labels[sortedData.labels.length - 1]}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default FishermenPercentageChart;
