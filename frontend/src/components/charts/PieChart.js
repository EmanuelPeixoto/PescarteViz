import React from 'react';
import { Pie } from 'react-chartjs-2';

const PieChart = ({ data, options, title }) => {
  return (
    <div className="chart-container chart-md">
      {title && <h3>{title}</h3>}
      <div className="chart-wrapper">
        <Pie data={data} options={options} />
      </div>
    </div>
  );
};

export default PieChart;