import React from 'react';
import { Doughnut } from 'react-chartjs-2';

const GaugeChart = ({ value, maxValue = 100, label, size = 120 }) => {
  // Calculate what portion of the gauge to fill
  const percentage = (value / maxValue) * 100;
  const data = {
    datasets: [{
      data: [percentage, 100 - percentage],
      backgroundColor: [
        percentage > 40 ? '#FF5A5A' : percentage > 20 ? '#FFA500' : '#4CAF50',
        '#E0E0E0'
      ],
      borderWidth: 0,
      circumference: 180,
      rotation: 270,
    }]
  };
  
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '75%',
    plugins: {
      tooltip: {
        enabled: false
      },
      legend: {
        display: false
      },
      datalabels: {
        display: false
      }
    }
  };
  
  return (
    <div className="gauge-chart" style={{ width: size, height: size/2 + 30 }}>
      <div className="gauge-chart-container" style={{ height: size/2 }}>
        <Doughnut data={data} options={options} />
      </div>
      <div className="gauge-value">{value.toFixed(1)}%</div>
      <div className="gauge-label">{label}</div>
    </div>
  );
};

export default GaugeChart;