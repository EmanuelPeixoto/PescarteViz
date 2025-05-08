import React, { useState, useEffect } from 'react';
import { Bar, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { fetchComunidadesSummary } from '../services/communitiesApi';

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

const CommunitiesDashboard = () => {
  const [communitiesData, setCommunitiesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const data = await fetchComunidadesSummary();
        console.log("Received data:", data); // Debug log

        if (!data || data.length === 0) {
          setError('No community data available');
        } else {
          setCommunitiesData(data);
        }

        setLoading(false);
      } catch (err) {
        console.error("Dashboard error:", err);
        setError(`Failed to load community data: ${err.message}`);
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Data for municipality comparison bar chart
  const municipalityBarData = {
    labels: communitiesData.map(item => item.municipio),
    datasets: [
      {
        label: 'Total Pessoas',
        data: communitiesData.map(item => item.total_pessoas),
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
      },
      {
        label: 'Total Pescadores',
        data: communitiesData.map(item => item.total_pescadores),
        backgroundColor: 'rgba(255, 99, 132, 0.6)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 1,
      }
    ],
  };

  // Data for fishermen percentage pie chart
  const fishermanPieData = {
    labels: communitiesData.map(item => item.municipio),
    datasets: [
      {
        label: 'Total Pescadores',
        data: communitiesData.map(item => item.total_pescadores),
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  // Chart options
  const barOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'População por Município',
      },
    },
  };

  const pieOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Distribuição de Pescadores por Município',
      },
    },
  };

  if (loading) return <div>Carregando dados das comunidades...</div>;
  if (error) return (
    <div className="dashboard">
      <h1>Painel das Comunidades de Pesca</h1>
      <div className="error-container" style={{padding: "20px", backgroundColor: "#ffdddd", borderRadius: "5px", margin: "20px 0"}}>
        <h2>Erro ao carregar dados</h2>
        <p>{error}</p>
        <p>Verifique se o servidor backend está funcionando corretamente.</p>
      </div>
    </div>
  );

  return (
    <div className="dashboard">
      <h1>Painel das Comunidades de Pesca</h1>

      <div className="dashboard-grid">
        <div className="chart-container">
          <h2>População e Pescadores por Município</h2>
          <Bar data={municipalityBarData} options={barOptions} />
        </div>

        <div className="chart-container">
          <h2>Distribuição de Pescadores</h2>
          <Pie data={fishermanPieData} options={pieOptions} />
        </div>
      </div>

      <div className="table-container">
        <h2>Resumo por Município</h2>
        <table>
          <thead>
            <tr>
              <th>Município</th>
              <th>Comunidades</th>
              <th>População Total</th>
              <th>Famílias</th>
              <th>Pescadores</th>
              <th>% Pescadores</th>
            </tr>
          </thead>
          <tbody>
            {communitiesData.map((item) => (
              <tr key={item.municipio}>
                <td>{item.municipio}</td>
                <td>{item.num_comunidades}</td>
                <td>{item.total_pessoas}</td>
                <td>{item.total_familias}</td>
                <td>{item.total_pescadores}</td>
                <td>{((item.total_pescadores / item.total_pessoas) * 100).toFixed(1)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CommunitiesDashboard;
