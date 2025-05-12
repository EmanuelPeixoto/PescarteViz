import React from 'react';
import PieChart from '../charts/PieChart';
import BarChart from '../charts/BarChart';
import HorizontalBarChart from '../charts/HorizontalBarChart';
import { defaultBarOptions, defaultPieOptions } from '../../utils/chartUtils';

const ChartsSection = ({ 
  fishermenDistributionData, 
  populationByMunicipalityData, 
  fishermenPercentageData, 
  pieOptions = defaultPieOptions, 
  barOptions = defaultBarOptions 
}) => {
  return (
    <div className="dashboard-charts">
      <div className="chart-row">
        <BarChart 
          data={populationByMunicipalityData} 
          options={barOptions}
          title="População por Município"
        />
      </div>
      
      <div className="chart-row">
        <PieChart 
          data={fishermenDistributionData} 
          options={pieOptions}
          title="Distribuição de Pescadores"
        />
        
        <HorizontalBarChart 
          data={fishermenPercentageData} 
          options={barOptions}
          title="Percentual de Pescadores"
        />
      </div>
    </div>
  );
};

export default ChartsSection;