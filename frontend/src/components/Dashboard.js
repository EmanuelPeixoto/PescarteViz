import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  LineElement,
  PointElement
} from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import pescarteLogoBlue from '../assets/pescarte_logo.svg';

// Import custom hooks
import { useCommunityData } from '../hooks/useCommunityData';

// Import modular components
import StatsSummary from './dashboard/StatsSummary';
import CommunityAccess from './dashboard/CommunityAccess';
import ChartsSection from './dashboard/ChartsSection';

// Import utilities
import {
  formatFishermenDistributionData,
  formatPopulationData,
  formatPercentageData
} from '../utils/dataFormatters';
import { defaultBarOptions, defaultPieOptions } from '../utils/chartUtils';

// Register ChartJS components
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  LineElement,
  PointElement,
  ChartDataLabels
);

const Dashboard = () => {
  const { communitiesData, stats, loading, error } = useCommunityData();
  const [chartReady, setChartReady] = useState(false);

  useEffect(() => {
    // Set a small delay to ensure DOM is ready for charts
    if (!loading && communitiesData.length > 0) {
      setTimeout(() => {
        setChartReady(true);
      }, 100);
    }
  }, [loading, communitiesData]);

  // Prepare chart data using formatters
  const fishermenDistributionData = formatFishermenDistributionData(communitiesData);
  const populationByMunicipalityData = formatPopulationData(communitiesData);
  const fishermenPercentageData = formatPercentageData(communitiesData);

  if (loading) return <div className="loading">Carregando dados do projeto PESCARTE...</div>;
  if (error) return <div className="error-message">Erro: {error}</div>;

  return (
    <div className="dashboard fade-in">
      <div className="pescarte-info-header">
        <div className="pescarte-logo-container">
          <img
            src={pescarteLogoBlue}
            alt="Logo PESCARTE"
            className="pescarte-logo-large"
          />
        </div>
        <div className="pescarte-description">
          <h1>Monitoramento de Comunidades Pesqueiras</h1>
          <p className="slide-up">
            O PESCARTE é um projeto de mitigação ambiental da UENF em parceria
            com a Petrobras. Esta plataforma oferece ferramentas analíticas
            interativas sobre as comunidades pesqueiras da Bacia de Campos e
            Espírito Santo. Através de dashboards dinâmicos, é possível
            visualizar estatísticas demográficas, comparar comunidades e gerar
            relatórios personalizados. Nossa solução digital promove a
            transparência de dados, apoia políticas públicas e fortalece a pesca
            artesanal com visualizações geoespaciais e análises avançadas,
            contribuindo para a sustentabilidade das comunidades pesqueiras.
          </p>
        </div>
      </div>

      <div className="wave-divider"></div>

      {/* Modular Stats Summary Component */}
      <StatsSummary stats={stats} />

      {/* Modular Charts Section Component */}
      {chartReady && (
        <ChartsSection
          fishermenDistributionData={fishermenDistributionData}
          populationByMunicipalityData={populationByMunicipalityData}
          fishermenPercentageData={fishermenPercentageData}
          pieOptions={defaultPieOptions}
          barOptions={defaultBarOptions}
        />
      )}

      {/* Modular Community Access Component */}
      <CommunityAccess communitiesData={communitiesData} />
    </div>
  );
};

export default Dashboard;
