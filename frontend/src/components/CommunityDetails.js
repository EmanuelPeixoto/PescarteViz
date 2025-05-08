import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Bar, Pie, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { fetchCommunityDetails } from '../services/communitiesApi';

// Register ChartJS components
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
);

const CommunityDetails = () => {
  const { id } = useParams();
  const [communityData, setCommunityData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const data = await fetchCommunityDetails(id);
        setCommunityData(data);
        setLoading(false);
      } catch (err) {
        console.error("Erro nos detalhes da comunidade:", err);
        setError(`Falha ao carregar detalhes da comunidade: ${err.message}`);
        setLoading(false);
      }
    };

    if (id) {
      loadData();
    }
  }, [id]);

  if (loading) return <div className="loading">Carregando detalhes da comunidade...</div>;
  if (error) return <div className="error-container">{error}</div>;
  if (!communityData) return <div>Nenhum dado disponível</div>;

  const { demograficos = [] } = communityData;

  // Agrupar dados demográficos para gráficos
  const byGender = demograficos.reduce((acc, item) => {
    if (item.genero) {
      acc[item.genero] = (acc[item.genero] || 0) + item.quantidade;
    }
    return acc;
  }, {});

  const byAge = demograficos.reduce((acc, item) => {
    if (item.faixa_etaria) {
      acc[item.faixa_etaria] = (acc[item.faixa_etaria] || 0) + item.quantidade;
    }
    return acc;
  }, {});

  const byOccupation = demograficos.reduce((acc, item) => {
    if (item.profissao) {
      acc[item.profissao] = (acc[item.profissao] || 0) + item.quantidade;
    }
    return acc;
  }, {});

  // Adicionar gráfico de distribuição de renda
  const byIncome = demograficos.reduce((acc, item) => {
    if (item.renda_mensal) {
      // Agrupar por faixas de renda
      let range;
      if (item.renda_mensal < 1000) range = 'Abaixo de R$ 1.000';
      else if (item.renda_mensal < 2000) range = 'R$ 1.000 - 2.000';
      else if (item.renda_mensal < 3000) range = 'R$ 2.000 - 3.000';
      else if (item.renda_mensal < 4000) range = 'R$ 3.000 - 4.000';
      else range = 'Acima de R$ 4.000';

      acc[range] = (acc[range] || 0) + item.quantidade;
    }
    return acc;
  }, {});

  // Preparar dados do gráfico
  const genderData = {
    labels: Object.keys(byGender),
    datasets: [
      {
        data: Object.values(byGender),
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0'],
        hoverBackgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0']
      }
    ]
  };

  const ageData = {
    labels: Object.keys(byAge),
    datasets: [
      {
        label: 'Pessoas por Faixa Etária',
        data: Object.values(byAge),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1
      }
    ]
  };

  const occupationData = {
    labels: Object.keys(byOccupation).slice(0, 8), // Limitar às 8 principais ocupações
    datasets: [
      {
        label: 'Pessoas por Ocupação',
        data: Object.values(byOccupation).slice(0, 8),
        backgroundColor: 'rgba(153, 102, 255, 0.6)',
        borderColor: 'rgba(153, 102, 255, 1)',
        borderWidth: 1
      }
    ]
  };

  const incomeData = {
    labels: Object.keys(byIncome),
    datasets: [{
      label: 'Distribuição de Renda',
      data: Object.values(byIncome),
      backgroundColor: 'rgba(255, 159, 64, 0.6)',
      borderColor: 'rgba(255, 159, 64, 1)',
      borderWidth: 1
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom'
      }
    }
  };

  // Calcular percentuais
  const totalPeople = communityData.pessoas;
  const fishermenPercentage = ((communityData.pescadores / totalPeople) * 100).toFixed(1);
  const avgFamilySize = (totalPeople / communityData.familias).toFixed(1);

  return (
    <div className="community-details">
      <div className="community-header">
        <h1>{communityData.nome}</h1>
        <h2>{communityData.municipio_nome}</h2>
      </div>

      <div className="stats-overview">
        <div className="stat-card">
          <h3>População Total</h3>
          <div className="stat-value">{totalPeople}</div>
        </div>
        <div className="stat-card">
          <h3>Pescadores</h3>
          <div className="stat-value">{communityData.pescadores}</div>
          <div className="stat-subtitle">{fishermenPercentage}% da população</div>
        </div>
        <div className="stat-card">
          <h3>Famílias</h3>
          <div className="stat-value">{communityData.familias}</div>
          <div className="stat-subtitle">~{avgFamilySize} pessoas por família</div>
        </div>
      </div>

      {demograficos.length > 0 ? (
        <div className="demographic-charts">
          <h2>Informações Demográficas</h2>

          <div className="chart-grid">
            {Object.keys(byGender).length > 0 && (
              <div className="chart-box">
                <h3>Distribuição por Gênero</h3>
                <div className="chart-wrapper">
                  <Pie data={genderData} options={chartOptions} />
                </div>
              </div>
            )}

            {Object.keys(byAge).length > 0 && (
              <div className="chart-box">
                <h3>Distribuição por Idade</h3>
                <div className="chart-wrapper">
                  <Bar data={ageData} options={chartOptions} />
                </div>
              </div>
            )}

            {Object.keys(byOccupation).length > 0 && (
              <div className="chart-box">
                <h3>Principais Ocupações</h3>
                <div className="chart-wrapper">
                  <Bar data={occupationData} options={chartOptions} />
                </div>
              </div>
            )}

            {Object.keys(byIncome).length > 0 && (
              <div className="chart-box">
                <h3>Distribuição de Renda</h3>
                <div className="chart-wrapper">
                  <Bar data={incomeData} options={chartOptions} />
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="no-demographic-data">
          <p>Nenhum dado demográfico disponível para esta comunidade.</p>
        </div>
      )}
    </div>
  );
};

export default CommunityDetails;
