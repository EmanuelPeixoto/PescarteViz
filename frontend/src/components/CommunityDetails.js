import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Bar, Pie, Doughnut, Line } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title, LineElement, PointElement } from 'chart.js';
import { fetchCommunityDetails, fetchCommunityTimeSeries } from '../services/communitiesApi';
import { handleApiError } from '../utils/errorHandler'; // Add this import

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

// Add a time series chart component for historical data
const TimeSeriesChart = ({ historicalData }) => {
  // Handle empty data case gracefully
  if (!historicalData || historicalData.length === 0) {
    return (
      <div className="no-data-message">
        <p>Não há dados históricos disponíveis para esta comunidade.</p>
        <p>Apenas dados do censo atual estão disponíveis.</p>
      </div>
    );
  }

  // If there's only one data point
  if (historicalData.length === 1) {
    return (
      <div className="single-point-data">
        <h3>Dados do Censo {historicalData[0].ano}</h3>
        <div className="census-stats">
          <div className="stat">
            <span className="stat-label">População Total:</span>
            <span className="stat-value">{historicalData[0].pessoas.toLocaleString('pt-BR')}</span>
          </div>
          <div className="stat">
            <span className="stat-label">Pescadores:</span>
            <span className="stat-value">{historicalData[0].pescadores.toLocaleString('pt-BR')}</span>
          </div>
          <div className="stat">
            <span className="stat-label">Famílias:</span>
            <span className="stat-value">{historicalData[0].familias.toLocaleString('pt-BR')}</span>
          </div>
        </div>
        <p className="data-note">Para visualizar tendências, é necessário mais de um ano de dados do censo.</p>
      </div>
    );
  }

  // Regular chart rendering with multiple data points
  const years = historicalData.map(item => item.ano);
  const pessoas = historicalData.map(item => item.pessoas);
  const pescadores = historicalData.map(item => item.pescadores);

  const chartData = {
    labels: years,
    datasets: [
      {
        label: 'População Total',
        data: pessoas,
        borderColor: 'rgb(54, 162, 235)',
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
      },
      {
        label: 'Pescadores',
        data: pescadores,
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
      }
    ]
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Dados históricos da comunidade'
      },
    },
  };

  return <Line data={chartData} options={options} />;
};

const CommunityDetails = () => {
  const { id } = useParams();
  const [communityData, setCommunityData] = useState(null);
  const [historicalData, setHistoricalData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Try to fetch community details first
        let data = null;
        try {
          data = await fetchCommunityDetails(id);
          setCommunityData(data);
        } catch (err) {
          const errorMsg = handleApiError(err);
          throw new Error(errorMsg);
        }

        // Only fetch time series if community details succeeded
        try {
          const historicalData = await fetchCommunityTimeSeries(id);
          setHistoricalData(historicalData);
        } catch (err) {
          console.error("Warning: Could not fetch time series data:", err);
          // Don't fail the whole component for missing time series
        }

        setLoading(false);
      } catch (err) {
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

      {historicalData && historicalData.length > 1 && (
        <div className="historical-data-section">
          <h2>Dados Históricos</h2>
          <TimeSeriesChart historicalData={historicalData} />
          <div className="trends-analysis">
            <h3>Análise de Tendências</h3>
            <TrendAnalysisComponent data={historicalData} />
          </div>
        </div>
      )}
    </div>
  );
};

export default CommunityDetails;
