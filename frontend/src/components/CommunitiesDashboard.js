import React, { useState, useEffect } from 'react';
import { Bar, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { fetchComunidadesSummary, fetchComunidadesByMunicipio } from '../services/communitiesApi';

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
  const [selectedMunicipio, setSelectedMunicipio] = useState(null);
  const [communitiesList, setCommunitiesList] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCriteria, setFilterCriteria] = useState({
    minPopulation: '',
    maxPopulation: '',
    minFishermen: '',
    maxFishermen: ''
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const data = await fetchComunidadesSummary();
        console.log("Dados recebidos:", data); // Debug log

        if (!data || data.length === 0) {
          setError('Não há dados de comunidades disponíveis');
        } else {
          setCommunitiesData(data);
        }

        setLoading(false);
      } catch (err) {
        console.error("Erro do Dashboard:", err);
        setError(`Falha ao carregar dados das comunidades: ${err.message}`);
        setLoading(false);
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    const fetchCommunities = async () => {
      if (!selectedMunicipio) return;

      try {
        const data = await fetchComunidadesByMunicipio(selectedMunicipio);
        setCommunitiesList(data);
      } catch (err) {
        console.error("Erro ao buscar lista de comunidades:", err);
      }
    };

    fetchCommunities();
  }, [selectedMunicipio]);

  const handleMunicipioSelect = (municipio) => {
    const municipioId = communitiesData.find(m => m.municipio === municipio)?.id;
    setSelectedMunicipio(municipioId);
  };

  // Função de filtro
  const filteredCommunities = communitiesList.filter(community => {
    // Busca por nome
    if (searchTerm && !community.nome.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }

    // Filtro por população
    if (filterCriteria.minPopulation && community.pessoas < parseInt(filterCriteria.minPopulation)) {
      return false;
    }
    if (filterCriteria.maxPopulation && community.pessoas > parseInt(filterCriteria.maxPopulation)) {
      return false;
    }

    // Mais filtros conforme necessário

    return true;
  });

  // Dados para gráfico de barras comparativo de municípios
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

  // Dados para gráfico de pizza de percentual de pescadores
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

  // Opções do gráfico
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

  if (loading) return <div className="loading">Carregando dados das comunidades...</div>;
  if (error) return (
    <div className="dashboard">
      <h1>Painel das Comunidades de Pesca</h1>
      <div className="error-container">
        <h2>Erro ao carregar dados</h2>
        <p>{error}</p>
        <p>Verifique se o servidor backend está funcionando corretamente.</p>
      </div>
    </div>
  );

  return (
    <div className="dashboard">
      <h1>Painel das Comunidades de Pesca</h1>

      <div className="municipality-selector">
        <h2>Selecionar Município</h2>
        <div className="buttons-group">
          {communitiesData.map((item) => (
            <button
              key={item.municipio}
              onClick={() => handleMunicipioSelect(item.municipio)}
              className={selectedMunicipio === item.id ? 'active' : ''}
            >
              {item.municipio}
            </button>
          ))}
        </div>
      </div>

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
