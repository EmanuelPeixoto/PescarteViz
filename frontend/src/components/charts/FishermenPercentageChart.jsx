import React, { useState, useEffect, useRef } from 'react';
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

// Register necessary Chart.js components
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
  className = ''
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
    
    // Create color array based on values
    const getBarColor = (value) => {
      if (value >= 45) return 'rgba(220, 53, 69, 0.8)';   // High - red
      if (value >= 35) return 'rgba(255, 193, 7, 0.8)';   // Medium-high - yellow
      if (value >= 25) return 'rgba(40, 167, 69, 0.8)';   // Medium - green
      return 'rgba(0, 123, 255, 0.8)';                    // Low - blue
    };
    
    const getBorderColor = (value) => {
      if (value >= 45) return 'rgba(220, 53, 69, 1)';     // High - red
      if (value >= 35) return 'rgba(255, 193, 7, 1)';     // Medium-high - yellow
      if (value >= 25) return 'rgba(40, 167, 69, 1)';     // Medium - green
      return 'rgba(0, 123, 255, 1)';                      // Low - blue
    };
    
    // Rebuild sorted data object with appropriate colors
    return {
      labels: pairs.map(pair => pair.label),
      datasets: [{
        ...data.datasets[0],
        data: pairs.map(pair => pair.value),
        backgroundColor: pairs.map(pair => getBarColor(pair.value)),
        borderColor: pairs.map(pair => getBorderColor(pair.value)),
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
      },
      annotation: {
        annotations: {
          averageLine: {
            type: 'line',
            xMin: average,
            xMax: average,
            borderColor: 'rgba(75, 75, 75, 0.7)',
            borderWidth: 1,
            borderDash: [5, 5],
            label: {
              display: windowWidth >= 768,
              content: `Média: ${average}%`,
              position: 'end',
              backgroundColor: 'rgba(75, 75, 75, 0.7)'
            }
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
          <div className="insight-box">
            <div className="insight-value highest">
              {sortedData.datasets[0].data[0]?.toFixed(1)}%
            </div>
            <div className="insight-label">Maior</div>
          </div>
          <div className="insight-box">
            <div className="insight-value lowest">
              {sortedData.datasets[0].data[sortedData.datasets[0].data.length - 1]?.toFixed(1)}%
            </div>
            <div className="insight-label">Menor</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FishermenPercentageChart;