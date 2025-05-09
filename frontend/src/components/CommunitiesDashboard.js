import React, { useState, useEffect } from 'react';
import { fetchMunicipios, fetchComunidadesByMunicipio, fetchComunidadesSummary } from '../services/communitiesApi';
import { Link } from 'react-router-dom';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';

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
  const [municipios, setMunicipios] = useState([]);
  const [selectedMunicipio, setSelectedMunicipio] = useState('');
  const [communitiesList, setCommunitiesList] = useState([]);
  const [communitiesData, setCommunitiesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCriteria, setFilterCriteria] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  // Load municipalities
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const municData = await fetchMunicipios();
        setMunicipios(municData);

        // Load summary data initially
        const summaryData = await fetchComunidadesSummary();
        setCommunitiesData(summaryData);

        setLoading(false);
      } catch (error) {
        setError('Falha ao carregar municípios: ' + error.message);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Load communities when municipality is selected
  useEffect(() => {
    const fetchCommunities = async () => {
      if (!selectedMunicipio) return;

      try {
        setLoading(true);
        const data = await fetchComunidadesByMunicipio(selectedMunicipio);
        setCommunitiesList(data);
        setLoading(false);
      } catch (error) {
        setError('Falha ao carregar comunidades: ' + error.message);
        setLoading(false);
      }
    };

    fetchCommunities();
  }, [selectedMunicipio]);

  const handleMunicipioChange = (event) => {
    setSelectedMunicipio(event.target.value);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleFilterChange = (event) => {
    setFilterCriteria(event.target.value);
  };

  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  // Filter communities based on search term and criteria
  const filteredCommunities = communitiesList.filter(community => {
    const matchesSearch = community.nome.toLowerCase().includes(searchTerm.toLowerCase());

    switch(filterCriteria) {
      case 'high_fishermen':
        return matchesSearch && (community.pescadores / community.pessoas > 0.25);
      case 'large_population':
        return matchesSearch && (community.pessoas > 1500);
      default:
        return matchesSearch;
    }
  });

  // Prepare chart data for selected municipality's communities
  const communityChartData = {
    labels: communitiesList.map(community => community.nome),
    datasets: [
      {
        label: 'População Total',
        data: communitiesList.map(community => community.pessoas),
        backgroundColor: 'rgba(54, 162, 235, 0.7)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
      },
      {
        label: 'Pescadores',
        data: communitiesList.map(community => community.pescadores),
        backgroundColor: 'rgba(255, 99, 132, 0.7)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 1,
      }
    ],
  };

  // Chart for fishermen percentage
  const fishermenPercentageData = {
    labels: communitiesList.map(community => community.nome),
    datasets: [
      {
        label: 'Percentual de Pescadores',
        data: communitiesList.map(community =>
          ((community.pescadores / community.pessoas) * 100).toFixed(1)
        ),
        backgroundColor: [
          'rgba(153, 102, 255, 0.7)',
          'rgba(54, 162, 235, 0.7)',
          'rgba(255, 206, 86, 0.7)',
          'rgba(75, 192, 192, 0.7)',
          'rgba(255, 99, 132, 0.7)',
        ],
        borderColor: [
          'rgba(153, 102, 255, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(255, 99, 132, 1)',
        ],
        borderWidth: 1,
      }
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: selectedMunicipio ? `Comunidades em ${municipios.find(m => m.id === parseInt(selectedMunicipio))?.nome || ''}` : 'Todas as Comunidades',
        font: { size: 16 }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.dataset.label || '';
            const value = context.parsed.y;
            return `${label}: ${value.toLocaleString('pt-BR')}`;
          }
        }
      },
      datalabels: {
        display: true,
        color: '#fff',
        font: { weight: 'bold' },
        formatter: (value) => value.toLocaleString('pt-BR')
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
          borderDash: [5, 5]
        }
      },
      x: {
        grid: {
          display: false
        }
      }
    }
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: { font: { size: 11 } }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const value = context.raw;
            return `${context.label}: ${value}%`;
          }
        }
      }
    }
  };

  // For municipalities overview when no municipality is selected
  const municipalityOverviewData = {
    labels: communitiesData.map(item => item.municipio),
    datasets: [
      {
        label: 'Comunidades',
        data: communitiesData.map(item => parseInt(item.num_comunidades) || 0),
        backgroundColor: 'rgba(75, 192, 192, 0.7)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
      {
        label: 'Pescadores (em centenas)',
        data: communitiesData.map(item => (parseInt(item.total_pescadores) || 0) / 100),
        backgroundColor: 'rgba(255, 99, 132, 0.7)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 1,
      }
    ],
  };

  return (
    <div className="communities-dashboard">
      <h1>Comunidades Pesqueiras</h1>

      <div className="communities-controls">
        <div className="selector-container">
          <label htmlFor="municipio-select">Selecionar Município:</label>
          <select
            id="municipio-select"
            value={selectedMunicipio}
            onChange={handleMunicipioChange}
            className="municipio-selector"
          >
            <option value="">Todos os municípios</option>
            {municipios.map(municipio => (
              <option key={municipio.id} value={municipio.id}>
                {municipio.nome}
              </option>
            ))}
          </select>
        </div>

        <button className="filter-toggle" onClick={toggleFilters}>
          {showFilters ? 'Esconder Filtros' : 'Mostrar Filtros'}
        </button>
      </div>

      {showFilters && (
        <div className="filter-container">
          <div className="search-container">
            <input
              type="text"
              placeholder="Buscar comunidade..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="search-input"
            />
          </div>

          <div className="filter-options">
            <label htmlFor="filter-select">Filtrar por:</label>
            <select
              id="filter-select"
              value={filterCriteria}
              onChange={handleFilterChange}
              className="filter-selector"
            >
              <option value="all">Todas comunidades</option>
              <option value="high_fishermen">Alto percentual de pescadores (>25%)</option>
              <option value="large_population">População grande (>1500)</option>
            </select>
          </div>
        </div>
      )}

      {loading ? (
        <div className="loading">Carregando dados...</div>
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : (
        <>
          <div className="charts-container">
            {selectedMunicipio ? (
              <>
                <div className="chart-section">
                  <h2>População e Pescadores por Comunidade</h2>
                  <div className="chart-wrapper">
                    <Bar data={communityChartData} options={chartOptions} />
                  </div>
                </div>

                <div className="chart-section">
                  <h2>Percentual de Pescadores por Comunidade</h2>
                  <div className="chart-wrapper">
                    <Pie data={fishermenPercentageData} options={pieOptions} />
                  </div>
                </div>
              </>
            ) : (
              <div className="chart-section full-width">
                <h2>Visão Geral dos Municípios</h2>
                <div className="chart-wrapper">
                  <Bar data={municipalityOverviewData} options={chartOptions} />
                </div>
              </div>
            )}
          </div>

          <div className="communities-list">
            <h2>
              {selectedMunicipio
                ? `Comunidades em ${municipios.find(m => m.id === parseInt(selectedMunicipio))?.nome || ''}`
                : 'Selecione um município para ver suas comunidades'}
            </h2>

            {selectedMunicipio && communitiesList.length > 0 ? (
              <div className="communities-grid">
                {communitiesList.map(community => (
                  <div key={community.id} className="community-card">
                    <h3>{community.nome}</h3>
                    <div className="community-stats">
                      <div className="stat-item">
                        <span className="stat-label">População:</span>
                        <span className="stat-value">{community.pessoas.toLocaleString('pt-BR')}</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-label">Pescadores:</span>
                        <span className="stat-value">{community.pescadores.toLocaleString('pt-BR')}</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-label">% Pescadores:</span>
                        <span className="stat-value">
                          {((community.pescadores / community.pessoas) * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-label">Famílias:</span>
                        <span className="stat-value">{community.familias.toLocaleString('pt-BR')}</span>
                      </div>
                    </div>
                    <Link to={`/community/${community.id}`} className="view-button">
                      Ver detalhes
                    </Link>
                  </div>
                ))}
              </div>
            ) : selectedMunicipio ? (
              <div className="no-data-message">
                Nenhuma comunidade encontrada para este município.
              </div>
            ) : (
              <div className="municipalities-overview">
                {communitiesData.map((municipalityData, index) => (
                  <div key={index} className="municipality-summary-card">
                    <h3>{municipalityData.municipio}</h3>
                    <div className="municipality-stats">
                      <div className="stat-row">
                        <span>Comunidades:</span>
                        <span>{municipalityData.num_comunidades}</span>
                      </div>
                      <div className="stat-row">
                        <span>Pescadores:</span>
                        <span>{parseInt(municipalityData.total_pescadores).toLocaleString('pt-BR')}</span>
                      </div>
                      <div className="stat-row">
                        <span>População:</span>
                        <span>{parseInt(municipalityData.total_pessoas).toLocaleString('pt-BR')}</span>
                      </div>
                      <div className="stat-row">
                        <span>% Pescadores:</span>
                        <span>
                          {(parseInt(municipalityData.total_pescadores) / parseInt(municipalityData.total_pessoas) * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                    <button
                      className="select-municipality-button"
                      onClick={() => {
                        const municipio = municipios.find(m => m.nome === municipalityData.municipio);
                        if (municipio) {
                          setSelectedMunicipio(municipio.id.toString());
                        }
                      }}
                    >
                      Selecionar Município
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default CommunitiesDashboard;
