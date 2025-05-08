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
import { Pie, Bar } from 'react-chartjs-2';
import { fetchComunidadesSummary } from '../services/communitiesApi';
import { Link } from 'react-router-dom';
import pescarteLogoBlue from '../assets/pescarte_logo.svg';

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
  PointElement
);

const Dashboard = () => {
  const [communitiesData, setCommunitiesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [chartReady, setChartReady] = useState(false);

  // Estatísticas gerais do projeto PESCARTE
  const [pescarteStats, setPescarteStats] = useState({
    totalMunicipios: 0,
    totalCommunities: 0,
    totalFishermen: 0,
    totalPeople: 0,
    totalFamilies: 0,
    averageFishermenPercentage: 0
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await fetchComunidadesSummary();
        console.log("Dashboard data received:", data); // Debug log

        if (data && data.length > 0) {
          setCommunitiesData(data);

          // Calcular estatísticas
          const stats = data.reduce((acc, item) => {
            acc.totalMunicipios += 1;
            acc.totalCommunities += parseInt(item.num_comunidades) || 0;
            acc.totalFishermen += parseInt(item.total_pescadores) || 0;
            acc.totalPeople += parseInt(item.total_pessoas) || 0;
            acc.totalFamilies += parseInt(item.total_familias) || 0;
            return acc;
          }, {
            totalMunicipios: 0,
            totalCommunities: 0,
            totalFishermen: 0,
            totalPeople: 0,
            totalFamilies: 0
          });

          stats.averageFishermenPercentage = stats.totalPeople > 0
            ? ((stats.totalFishermen / stats.totalPeople) * 100).toFixed(1)
            : "0.0";

          // Atualizar estatísticas
          setPescarteStats(stats);
        }

        setLoading(false);

        // Set a small delay to ensure DOM is ready for charts
        setTimeout(() => {
          setChartReady(true);
        }, 100);
      } catch (err) {
        setError('Falha ao carregar dados do projeto PESCARTE: ' + err.message);
        setLoading(false);
        console.error('Erro ao buscar dados do dashboard:', err);
      }
    };

    fetchData();
  }, []);

  // Dados para gráfico de distribuição de pescadores por município
  const fishermenDistributionData = {
    labels: communitiesData.map(item => item.municipio),
    datasets: [
      {
        label: 'Pescadores por Município',
        data: communitiesData.map(item => parseInt(item.total_pescadores) || 0),
        backgroundColor: [
          'rgba(0, 117, 201, 0.7)', // Azul PESCARTE
          'rgba(245, 130, 32, 0.7)', // Laranja PESCARTE
          'rgba(0, 76, 153, 0.7)',   // Azul escuro
        ],
        borderColor: [
          'rgba(0, 117, 201, 1)',
          'rgba(245, 130, 32, 1)',
          'rgba(0, 76, 153, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  // Dados para gráfico de população das comunidades por município
  const populationByMunicipalityData = {
    labels: communitiesData.map(item => item.municipio),
    datasets: [
      {
        label: 'População Total',
        data: communitiesData.map(item => parseInt(item.total_pessoas) || 0),
        backgroundColor: 'rgba(0, 117, 201, 0.6)',
        borderColor: 'rgba(0, 117, 201, 1)',
        borderWidth: 1,
      },
      {
        label: 'Pescadores',
        data: communitiesData.map(item => parseInt(item.total_pescadores) || 0),
        backgroundColor: 'rgba(245, 130, 32, 0.6)',
        borderColor: 'rgba(245, 130, 32, 1)',
        borderWidth: 1,
      }
    ],
  };

  // Dados para gráfico de porcentagem de pescadores
  const fishermenPercentageData = {
    labels: communitiesData.map(item => item.municipio),
    datasets: [
      {
        label: 'Percentual de Pescadores (%)',
        data: communitiesData.map(item => {
          const pessoas = parseInt(item.total_pessoas) || 0;
          const pescadores = parseInt(item.total_pescadores) || 0;
          return pessoas > 0 ? ((pescadores / pessoas) * 100).toFixed(1) : 0;
        }),
        backgroundColor: 'rgba(153, 102, 255, 0.6)',
        borderColor: 'rgba(153, 102, 255, 1)',
        borderWidth: 1,
      }
    ],
  };

  // Opções para os gráficos
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Dados das Comunidades Pesqueiras',
        font: {
          size: 16,
          weight: 'bold'
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `${context.dataset.label}: ${context.raw}`;
          }
        }
      }
    },
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          font: {
            size: 12
          }
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `${context.label}: ${context.raw} pescadores`;
          }
        }
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
          <h1>Projeto PESCARTE</h1>
          <p className="slide-up">
            O PESCARTE é um projeto de mitigação ambiental desenvolvido pela Universidade Federal Fluminense (UFF)
            em parceria com a Petrobras. Seu objetivo é promover, fortalecer e aperfeiçoar a pesca artesanal nas
            comunidades pesqueiras da Bacia de Campos e Espírito Santo, contribuindo para a sustentabilidade
            socioeconômica e ambiental da atividade pesqueira na região.
          </p>
        </div>
      </div>

      <div className="wave-divider"></div>

      <div className="pescarte-stats-overview">
        <div className="stat-card pulse">
          <h3>Municípios</h3>
          <div className="stat-value">{pescarteStats.totalMunicipios}</div>
        </div>
        <div className="stat-card pulse">
          <h3>Comunidades</h3>
          <div className="stat-value">{pescarteStats.totalCommunities}</div>
        </div>
        <div className="stat-card pulse">
          <h3>Pescadores</h3>
          <div className="stat-value">{pescarteStats.totalFishermen}</div>
          <div className="stat-subtitle">{pescarteStats.averageFishermenPercentage}% da população</div>
        </div>
        <div className="stat-card pulse">
          <h3>População Total</h3>
          <div className="stat-value">{pescarteStats.totalPeople}</div>
        </div>
      </div>

      {chartReady && (
        <div className="dashboard-grid">
          <div className="chart-container">
            <h2>Distribuição de Pescadores</h2>
            <div className="chart-wrapper">
              <Pie data={fishermenDistributionData} options={pieOptions} />
            </div>
          </div>

          <div className="chart-container">
            <h2>População por Município</h2>
            <div className="chart-wrapper">
              <Bar data={populationByMunicipalityData} options={chartOptions} />
            </div>
          </div>

          <div className="chart-container">
            <h2>Percentual de Pescadores</h2>
            <div className="chart-wrapper">
              <Bar data={fishermenPercentageData} options={chartOptions} />
            </div>
          </div>
        </div>
      )}

      <div className="community-links-section">
        <h2>Acesso Rápido às Comunidades</h2>
        <div className="community-links-container">
          {communitiesData.slice(0, 3).map((municipality, index) => (
            <div key={index} className="municipality-card">
              <h3>{municipality.municipio}</h3>
              <div className="municipality-stats">
                <p><strong>Comunidades:</strong> {municipality.num_comunidades}</p>
                <p><strong>Pescadores:</strong> {municipality.total_pescadores}</p>
                <p><strong>População Total:</strong> {municipality.total_pessoas}</p>
              </div>
              <Link to="/communities" className="button-primary">Ver comunidades</Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
