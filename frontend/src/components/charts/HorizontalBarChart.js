import React from 'react';
import { Bar } from 'react-chartjs-2';

const HorizontalBarChart = ({ data, options, title }) => {
  // Create horizontal bar chart options by default
  const horizontalOptions = {
    ...options,
    indexAxis: 'y',
    maintainAspectRatio: false,
    responsive: true
  };

  return (
    <div className="chart-container chart-md">
      {title && <h3>{title}</h3>}
      <div className="chart-wrapper">
        <Bar data={data} options={horizontalOptions} />
      </div>
    </div>
  );
};

export default HorizontalBarChart;