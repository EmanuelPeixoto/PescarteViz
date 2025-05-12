import React from 'react';
import { Bar } from 'react-chartjs-2';

const BarChart = ({ data, options, title }) => {
  return (
    <div className="chart-container chart-md">
      {title && <h3>{title}</h3>}
      <div className="chart-wrapper">
        <Bar data={data} options={options} />
      </div>
    </div>
  );
};

export default BarChart;