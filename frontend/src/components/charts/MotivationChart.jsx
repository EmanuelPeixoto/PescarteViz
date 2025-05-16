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

const MotivationChart = ({
  data,
  windowWidth = window.innerWidth,
  className = ''
}) => {
  if (!data || !data.datasets || data.datasets.length === 0 || data.datasets[0].data.length === 0) {
    return (
      <div className="no-data-container" style={{
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        padding: '20px'
      }}>
        <div className="no-data-message">
          <i className="fas fa-exclamation-circle" style={{
            fontSize: '24px',
            marginBottom: '10px',
            color: '#888'
          }}></i>
          <p>Dados de motivação profissional não disponíveis</p>
        </div>
      </div>
    );
  }

  // Set up horizontal bar chart for better label display
  const chartData = {
    labels: data.labels,
    datasets: data.datasets
  };

  // Chart options with responsive settings
  const options = {
    indexAxis: 'y', // Horizontal bar chart
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false, // Hide legend since we have only one dataset
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const value = context.raw;
            const total = data.metadata.total;
            const percentage = ((value / total) * 100).toFixed(1);
            return `${value} pescadores (${percentage}%)`;
          }
        }
      },
      datalabels: {
        color: '#fff',
        font: {
          weight: 'bold',
          size: windowWidth < 576 ? 10 : 12
        },
        formatter: (value) => {
          const total = data.metadata.total;
          const percentage = ((value / total) * 100).toFixed(1);
          // Only show percentage labels on bars that are large enough
          return percentage > 5 ? `${percentage}%` : '';
        },
        align: 'center',
        anchor: 'center',
      }
    },
    scales: {
      x: {
        beginAtZero: true,
        title: {
          display: windowWidth > 576,
          text: 'Número de Pescadores',
          font: {
            weight: 'bold'
          }
        },
        ticks: {
          font: {
            size: windowWidth < 576 ? 10 : 12
          },
          callback: function(value) {
            return value.toLocaleString('pt-BR');
          }
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        }
      },
      y: {
        ticks: {
          font: {
            size: windowWidth < 576 ? 10 : 12,
            weight: 'bold'
          },
        },
        grid: {
          display: false
        }
      }
    }
  };

  return (
    <div className={`motivation-chart ${className}`} style={{ height: '100%', width: '100%' }}>
      <div className="chart-container" style={{ height: '100%', minHeight: '250px' }}>
        <Bar data={chartData} options={options} />
      </div>
      <div className="chart-note" style={{ fontSize: '0.8rem', marginTop: '5px', color: '#666', textAlign: 'center' }}>
        Dados agregados por municípios com base no percentual e número de pescadores
      </div>
    </div>
  );
};

export default MotivationChart;
