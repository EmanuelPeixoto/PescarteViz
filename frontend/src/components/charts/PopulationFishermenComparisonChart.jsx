import React from 'react';
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

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const PopulationFishermenComparisonChart = ({ 
  communitiesData,
  windowWidth = window.innerWidth,
  className = ''
}) => {
  // Sort municipalities by fishermen percentage (descending)
  const sortedData = [...communitiesData]
    .map(item => ({
      municipio: item.municipio,
      total_pessoas: parseInt(item.total_pessoas) || 0,
      total_pescadores: parseInt(item.total_pescadores) || 0,
      percentage: item.total_pessoas > 0 ? 
        ((parseInt(item.total_pescadores) / parseInt(item.total_pessoas)) * 100).toFixed(1) : 0
    }))
    .sort((a, b) => b.percentage - a.percentage);
  
  // Limit to top 8 municipalities for better visualization
  const limitedData = sortedData.slice(0, 8);
  
  // Prepare chart data
  const chartData = {
    labels: limitedData.map(item => item.municipio),
    datasets: [
      {
        label: 'População Total',
        data: limitedData.map(item => item.total_pessoas),
        backgroundColor: 'rgba(53, 162, 235, 0.7)',
        borderColor: 'rgba(53, 162, 235, 1)',
        borderWidth: 1,
        stack: 'Stack 0'
      },
      {
        label: 'Pescadores',
        data: limitedData.map(item => item.total_pescadores),
        backgroundColor: 'rgba(255, 99, 132, 0.7)', 
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 1,
        stack: 'Stack 0'
      }
    ]
  };
  
  // Chart options
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: windowWidth < 576 ? 'bottom' : 'top',
        labels: {
          font: {
            size: windowWidth < 576 ? 10 : 12
          }
        }
      },
      tooltip: {
        mode: 'index',
        callbacks: {
          label: function(context) {
            const value = context.raw;
            const formattedValue = value.toLocaleString('pt-BR');
            return `${context.dataset.label}: ${formattedValue}`;
          },
          footer: function(tooltipItems) {
            const idx = tooltipItems[0].dataIndex;
            const percentage = limitedData[idx].percentage;
            return `Percentual de Pescadores: ${percentage}%`;
          }
        }
      },
      title: {
        display: false
      }
    },
    scales: {
      x: {
        ticks: {
          autoSkip: true,
          maxRotation: 45,
          minRotation: 45,
          font: {
            size: windowWidth < 576 ? 9 : 11
          }
        },
        grid: {
          display: false
        }
      },
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return value.toLocaleString('pt-BR');
          },
          font: {
            size: windowWidth < 576 ? 9 : 11
          }
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        }
      }
    }
  };
  
  return (
    <div className={`population-fishermen-chart ${className}`}>
      <div className="chart-container" style={{ height: '300px' }}>
        <Bar data={chartData} options={options} />
      </div>
      
      <div className="chart-note">
        * Mostrando os {limitedData.length} municípios com maior percentual de pescadores
      </div>
    </div>
  );
};

export default PopulationFishermenComparisonChart;