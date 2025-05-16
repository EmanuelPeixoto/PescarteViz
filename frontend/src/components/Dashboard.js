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
import CommunityMapSection from './dashboard/CommunityMapSection';
import ChartLoading from './ui/ChartLoading'; // Add this import

// Import utilities
import {
  formatFishermenDistributionData,
  formatPopulationData,
  formatPercentageData
} from '../utils/dataFormatters';
import { defaultBarOptions, defaultPieOptions, getResponsiveChartOptions } from '../utils/chartUtils'; // Add this import

// Import styles
import '../styles/pages/maps.css';
import '../styles/components/community-access.css';

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
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [chartsTransitioning, setChartsTransitioning] = useState(false); // Add this state

  // Update window width state
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Patch Chart.js resize method
  useEffect(() => {
    if (window.Chart) {
      const originalResize = window.Chart.prototype.resize;
      window.Chart.prototype.resize = function() {
        try {
          if (this.canvas && document.body.contains(this.canvas)) {
            originalResize.apply(this);
          }
        } catch (err) {
          console.log("Prevented chart resize error");
        }
      };
    }
  }, []);

  // Set chart ready after loading
  useEffect(() => {
    if (!loading && communitiesData.length > 0) {
      // Slightly longer timeout on mobile for smoother rendering
      const delay = windowWidth < 576 ? 200 : 100;
      setTimeout(() => {
        setChartReady(true);
      }, delay);
    }
  }, [loading, communitiesData, windowWidth]);

  // Prepare chart data using formatters - Optimize data for mobile if needed
  const fishermenDistributionData = formatFishermenDistributionData(communitiesData, windowWidth < 576);
  const populationByMunicipalityData = formatPopulationData(communitiesData, windowWidth < 576);
  const fishermenPercentageData = formatPercentageData(communitiesData, windowWidth < 576);

  // Modify chart options for mobile
  const mobileBarOptions = {
    ...defaultBarOptions,
    plugins: {
      ...defaultBarOptions.plugins,
      datalabels: {
        ...defaultBarOptions.plugins?.datalabels,
        display: windowWidth >= 576 // Only show data labels on larger screens
      }
    }
  };

  const mobilePieOptions = {
    ...defaultPieOptions,
    plugins: {
      ...defaultPieOptions.plugins,
      legend: {
        ...defaultPieOptions.plugins?.legend,
        position: windowWidth < 576 ? 'bottom' : 'right'
      }
    }
  };

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
          <h1>Monitoramento de Comunidades</h1>
          <p className="slide-up">
            O PESCARTE é um projeto de mitigação ambiental da UENF em parceria
            com a Petrobras. Esta plataforma oferece ferramentas analíticas
            interativas sobre as comunidades pesqueiras da Bacia de Campos e
            Espírito Santo. Através de dashboards dinâmicos, é possível
            visualizar estatísticas demográficas, comparar comunidades e gerar
            relatórios personalizados.
          </p>
        </div>
      </div>

      <div className="wave-divider"></div>

      {/* Modular Stats Summary Component */}
      <StatsSummary stats={stats} />

      {/* Enhanced Charts Section with better loading state */}
      <div className="chart-section-container">
        <h2 className="section-heading">Estatísticas Visuais</h2>
        <p className="section-description">
          Visualize os principais indicadores das comunidades pesqueiras monitoradas pelo projeto PESCARTE.
        </p>

        {loading && !chartReady ? (
          <ChartLoading />
        ) : (
          <ChartsSection
            fishermenDistributionData={fishermenDistributionData}
            populationByMunicipalityData={populationByMunicipalityData}
            fishermenPercentageData={fishermenPercentageData}
            pieOptions={mobilePieOptions}
            barOptions={mobileBarOptions}
            windowWidth={windowWidth}
            getResponsiveChartOptions={getResponsiveChartOptions}
          />
        )}
      </div>

      {/* Map Section with better heading */}
      <div className="map-section-container">
        <h2 className="section-heading">Localização Geográfica</h2>
        <p className="section-description">
          Explore a distribuição geográfica das comunidades pesqueiras e acesse detalhes específicos.
        </p>
        <CommunityMapSection />
      </div>

      {/* Access Component with heading */}
      <div className="access-section-container">
        <h2 className="section-heading">Acesso Rápido por Município</h2>
        <p className="section-description">
          Explore dados consolidados dos principais municípios e acesse comunidades específicas.
        </p>
        <CommunityAccess communitiesData={communitiesData} />
      </div>
    </div>
  );
};

export default Dashboard;
