import React, { useState, useEffect } from 'react';
import { Bar, Radar, Doughnut } from 'react-chartjs-2';
import { fetchCommunityDetails, fetchMunicipios, fetchComunidadesByMunicipio } from '../services/communitiesApi';
import ChartContainer from './ui/ChartContainer';
import axios from 'axios';
import '../styles/comparison.css';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
  RadialLinearScale,
  ArcElement
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
  RadialLinearScale, // This is required for Radar chart
  ArcElement // This is required for Doughnut chart
);

// Replace the placeholder API URL
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

const CommunityComparison = () => {
  const [municipalities, setMunicipalities] = useState([]);
  const [selectedMunicipality, setSelectedMunicipality] = useState('');
  const [communities, setCommunities] = useState([]);
  const [selectedCommunities, setSelectedCommunities] = useState([]);
  const [communityData, setCommunityData] = useState([]);
  const [fishingTypesData, setFishingTypesData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [demographicData, setDemographicData] = useState({
    age: [],
    income: [],
    education: []
  });
  const [showDemographics, setShowDemographics] = useState(false);
  const [viewMode, setViewMode] = useState('basic');

  // Add this right after all your useState declarations

  // Global patch to Chart.js to prevent errors
  useEffect(() => {
    if (window.Chart && window.Chart.prototype) {
      const originalResize = window.Chart.prototype.resize;
      window.Chart.prototype.resize = function() {
        try {
          if (this.canvas && document.body.contains(this.canvas)) {
            originalResize.apply(this);
          }
        } catch (err) {
          // Silent catch
        }
      };
    }
  }, []);

  // Add as helper functions in your component
  const processAgeData = (ageData) => {
    // Define age categories to standardize display
    const ageCategories = ['0-17', '18-24', '25-34', '35-44', '45-59', '60+'];

    // Group by community and age
    const communitiesAgeData = {};

    ageData.forEach(item => {
      if (!communitiesAgeData[item.community_id]) {
        communitiesAgeData[item.community_id] = {
          name: item.community_name,
          ageGroups: {}
        };
      }

      communitiesAgeData[item.community_id].ageGroups[item.subcategoria] = parseFloat(item.valor);
    });

    // Create datasets for Chart.js
    const datasets = Object.values(communitiesAgeData).map((community, index) => ({
      label: community.name,
      data: ageCategories.map(category => community.ageGroups[category] || 0),
      backgroundColor: `rgba(${colors[index % colors.length]}, 0.6)`,
      borderColor: `rgba(${colors[index % colors.length]}, 1)`,
      borderWidth: 1,
    }));

    return {
      labels: ageCategories,
      datasets
    };
  };

  const processIncomeData = (incomeData) => {
    // Define income levels to standardize display
    const incomeLevels = [
      'Abaixo de R$ 1.000',
      'R$ 1.000 - 2.000',
      'R$ 2.000 - 3.000',
      'R$ 3.000 - 4.000',
      'Acima de R$ 4.000'
    ];

    // Group by community and income level
    const communitiesIncomeData = {};

    incomeData.forEach(item => {
      if (!communitiesIncomeData[item.community_id]) {
        communitiesIncomeData[item.community_id] = {
          name: item.community_name,
          incomeLevels: {}
        };
      }

      communitiesIncomeData[item.community_id].incomeLevels[item.subcategoria] = parseFloat(item.valor);
    });

    // Create datasets for Chart.js
    const datasets = Object.values(communitiesIncomeData).map((community, index) => ({
      label: community.name,
      data: incomeLevels.map(level => community.incomeLevels[level] || 0),
      backgroundColor: `rgba(${colors[index % colors.length]}, 0.6)`,
      borderColor: `rgba(${colors[index % colors.length]}, 1)`,
      borderWidth: 1,
    }));

    return {
      labels: incomeLevels,
      datasets
    };
  };

  const processEducationData = (educationData) => {
    // Define education levels to standardize display
    const educationLevels = [
      'Ensino Fundamental Incompleto',
      'Ensino Fundamental Completo',
      'Ensino Médio Incompleto',
      'Ensino Médio Completo',
      'Ensino Superior Incompleto',
      'Ensino Superior Completo'
    ];

    // Group by community and education level
    const communitiesEducationData = {};

    educationData.forEach(item => {
      if (!communitiesEducationData[item.community_id]) {
        communitiesEducationData[item.community_id] = {
          name: item.community_name,
          educationLevels: {}
        };
      }

      communitiesEducationData[item.community_id].educationLevels[item.subcategoria] = parseFloat(item.valor);
    });

    // Create datasets for Chart.js
    const datasets = Object.values(communitiesEducationData).map((community, index) => ({
      label: community.name,
      data: educationLevels.map(level => community.educationLevels[level] || 0),
      backgroundColor: `rgba(${colors[index % colors.length]}, 0.6)`,
      borderColor: `rgba(${colors[index % colors.length]}, 1)`,
      borderWidth: 1,
    }));

    return {
      labels: educationLevels,
      datasets
    };
  };

  // Add fallback function to generate mock data when API fails
  const getMockFishingTypesData = () => {
    return {
      labels: ['Artesanal', 'Industrial', 'Esportivo', 'Subsistência'],
      datasets: [{
        label: 'Tipos de Pescadores',
        data: [65, 20, 10, 5],
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(75, 192, 192, 0.6)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
        ],
        borderWidth: 1
      }]
    };
  };

  // Buscar municípios ao montar o componente
  useEffect(() => {
    const loadMunicipalities = async () => {
      try {
        setLoading(true);
        const data = await fetchMunicipios();
        setMunicipalities(data);
        setLoading(false);
      } catch (err) {
        console.error("Erro ao buscar municípios:", err);
        setError("Falha ao carregar municípios");
        setLoading(false);
      }
    };

    loadMunicipalities();
  }, []);

  // Buscar comunidades quando o município selecionado mudar
  useEffect(() => {
    const loadCommunities = async () => {
      if (!selectedMunicipality) {
        setCommunities([]);
        return;
      }

      try {
        setLoading(true);
        const data = await fetchComunidadesByMunicipio(selectedMunicipality);
        setCommunities(data);
        setLoading(false);
      } catch (err) {
        console.error("Erro ao buscar comunidades:", err);
        setError("Falha ao carregar comunidades");
        setLoading(false);
      }
    };

    loadCommunities();
  }, [selectedMunicipality]);

  // Buscar dados detalhados para comunidades selecionadas
  const loadCommunityData = async () => {
    if (selectedCommunities.length === 0) {
      setCommunityData([]);
      setFishingTypesData([]);
      return;
    }

    try {
      setLoading(true);
      const promises = selectedCommunities.map(id => fetchCommunityDetails(id));
      const results = await Promise.all(promises);
      setCommunityData(results);

      try {
        // Try to get fishing types data
        const fishingTypeData = await axios.get(
          `${API_URL}/analytics/fishing_types/${selectedCommunities.join(',')}`
        );

        // Format the data for Chart.js
        const formattedData = {
          labels: Array.isArray(fishingTypeData.data) ? fishingTypeData.data.map(item => item.label || item.tipo) : [],
          datasets: [{
            label: 'Tipos de Pescadores',
            data: Array.isArray(fishingTypeData.data) ? fishingTypeData.data.map(item => item.value || item.quantidade) : [],
            backgroundColor: [
              'rgba(255, 99, 132, 0.6)',
              'rgba(54, 162, 235, 0.6)',
              'rgba(255, 206, 86, 0.6)',
              'rgba(75, 192, 192, 0.6)',
              'rgba(153, 102, 255, 0.6)',
            ],
            borderColor: [
              'rgba(255, 99, 132, 1)',
              'rgba(54, 162, 235, 1)',
              'rgba(255, 206, 86, 1)',
              'rgba(75, 192, 192, 1)',
              'rgba(153, 102, 255, 1)',
            ],
            borderWidth: 1
          }]
        };

        setFishingTypesData(formattedData);
      } catch (typesError) {
        console.warn("Could not fetch fishing types:", typesError);
        // Use mock data instead of failing
        setFishingTypesData(getMockFishingTypesData());
      }

      setLoading(false);
    } catch (err) {
      console.error("Erro ao buscar detalhes da comunidade:", err);
      const errorMessage = err.response?.data?.error || err.message;
      setError(`Falha ao carregar detalhes da comunidade: ${errorMessage}`);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCommunityData();
  }, [selectedCommunities]);

  // Add this check before attempting to render fishingTypesData
  useEffect(() => {
    if (fishingTypesData && !fishingTypesData.datasets) {
      try {
        // If it's an API response that doesn't match Chart.js format, transform it
        const formattedData = {
          labels: Array.isArray(fishingTypesData) ? fishingTypesData.map(item => item.label || item.tipo) : [],
          datasets: [{
            label: 'Tipos de Pescadores',
            data: Array.isArray(fishingTypesData) ? fishingTypesData.map(item => item.value || item.quantidade) : [],
            backgroundColor: [
              'rgba(255, 99, 132, 0.6)',
              'rgba(54, 162, 235, 0.6)',
              'rgba(255, 206, 86, 0.6)',
              'rgba(75, 192, 192, 0.6)',
              'rgba(153, 102, 255, 0.6)',
            ],
            borderColor: [
              'rgba(255, 99, 132, 1)',
              'rgba(54, 162, 235, 1)',
              'rgba(255, 206, 86, 1)',
              'rgba(75, 192, 192, 1)',
              'rgba(153, 102, 255, 1)',
            ],
            borderWidth: 1
          }]
        };
        setFishingTypesData(formattedData);
      } catch (err) {
        console.error("Error formatting fishing types data:", err);
        setFishingTypesData(getMockFishingTypesData());
      }
    } else if (!fishingTypesData || (fishingTypesData.datasets && fishingTypesData.datasets[0].data.length === 0)) {
      // If no data is available, use mock data
      setFishingTypesData(getMockFishingTypesData());
    }
  }, [fishingTypesData]);

  // Add this useEffect to your component
  useEffect(() => {
    // Clean up function
    return () => {
      // This will run when the component unmounts
      ChartJS.unregister(RadialLinearScale);
      ChartJS.register(RadialLinearScale);
    };
  }, []);

  // Add this useEffect to clean up charts
  useEffect(() => {
    return () => {
      // Safely clean up all chart instances when component unmounts
      try {
        if (ChartJS && ChartJS.instances) {
          Object.values(ChartJS.instances).forEach(chart => {
            if (chart && typeof chart.destroy === 'function') {
              chart.destroy();
            }
          });
        }

        // Re-register RadialLinearScale
        if (ChartJS) {
          ChartJS.unregister(RadialLinearScale);
          ChartJS.register(RadialLinearScale);
        }
      } catch (err) {
        console.warn("Error cleaning up charts:", err);
      }
    };
  }, []);

  // Replace the resize handler useEffect in CommunityComparison.js

  // Listen for window resize to ensure charts are responsive
  useEffect(() => {
    if (communityData.length === 0) return;

    const handleResize = () => {
      if (window._chartResizeTimer) {
        clearTimeout(window._chartResizeTimer);
      }

      window._chartResizeTimer = setTimeout(() => {
        try {
          if (!ChartJS || !ChartJS.instances) return;

          const validCharts = Object.values(ChartJS.instances).filter(chart =>
            chart && chart.canvas && document.body.contains(chart.canvas)
          );

          if (validCharts.length > 0) {
            // Use a single animation frame for all chart resizes
            window._chartResizeRaf = requestAnimationFrame(() => {
              validCharts.forEach(chart => {
                try {
                  if (chart.canvas && document.body.contains(chart.canvas)) {
                    chart.resize();
                  }
                } catch (err) {
                  // Silently ignore individual chart errors
                }
              });
            });
          }
        } catch (err) {
          // Silently ignore overall resize errors
        }
      }, 300); // Longer debounce time for better stability
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);

      // Clean up any pending operations
      if (window._chartResizeTimer) {
        clearTimeout(window._chartResizeTimer);
      }
      if (window._chartResizeRaf) {
        cancelAnimationFrame(window._chartResizeRaf);
      }
    };
  }, [communityData.length]);

  // Additional cleanup for Chart.js instances
  useEffect(() => {
    return () => {
      // This will run when the component unmounts
      try {
        if (ChartJS && ChartJS.instances) {
          // Get a static copy of instances to avoid modification during iteration
          const instances = Object.values(ChartJS.instances);

          // Destroy each chart instance
          instances.forEach(chart => {
            if (chart && typeof chart.destroy === 'function') {
              try {
                chart.destroy();
              } catch (err) {
                // Ignore errors
              }
            }
          });
        }

        // Refresh registration of special chart components
        if (ChartJS) {
          ChartJS.unregister(RadialLinearScale);
          ChartJS.unregister(ArcElement);

          // Re-register them
          ChartJS.register(RadialLinearScale);
          ChartJS.register(ArcElement);
        }
      } catch (err) {
        console.warn("Error cleaning up charts:", err);
      }
    };
  }, []);

  // Lidar com mudança na seleção de município
  const handleMunicipalityChange = (e) => {
    setSelectedMunicipality(e.target.value);
    setSelectedCommunities([]);
  };

  // Alternar seleção de comunidade
  const toggleCommunity = (communityId) => {
    if (selectedCommunities.includes(communityId)) {
      setSelectedCommunities(selectedCommunities.filter(id => id !== communityId));
    } else {
      // Limitar a 5 comunidades para melhor visualização
      if (selectedCommunities.length < 5) {
        setSelectedCommunities([...selectedCommunities, communityId]);
      } else {
        setError("Máximo de 5 comunidades podem ser comparadas de uma vez");
        setTimeout(() => setError(null), 3000);
      }
    }
  };

  // Update your chart options to handle responsive behavior better

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    resizeDelay: 100, // Add a small delay for smoother resizing
    plugins: {
      legend: {
        position: 'top',
        align: 'center',
        labels: {
          boxWidth: 12,
          padding: 15,
          font: function(context) {
            // Responsive font size based on chart width
            let width = context.chart.width;
            return {
              size: width < 400 ? 9 : (width < 600 ? 11 : 12),
              family: "'Nunito', sans-serif"
            };
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 30, 60, 0.85)',
        padding: 12,
        cornerRadius: 6,
        titleFont: { size: 14, weight: 'bold' },
        bodyFont: { size: 13 }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          font: function(context) {
            // Responsive font size for y-axis
            let width = context.chart.width;
            return {
              size: width < 400 ? 9 : (width < 600 ? 10 : 11),
              family: "'Nunito', sans-serif"
            };
          },
          padding: 8,
          callback: function(value) {
            return value.toLocaleString('pt-BR');
          },
          maxTicksLimit: 8 // Limit number of ticks for better responsiveness
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        }
      },
      x: {
        ticks: {
          font: function(context) {
            // Responsive font size for x-axis
            let width = context.chart.width;
            return {
              size: width < 400 ? 9 : (width < 600 ? 10 : 11),
              family: "'Nunito', sans-serif"
            };
          },
          maxRotation: 45,
          minRotation: 45,
          padding: 10,
          autoSkip: true,
          maxTicksLimit: 10 // Prevent crowding on small screens
        },
        grid: {
          display: false
        }
      }
    },
    layout: {
      padding: {
        top: 10,
        right: 10,
        bottom: 20,
        left: 10
      }
    },
    animation: false, // Disable animations for better stability
    onResize: null // Prevent built-in resize handler from running
  };

  const horizontalBarOptions = {
    ...chartOptions,
    indexAxis: 'y',
    scales: {
      ...chartOptions.scales,
      y: {
        ...chartOptions.scales.y,
        grid: {
          display: false
        }
      },
      x: {
        ...chartOptions.scales.x,
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        },
        ticks: {
          font: { size: 11 },
          maxRotation: 0,
          padding: 8
        }
      }
    }
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '60%',
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 20,
          boxWidth: 12,
          font: { size: 12 }
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.raw;
            const total = context.dataset.data.reduce((acc, val) => acc + val, 0);
            const percentage = Math.round((value / total) * 100);
            return `${label}: ${value} (${percentage}%)`;
          }
        }
      }
    },
    animation: false, // Disable animations for better stability
    onResize: null // Prevent built-in resize handler from running
  };

  // Preparar dados de comparação de população
  const populationData = {
    labels: communityData.map(c => c.nome),
    datasets: [
      {
        label: 'População Total',
        data: communityData.map(c => c.pessoas),
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
      },
      {
        label: 'Pescadores',
        data: communityData.map(c => c.pescadores),
        backgroundColor: 'rgba(255, 99, 132, 0.6)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 1,
      }
    ]
  };

  // Preparar dados de comparação de famílias
  const familiesData = {
    labels: communityData.map(c => c.nome),
    datasets: [
      {
        label: 'Famílias',
        data: communityData.map(c => c.familias),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      }
    ]
  };

  // Calcular percentual de pescadores para cada comunidade
  const percentageData = {
    labels: communityData.map(c => c.nome),
    datasets: [
      {
        label: 'Percentual de Pescadores (%)',
        data: communityData.map(c => ((c.pescadores / c.pessoas) * 100).toFixed(1)),
        backgroundColor: 'rgba(153, 102, 255, 0.6)',
        borderColor: 'rgba(153, 102, 255, 1)',
        borderWidth: 1,
      }
    ]
  };

  // Dados combinados de população e pescadores
  const combinedPopulationData = {
    labels: communityData.map(c => c.nome),
    datasets: [
      {
        label: 'População Total',
        data: communityData.map(c => c.pessoas),
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
      },
      {
        label: 'Pescadores',
        data: communityData.map(c => c.pescadores),
        backgroundColor: 'rgba(255, 99, 132, 0.6)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 1,
      }
    ]
  };

  // Dados de distribuição familiar
  const familyDistributionData = {
    labels: communityData.map(c => c.nome),
    datasets: [
      {
        label: 'Famílias',
        data: communityData.map(c => c.familias),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      }
    ]
  };

  // Normalização de dados para radar
  const normalize = (value, key) => {
    const maxValues = {
      pessoas: Math.max(...communityData.map(c => c.pessoas)),
      pescadores: Math.max(...communityData.map(c => c.pescadores)),
      familias: Math.max(...communityData.map(c => c.familias))
    };
    return (value / maxValues[key]) * 100;
  };

  // Update the colors array to match PESCARTE's palette
  const colors = [
    '0, 76, 153',  // PESCARTE blue
    '64, 160, 71', // PESCARTE green
    '245, 130, 32', // PESCARTE orange
    '117, 197, 240', // PESCARTE light blue
    '153, 102, 255'  // Purple (complementary)
  ];

  // Also update chart background colors
  const backgroundColors = [
    'rgba(0, 76, 153, 0.7)',   // PESCARTE blue
    'rgba(64, 160, 71, 0.7)',  // PESCARTE green
    'rgba(245, 130, 32, 0.7)', // PESCARTE orange
    'rgba(117, 197, 240, 0.7)', // PESCARTE light blue
    'rgba(153, 102, 255, 0.7)'  // Purple (complementary)
  ];

  const groupedBarOptions = {
    ...chartOptions,
    scales: {
      x: {
        stacked: true,
      },
      y: {
        stacked: true,
      },
    },
    animation: false, // Disable animations for better stability
    onResize: null // Prevent built-in resize handler from running
  };

  // Add these chart data variables before your return statement
  const ageChartData = demographicData.age.length > 0
    ? processAgeData(demographicData.age)
    : { labels: [], datasets: [] };

  const incomeChartData = demographicData.income.length > 0
    ? processIncomeData(demographicData.income)
    : { labels: [], datasets: [] };

  const educationChartData = demographicData.education.length > 0
    ? processEducationData(demographicData.education)
    : { labels: [], datasets: [] };

  const generateComparisonReport = () => {
    // Logic to generate and download the report
    console.log("Generating report...");
  };

  const resetSelection = () => {
    setSelectedMunicipality('');
    setSelectedCommunities([]);
    setCommunityData([]);
    setFishingTypesData([]);
  };

  // Add better error handling to the component
  const ErrorMessage = ({ message, onRetry }) => (
    <div className="error-message">
      <div className="error-icon">⚠️</div>
      <p>{message}</p>
      {onRetry && (
        <button className="retry-button" onClick={onRetry}>
          Tentar novamente
        </button>
      )}
    </div>
  );

  if (loading && municipalities.length === 0) {
    return <div className="loading">Carregando municípios...</div>;
  }

  return (
    <div className="comparison-container">
      <h1>Comparar Comunidades</h1>

      {error && (
        <ErrorMessage
          message={error}
          onRetry={() => {
            setError(null);
            loadCommunityData();
          }}
        />
      )}

      <div className="comparison-section">
        <div className="municipality-selector">
          <div className="selector-header">
            <div className="step-indicator">1</div>
            <h3>Selecionar Município</h3>
          </div>

          <div className="selector-description">
            Escolha um município para visualizar suas comunidades disponíveis para comparação.
          </div>

          <div className="selector-wrapper">
            <select
              value={selectedMunicipality}
              onChange={handleMunicipalityChange}
              className="municipality-select"
            >
              <option value="">Selecione um município</option>
              {municipalities.map(municipality => (
                <option key={municipality.id} value={municipality.id}>
                  {municipality.nome}
                </option>
              ))}
            </select>
          </div>
        </div>

        {selectedMunicipality && (
          <div className="communities-selector">
            <div className="step-heading">
              <span className="number-badge">2</span>
              <span className="step-text">Selecionar Comunidades para Comparar</span>
              <span className="max-count">máximo 5</span>
            </div>

            <p className="selector-description">
              Selecione até 5 comunidades para comparar dados demográficos e estatísticas de pesca.
            </p>

            {loading && communities.length === 0 ? (
              <div className="loading-indicator">
                <div className="spinner"></div>
                <span>Carregando comunidades...</span>
              </div>
            ) : communities.length > 0 ? (
              <div className="communities-grid">
                {communities.map(community => (
                  <div
                    key={community.id}
                    className={`community-card ${selectedCommunities.includes(community.id) ? 'selected' : ''}`}
                    onClick={() => toggleCommunity(community.id)}
                  >
                    <div className="community-info">
                      <div className="community-name">
                        <div className="community-checkbox">
                          <input
                            type="checkbox"
                            checked={selectedCommunities.includes(community.id)}
                            onChange={() => toggleCommunity(community.id)}
                            id={`community-${community.id}`}
                          />
                        </div>
                        {community.nome}
                      </div>
                      <div className="community-stats">
                        <div className="community-stat">
                          <span className="icon">👥</span> {community.pessoas || 0} pessoas
                        </div>
                        <div className="community-stat">
                          <span className="icon">🎣</span> {community.pescadores || 0} pescadores
                        </div>
                        <div className="community-stat">
                          <span className="icon">📊</span> {((community.pescadores / community.pessoas) * 100).toFixed(1)}% de pescadores
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-icon">📁</div>
                <p>Nenhuma comunidade encontrada para este município</p>
              </div>
            )}
          </div>
        )}
      </div>

      {communityData.length > 0 && (
        <div className="comparison-results">
          <div className="comparison-results-header">
            <h2>Resultados da Comparação</h2>
          </div>

          <div className="comparison-charts-grid">
            {/* Population and Fishermen Chart - Full Width */}
            <div className="chart-grid-item full-width">
              <ChartContainer title="População e Pescadores" isLoading={loading}>
                {combinedPopulationData?.datasets?.length > 0 && (
                  <Bar
                    key={`pop-${selectedCommunities.join('-')}-${Date.now()}`} // Use Date.now() for unique key
                    data={combinedPopulationData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      animation: false,
                      onResize: null,
                      plugins: {
                        legend: {
                          position: 'top',
                          labels: {
                            boxWidth: 12,
                            padding: 15,
                            font: { size: 12 } // Static font size
                          }
                        },
                        tooltip: {
                          backgroundColor: 'rgba(0, 30, 60, 0.85)',
                          padding: 12,
                          cornerRadius: 6
                        }
                      },
                      scales: {
                        y: {
                          beginAtZero: true,
                          ticks: {
                            font: { size: 11 }, // Static font size
                            callback: function(value) {
                              return value.toLocaleString('pt-BR');
                            }
                          },
                          grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                          }
                        },
                        x: {
                          ticks: {
                            font: { size: 11 }, // Static font size
                            maxRotation: 45,
                            minRotation: 45
                          },
                          grid: {
                            display: false
                          }
                        }
                      }
                    }}
                  />
                )}
              </ChartContainer>
            </div>

            {/* Fishermen Percentage Chart */}
            <div className="chart-grid-item">
              <ChartContainer title="Percentual de Pescadores" isLoading={loading}>
                {percentageData?.datasets?.length > 0 && (
                  <Bar
                    key={`perc-${selectedCommunities.join('-')}`}
                    data={percentageData}
                    options={horizontalBarOptions}
                  />
                )}
              </ChartContainer>
            </div>

            {/* Family Distribution Chart */}
            <div className="chart-grid-item">
              <ChartContainer title="Distribuição Familiar" isLoading={loading}>
                {familyDistributionData?.datasets?.length > 0 && (
                  <Bar
                    key={`family-${selectedCommunities.join('-')}`}
                    data={familyDistributionData}
                    options={chartOptions}
                  />
                )}
              </ChartContainer>
            </div>

            {/* Fishing Types Chart */}
            {fishingTypesData?.datasets?.length > 0 && fishingTypesData.datasets[0]?.data?.length > 0 && (
              <div className="chart-grid-item full-width">
                <ChartContainer title="Tipos de Pescadores" isLoading={loading}>
                  <Doughnut
                    key={`doughnut-${selectedCommunities.join('-')}`}
                    data={fishingTypesData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      cutout: '60%',
                      plugins: {
                        legend: {
                          position: 'bottom',
                          labels: {
                            padding: 20,
                            boxWidth: 12,
                            font: { size: 12 }
                          }
                        },
                        tooltip: {
                          callbacks: {
                            label: function(context) {
                              const label = context.label || '';
                              const value = context.raw;
                              const total = context.dataset.data.reduce((acc, val) => acc + val, 0);
                              const percentage = Math.round((value / total) * 100);
                              return `${label}: ${value} (${percentage}%)`;
                            }
                          }
                        }
                      },
                      animation: false, // Disable animations
                      onResize: null // Remove problematic resize handler
                    }}
                  />
                </ChartContainer>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CommunityComparison;
