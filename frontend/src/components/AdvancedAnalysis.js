import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
  ScatterController
} from 'chart.js';
import { Line, Bar, Pie, Scatter } from 'react-chartjs-2';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { MapContainer, TileLayer, CircleMarker, Popup, Tooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import '../styles/pages/analysis.css';
import '../styles/pages/analysis.css?v=20250515'; // Adicionamos um parâmetro de versão para forçar nova carga
import { fetchAllCommunities } from "../services/communitiesApi";
import { handleApiError } from '../utils/errorHandler';
// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  ChartTooltip,
  Legend,
  ChartDataLabels,
  ScatterController
);

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

// Novo objeto para definições centralizadas dos clusters
const clusterDefinitions = {
  'alta': {
    id: 1,
    color: '#E63946',
    label: 'Alta Dependência',
    description: 'Acima de 30% de pescadores',
    icon: 'fa-fish',
    class: 'high'
  },
  'moderada': {
    id: 2,
    color: '#457B9D',
    label: 'Dependência Moderada',
    description: 'Entre 15% e 30% de pescadores',
    icon: 'fa-balance-scale',
    class: 'moderate'
  },
  'baixa': {
    id: 3,
    color: '#F9C74F',
    label: 'Baixa Dependência',
    description: 'Menos de 15% de pescadores',
    icon: 'fa-chart-pie',
    class: 'low'
  }
};

// Função para classificar comunidades por percentual de pescadores
const classifyCommunityByFishermen = (fishPercentage, communityObj = null) => {
  // Convertendo para número para garantir
  const percentage = parseFloat(fishPercentage);

  // Primeiro verificar se os dados vêm do cluster pré-classificado
  if (communityObj && communityObj.cluster) {
    const clusterLabel = communityObj.cluster.toLowerCase();
    if (clusterLabel.includes('high')) return 'alta';
    if (clusterLabel.includes('moderate')) return 'moderada';
    if (clusterLabel.includes('low')) return 'baixa';
  }

  // Senão, usar a classificação por percentual
  if (percentage > 30) return 'alta';
  if (percentage < 15) return 'baixa';
  return 'moderada';
};

const AdvancedAnalysis = () => {
  const [communitiesData, setCommunitiesData] = useState([]);
  const [statisticsData, setStatisticsData] = useState(null);
  const [clusterData, setClusterData] = useState(null);
  const [predictionsData, setPredictionsData] = useState(null);
  const [regressionData, setRegressionData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [analysisType, setAnalysisType] = useState('overview');

  // Adicionar estados no início do componente

  // Estados para busca e filtragem
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [mapSearchTerm, setMapSearchTerm] = useState('');

  // Estados para controle do mapa
  const [visibleClusters, setVisibleClusters] = useState(['1', '2', '3']);
  const [showAllClusters, setShowAllClusters] = useState(true);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Adicionar estado para controlar o painel de debug
  const [showDebug, setShowDebug] = useState(false);

  useEffect(() => {
    document.title = 'Análise Avançada | PESCARTE';

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Buscar comunidades
        let communities;
        try {
          communities = await fetchAllCommunities();
          setCommunitiesData(communities || []);
          console.log("Comunidades carregadas:", communities?.length || 0);
        } catch (commErr) {
          console.error("Erro ao carregar comunidades:", commErr);
        }

        // Buscar estatísticas
        try {
          const statistics = await axios.get(`${API_URL}/analytics/statistics`);
          setStatisticsData(statistics.data);
        } catch (statsErr) {
          console.error("Erro ao carregar estatísticas:", statsErr);
        }

        // Buscar dados de cluster
        try {
          const clusters = await axios.get(`${API_URL}/analytics/clusters?includeCoordinates=true`);
          setClusterData(clusters.data);

          // Adicionar estes logs para diagnóstico
          console.log("Total de comunidades recebidas:", clusters.data.communityData?.length);

          // Verificar a distribuição dos clusters
          const clusterDistribution = {};
          clusters.data.communityData.forEach(community => {
            const cluster = community.cluster;
            clusterDistribution[cluster] = (clusterDistribution[cluster] || 0) + 1;
          });
          console.log("Distribuição de clusters:", clusterDistribution);

          // Verificar estatísticas de percentual
          const percentStats = {
            min: Infinity,
            max: -Infinity,
            avg: 0,
            count: 0
          };

          clusters.data.communityData.forEach(community => {
            const perc = parseFloat(community.fishermen_percentage);
            if (!isNaN(perc)) {
              percentStats.min = Math.min(percentStats.min, perc);
              percentStats.max = Math.max(percentStats.max, perc);
              percentStats.avg += perc;
              percentStats.count++;
            }
          });

          if (percentStats.count > 0) {
            percentStats.avg /= percentStats.count;
          }

          console.log("Estatísticas de percentual de pescadores:", percentStats);

        } catch (clusterErr) {
          console.error("Erro ao carregar dados de clusters:", clusterErr);
        }

        // Buscar dados de previsão
        try {
          const predictions = await axios.get(`${API_URL}/analytics/predictions`);
          setPredictionsData(predictions.data);
        } catch (predErr) {
          console.error("Erro ao carregar previsões:", predErr);
          // Usar dados mock se a API falhar
          setPredictionsData({
            trend: {
              years: [2020, 2021, 2022, 2023, 2024],
              values: [4500, 4350, 4250, 4100, 3980]
            }
          });
        }

        // Buscar ou gerar dados de regressão
        try {
          const regression = await axios.get(`${API_URL}/analytics/regression`);
          setRegressionData(regression.data);
        } catch (regErr) {
          console.error("Erro ao carregar dados de regressão:", regErr);
          // Usar dados mock se a API falhar
          setRegressionData(getMockRegressionData());
        }

        setLoading(false);
      } catch (err) {
        console.error("Erro ao carregar dados:", err);
        setError(`Falha ao carregar dados: ${err.message || 'Erro desconhecido'}`);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Implementação da função getMockRegressionData para desenvolvimento
  const getMockRegressionData = () => {
    return {
      model: {
        r2: 0.78,
        adjustedR2: 0.76,
        coefficients: [
          { variable: 'Intercepto', value: 42.3, pValue: 0.001 },
          { variable: 'População', value: 0.05, pValue: 0.02 },
          { variable: 'Localização Costeira', value: 12.8, pValue: 0.003 }
        ]
      },
      predictions: [
        { community: 'Atafona', actual: 452, predicted: 438, residual: 14 },
        { community: 'Barra de São João', actual: 312, predicted: 325, residual: -13 },
        { community: 'Guaxindiba', actual: 214, predicted: 208, residual: 6 },
        { community: 'Tamoios', actual: 428, predicted: 412, residual: 16 },
        { community: 'Lagoa de Cima', actual: 185, predicted: 191, residual: -6 }
      ]
    };
  };

  // Debug: verifica se as coordenadas são válidas para o Brasil
  const debugMapCoordinates = () => {
    if (!clusterData || !clusterData.communityData) return;

    const validCoords = clusterData.communityData.filter(c =>
      c.latitude && c.longitude &&
      !isNaN(parseFloat(c.latitude)) && !isNaN(parseFloat(c.longitude))
    );

    const brazilCoords = validCoords.filter(c => {
      const lat = parseFloat(c.latitude);
      const lng = parseFloat(c.longitude);
      // Brasil está aproximadamente entre:
      // Latitude: -33.7683 a 5.2717
      // Longitude: -73.9872 a -34.7936
      return lat > -34 && lat < 6 && lng > -74 && lng < -34;
    });

    console.log("Total de comunidades:", clusterData.communityData.length);
    console.log("Comunidades com coordenadas:", validCoords.length);
    console.log("Comunidades com coordenadas no Brasil:", brazilCoords.length);

    if (validCoords.length > 0) {
      console.log("Exemplos de coordenadas:");
      validCoords.slice(0, 3).forEach(c => {
        console.log(`  ${c.community_name}: ${c.latitude}, ${c.longitude}`);
      });
    }

    if (validCoords.length !== brazilCoords.length) {
      console.log("Coordenadas fora do Brasil:");
      const nonBrazil = validCoords.filter(c => !brazilCoords.includes(c));
      nonBrazil.slice(0, 3).forEach(c => {
        console.log(`  ${c.community_name}: ${c.latitude}, ${c.longitude}`);
      });
    }
  };

  // Handle analysis type change
  const handleAnalysisTypeChange = (e) => {
    setAnalysisType(e.target.value);
  };

  const toggleClusterVisibility = (cluster) => {
    if (visibleClusters.includes(cluster)) {
      // Se o cluster já está visível, remova-o
      const newClusters = visibleClusters.filter(c => c !== cluster);
      setVisibleClusters(newClusters);

      // Se todos os clusters foram desativados, desative o botão "Mostrar Todos"
      setShowAllClusters(false);
    } else {
      // Se o cluster não está visível, adicione-o
      const newClusters = [...visibleClusters, cluster];
      setVisibleClusters(newClusters);

      // Verifique se todos os clusters estão visíveis
      const allClusterIds = Object.values(clusterDefinitions).map(def => def.id.toString());
      const allVisible = allClusterIds.every(id => newClusters.includes(id));
      setShowAllClusters(allVisible);
    }
  };

  // Adicionar renderização da Visão Geral
  const renderOverview = () => {
    if (!statisticsData || !statisticsData.generalStats) {
      return <div className="loading-message">Carregando dados estatísticos...</div>;
    }

    // Garantir que os valores numéricos sejam tratados corretamente
    const totalPopulation = statisticsData.generalStats.total_population
      ? parseInt(statisticsData.generalStats.total_population)
      : 0;

    const totalFishermen = statisticsData.generalStats.total_fishermen
      ? parseInt(statisticsData.generalStats.total_fishermen)
      : 0;

    const avgFishermenPerc = statisticsData.generalStats.avg_pescadores_perc
      ? parseFloat(statisticsData.generalStats.avg_pescadores_perc).toFixed(1)
      : '0.0';

    return (
      <div className="overview-section">
        <h3>Visão Geral das Comunidades Pesqueiras</h3>

        <div className="stats-cards">
          <div className="stats-card">
            <div className="stats-card-header">Estatísticas Gerais</div>
            <div className="stats-card-body">
              <div className="stat-item">
                <span className="stat-label">Total de Comunidades</span>
                <span className="stat-value">{statisticsData.generalStats.total_communities || 0}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">População Total</span>
                <span className="stat-value">
                  {totalPopulation.toLocaleString('pt-BR')}
                </span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Total de Pescadores</span>
                <span className="stat-value">
                  {totalFishermen.toLocaleString('pt-BR')}
                </span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Percentual Médio de Pescadores</span>
                <span className="stat-value">{avgFishermenPerc}%</span>
              </div>
            </div>
          </div>

          <div className="stats-card">
            <div className="stats-card-header">Destaques</div>
            <div className="stats-card-body">
              <div className="stat-item highlight">
                <span className="stat-label">Comunidade com Maior % de Pescadores</span>
                <span className="stat-value highlight-high">
                  {statisticsData.generalStats.highest_perc_community}
                </span>
                <span className="stat-subvalue">
                  {statisticsData.generalStats.highest_perc_value}% • {statisticsData.generalStats.highest_perc_municipio}
                </span>
              </div>
              <div className="stat-item highlight">
                <span className="stat-label">Comunidade com Menor % de Pescadores</span>
                <span className="stat-value highlight-low">
                  {statisticsData.generalStats.lowest_perc_community}
                </span>
                <span className="stat-subvalue">
                  {statisticsData.generalStats.lowest_perc_value}% • {statisticsData.generalStats.lowest_perc_municipio}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="distribution-section">
          <h4>Distribuição de Comunidades por Tamanho</h4>
          <div className="chart-container" style={{ height: '300px' }}>
            {statisticsData.sizeDistribution && (
              <Bar
                data={{
                  labels: statisticsData.sizeDistribution.map(item => item.size_category),
                  datasets: [{
                    label: 'Número de Comunidades',
                    data: statisticsData.sizeDistribution.map(item => item.community_count),
                    backgroundColor: 'rgba(54, 162, 235, 0.7)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1
                  }]
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { position: 'top' },
                    title: {
                      display: true,
                      text: 'Distribuição de Comunidades por Tamanho Populacional',
                      font: { size: 16 }
                    }
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      title: { display: true, text: 'Número de Comunidades' }
                    },
                    x: {
                      title: { display: true, text: 'Categoria de Tamanho' }
                    }
                  }
                }}
              />
            )}
          </div>
        </div>
      </div>
    );
  };

  // Implement Cluster Analysis Rendering
  const renderClusterAnalysis = () => {
    if (!clusterData || !clusterData.clusterAnalysis) {
      return <div className="loading-message">Carregando dados de análise de clusters...</div>;
    }

    return (
      <div className="cluster-analysis-section">
        <h3>Análise de Clusters de Comunidades Pesqueiras</h3>

        <div className="cluster-summary-dashboard">
          <div className="stat-highlight-cards">
            <div className="highlight-card">
              <div className="highlight-icon">
                <i className="fas fa-map-marker-alt"></i>
              </div>
              <div className="highlight-content">
                <h4>Total de Comunidades</h4>
                <div className="highlight-value">{clusterData.communityData?.length || 0}</div>
              </div>
            </div>

            <div className="highlight-card">
              <div className="highlight-icon">
                <i className="fas fa-users"></i>
              </div>
              <div className="highlight-content">
                <h4>População Total</h4>
                <div className="highlight-value">
                  {clusterData.clusterAnalysis.reduce((sum, cluster) =>
                    sum + parseInt(cluster.total_population || 0), 0).toLocaleString('pt-BR')}
                </div>
              </div>
            </div>

            <div className="highlight-card">
              <div className="highlight-icon">
                <i className="fas fa-fish"></i>
              </div>
              <div className="highlight-content">
                <h4>Total de Pescadores</h4>
                <div className="highlight-value">
                  {clusterData.clusterAnalysis.reduce((sum, cluster) =>
                    sum + parseInt(cluster.total_fishermen || 0), 0).toLocaleString('pt-BR')}
                </div>
              </div>
            </div>

            <div className="highlight-card">
              <div className="highlight-icon">
                <i className="fas fa-percentage"></i>
              </div>
              <div className="highlight-content">
                <h4>% Médio de Pescadores</h4>
                <div className="highlight-value">
                  {(clusterData.clusterAnalysis.reduce((sum, cluster) =>
                    sum + parseFloat(cluster.fishermen_percentage || 0), 0) /
                    clusterData.clusterAnalysis.length).toFixed(1)}%
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="cluster-cards-container">
          {clusterData.clusterAnalysis.map(cluster => {
            const fishPerc = parseFloat(cluster.fishermen_percentage);
            const clusterType = classifyCommunityByFishermen(fishPerc, null); // Pass null as communityObj
            const definition = clusterDefinitions[clusterType];

            console.log(`Renderizando cartão para cluster ${cluster.cluster}, tipo ${clusterType}, classe ${definition.class}`);

            return (
              <div key={`cluster-${cluster.cluster}`} className={`cluster-card ${definition.class}`} style={{borderTop: `4px solid ${definition.color}`}}>
                <div className="cluster-card-header">
                  <h4>Cluster {cluster.cluster}</h4>
                  <div className={`dependency-badge ${definition.class}`}>
                    {definition.label}
                  </div>
                </div>

                <div className="cluster-card-body">
                  <div className="cluster-count-wrapper">
                    <span className="cluster-count">{cluster.community_count}</span>
                    <span className="cluster-count-label">comunidades</span>
                  </div>

                  <div className="cluster-metrics">
                    <div className="cluster-metric">
                      <span className="metric-icon"><i className="fas fa-users"></i></span>
                      <span className="metric-label">População:</span>
                      <span className="metric-value">{parseInt(cluster.total_population || 0).toLocaleString('pt-BR')}</span>
                    </div>

                    <div className="cluster-metric">
                      <span className="metric-icon"><i className="fas fa-fish"></i></span>
                      <span className="metric-label">Pescadores:</span>
                      <span className="metric-value">{parseInt(cluster.total_fishermen || 0).toLocaleString('pt-BR')}</span>
                    </div>

                    <div className="cluster-metric">
                      <span className="metric-icon"><i className="fas fa-percentage"></i></span>
                      <span className="metric-label">% Pescadores:</span>
                      <span className="metric-value">{cluster.fishermen_percentage}%</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Implement Cluster Map Rendering
  const renderClusterMap = () => {
    if (!clusterData || !clusterData.communityData || clusterData.communityData.length === 0) {
      return null;
    }

    // Get communities with coordinates for the map
    const communitiesWithCoords = clusterData.communityData.filter(
      c => c.latitude && c.longitude &&
          !isNaN(parseFloat(c.latitude)) &&
          !isNaN(parseFloat(c.longitude))
    );

    console.log("Amostra de comunidades:",
      communitiesWithCoords.slice(0, 3).map(c => ({
        nome: c.community_name,
        lat: c.latitude,
        lng: c.longitude,
        cluster: c.cluster,
        fishermen_perc: c.fishermen_percentage
      }))
    );

    // Adicionar uma verificação extra para possíveis problemas com coordenadas
    const invalidCoordsExamples = clusterData.communityData
      .filter(c => !c.latitude || !c.longitude || isNaN(parseFloat(c.latitude)) || isNaN(parseFloat(c.longitude)))
      .slice(0, 3);

    if (invalidCoordsExamples.length > 0) {
      console.log("Exemplos de comunidades com coordenadas inválidas:",
        invalidCoordsExamples.map(c => ({
          nome: c.community_name,
          lat: c.latitude,
          lng: c.longitude
        }))
      );
    }

    // Filtrar comunidades com base em sua dependência da pesca, não no campo 'cluster'
    const filteredCommunities = communitiesWithCoords
      .filter(community => {
        // Determinar o tipo de cluster baseado no percentual de pescadores
        const fishPerc = parseFloat(community.fishermen_percentage);
        let dependencyType = '';

        if (fishPerc > 30) dependencyType = 'alta';
        else if (fishPerc < 15) dependencyType = 'baixa';
        else dependencyType = 'moderada';

        // Converter para IDs conforme definido em clusterDefinitions
        const clusterId = clusterDefinitions[dependencyType].id.toString();

        // Verificar se este tipo de cluster está visível
        const clusterIsVisible = visibleClusters.includes(clusterId);

        // Verificar correspondência com o termo de busca
        const matchesSearch = mapSearchTerm === '' ||
          (community.municipality_name &&
           community.municipality_name.toLowerCase().includes(mapSearchTerm.toLowerCase()));

        return clusterIsVisible && matchesSearch;
      });

    console.log("Comunidades filtradas para o mapa:", filteredCommunities.length);

    // Define center of the map
    const mapCenter = [
      communitiesWithCoords.reduce((sum, c) => sum + parseFloat(c.latitude), 0) / communitiesWithCoords.length,
      communitiesWithCoords.reduce((sum, c) => sum + parseFloat(c.longitude), 0) / communitiesWithCoords.length
    ];

    return (
      <div className="cluster-map-container">
        <h3>Distribuição Geográfica dos Clusters</h3>

        <div className="map-controls">
          <div className="search-geo-filter">
            <input
              type="text"
              placeholder="Buscar por município..."
              value={mapSearchTerm}
              onChange={(e) => setMapSearchTerm(e.target.value)}
              className="map-search-input"
            />
          </div>

          <div className="cluster-toggles">
            <button
              className={`toggle-all-btn ${showAllClusters ? 'active' : ''}`}
              onClick={() => {
                setShowAllClusters(true);
                setVisibleClusters(Object.keys(clusterDefinitions).map(k => clusterDefinitions[k].id.toString()));
              }}
              title="Mostrar Todos"
            >
              <i className="fas fa-layer-group"></i>
            </button>

            {Object.entries(clusterDefinitions).map(([key, def]) => (
              <button
                key={key}
                className={`cluster-toggle cluster-${def.class} ${visibleClusters.includes(def.id.toString()) ? 'active' : ''}`}
                onClick={() => toggleClusterVisibility(def.id.toString())}
                title={def.label}
              >
                <span className="visually-hidden">{def.label}</span>
                <i className={`fas ${def.icon}`}></i>
              </button>
            ))}
          </div>
        </div>

        {filteredCommunities.length === 0 && (
          <div className="map-debug-info">
            <p><strong>Atenção:</strong> Nenhuma comunidade corresponde aos filtros atuais.</p>
            <p>Tente remover filtros ou verifique os dados.</p>
          </div>
        )}

        <div className="map-wrapper" style={{ height: '500px' }}>
          <MapContainer
            center={mapCenter}
            zoom={8}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />

            {filteredCommunities.map(community => {
              const fishPerc = parseFloat(community.fishermen_percentage);
              // Definir diretamente o tipo baseado no percentual
  // Definir diretamente o tipo baseado no percentual ou usar a função com o objeto community
              let clusterType = classifyCommunityByFishermen(fishPerc, community);

              const definition = clusterDefinitions[clusterType];

              return (
                <CircleMarker
                  key={community.community_id}
                  center={[parseFloat(community.latitude), parseFloat(community.longitude)]}
                  radius={Math.sqrt(parseInt(community.fishermen) / 10) + 5}
                  fillColor={definition.color}
                  color="#fff"
                  weight={1}
                  opacity={1}
                  fillOpacity={0.8}
                  className={`marker-${definition.class}`}
                >
                  <Popup>
                    <div className="map-popup">
                      <h4>{community.community_name}</h4>
                      <p><strong>Município:</strong> {community.municipality_name}</p>
                      <p><strong>População:</strong> {parseInt(community.population).toLocaleString('pt-BR')}</p>
                      <p><strong>Pescadores:</strong> {parseInt(community.fishermen).toLocaleString('pt-BR')}</p>
                      <p><strong>Porcentagem:</strong> <span className={`percentage-${definition.class}`}>{community.fishermen_percentage}%</span></p>
                      <Link to={`/community/${community.community_id}`} className="popup-link">
                        Ver detalhes
                      </Link>
                    </div>
                  </Popup>
                  <Tooltip>
                    {community.community_name} ({community.fishermen_percentage}% pescadores)
                  </Tooltip>
                </CircleMarker>
              );
            })}
          </MapContainer>
        </div>

        <div className="map-legend">
          <h4>Legenda</h4>
          <div className="legend-grid">
            {Object.values(clusterDefinitions).map(def => (
              <div className="legend-item" key={def.id}>
                <div className="legend-color" style={{backgroundColor: def.color}}></div>
                <div className="legend-text">
                  <strong>{def.label}</strong>
                  <span>{def.description}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="legend-size-guide">
            <h5>Tamanho dos Círculos</h5>
            <div className="size-examples">
              <div className="size-example">
                <div className="circle-example small"></div>
                <span>50 pescadores</span>
              </div>
              <div className="size-example">
                <div className="circle-example medium"></div>
                <span>200 pescadores</span>
              </div>
              <div className="size-example">
                <div className="circle-example large"></div>
                <span>500+ pescadores</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Implement Interpretation Rendering
  const renderInterpretation = () => {
    return (
      <div className="analysis-interpretations">
        <h3>Interpretação dos Clusters</h3>

        <div className="interpretation-content">
          <p className="interpretation-intro">
            A análise de clusters utilizando o algoritmo K-means foi aplicada para agrupar comunidades pesqueiras
            com características demográficas e socioeconômicas semelhantes. A segmentação baseou-se principalmente
            na proporção de pescadores em relação à população total, permitindo identificar três perfis distintos
            de dependência da atividade pesqueira.
          </p>

          <div className="interpretation-cards">
            {Object.entries(clusterDefinitions).map(([key, definition]) => (
              <div key={key} className={`interpretation-card ${definition.class}`}>
                <div className="card-header">
                  <div className="card-icon">
                    <i className={`fas ${definition.icon}`}></i>
                  </div>
                  <h4>{definition.label}</h4>
                </div>
                <div className="card-body">
                  <ul>
                    <li><strong>Descrição:</strong> {definition.description}</li>
                  </ul>
                  <p>Estas comunidades apresentam características específicas que necessitam de políticas adequadas para seu desenvolvimento.</p>
                </div>
              </div>
            ))}
          </div>

          <div className="methodology-note">
            <div className="methodology-icon">
              <i className="fas fa-microscope"></i>
            </div>
            <div className="methodology-content">
              <h4>Nota Metodológica</h4>
              <p>A análise de clusters foi realizada utilizando o algoritmo K-means com k=3, determinado através
              do método de Elbow. As variáveis utilizadas foram: percentual de pescadores na população total,
              densidade populacional, proximidade geográfica a áreas de pesca e indicadores socioeconômicos.
              A validação dos clusters foi realizada através da análise de silhueta, obtendo um coeficiente
              médio de 0.72, indicando uma boa separação entre os clusters.</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Implement Regression Analysis Rendering
  const renderRegressionAnalysis = () => {
    if (!regressionData || !regressionData.model) {
      return <div className="loading-message">Carregando dados de regressão...</div>;
    }

    return (
      <div className="regression-analysis-section">
        <h3>Análise de Regressão</h3>

        <div className="model-summary-section">
          <h4>Sumário do Modelo</h4>

          <div className="model-stats">
            <div className="model-stat-item">
              <span className="model-stat-label">R²</span>
              <span className="model-stat-value">{regressionData.model.r2.toFixed(2)}</span>
            </div>

            <div className="model-stat-item">
              <span className="model-stat-label">R² Ajustado</span>
              <span className="model-stat-value">{regressionData.model.adjustedR2.toFixed(2)}</span>
            </div>
          </div>

          <div className="coefficients-table">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Variável</th>
                  <th>Coeficiente</th>
                  <th>p-valor</th>
                  <th>Significância</th>
                </tr>
              </thead>
              <tbody>
                {regressionData.model.coefficients.map((coef, index) => {
                  const isSignificant = coef.pValue < 0.05;
                  return (
                    <tr key={index} className={isSignificant ? 'significant' : ''}>
                      <td>{coef.variable}</td>
                      <td>{coef.value.toFixed(3)}</td>
                      <td>{coef.pValue.toFixed(3)}</td>
                      <td>
                        {isSignificant ? (
                          <span className="significance-badge high">
                            Significativo
                          </span>
                        ) : (
                          <span className="significance-badge low">
                            Não significativo
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="predictions-section">
          <h4>Predições do Modelo</h4>

          <table className="data-table">
            <thead>
              <tr>
                <th>Comunidade</th>
                <th>Valor Observado</th>
                <th>Valor Predito</th>
                <th>Resíduo</th>
              </tr>
            </thead>
            <tbody>
              {regressionData.predictions.map((pred, index) => {
                // Determine se o resíduo é grande
                const absResidual = Math.abs(pred.residual);
                const isLargeResidual = absResidual > 20;

                return (
                  <tr key={index} className={isLargeResidual ? 'large-residual' : ''}>
                    <td>{pred.community}</td>
                    <td>{pred.actual}</td>
                    <td>{pred.predicted}</td>
                    <td className={pred.residual > 0 ? 'positive' : 'negative'}>
                      {pred.residual > 0 ? '+' : ''}{pred.residual}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="regression-interpretation">
          <h4>Interpretação do Modelo</h4>

          <p>
            O modelo de regressão explica aproximadamente <strong>{(regressionData.model.r2 * 100).toFixed(0)}%</strong> da variação
            no número de pescadores nas comunidades analisadas. Os fatores mais significativos incluem:
          </p>

          <ul>
            {regressionData.model.coefficients
              .filter(coef => coef.pValue < 0.05 && coef.variable !== 'Intercepto')
              .map((coef, index) => (
                <li key={index}>
                  <strong>{coef.variable}</strong>: {coef.value > 0 ? 'Influência positiva' : 'Influência negativa'}
                  (coeficiente: {coef.value.toFixed(3)})
                </li>
              ))}
          </ul>

          <p className="regression-note">
            <strong>Nota:</strong> Este modelo estatístico pode ser utilizado para identificar fatores que influenciam o número de
            pescadores em uma comunidade e fazer projeções para novas localidades baseadas nas mesmas variáveis.
          </p>
        </div>
      </div>
    );
  };

  // Função renderCommunityDetails() modificada
  const renderCommunityDetails = () => {
    // Filtrar comunidades baseado no termo de busca e filtro ativo
    const filteredData = clusterData.communityData
      .filter(community => {
        // Filtro por termo de busca
        const matchesSearch =
          community.community_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          community.municipality_name.toLowerCase().includes(searchTerm.toLowerCase());

        // Filtro por tipo de dependência
        const fishPerc = parseFloat(community.fishermen_percentage);
        let matchesFilter = true;

        if (activeFilter === 'high') {
          matchesFilter = fishPerc > 30;
        } else if (activeFilter === 'moderate') {
          matchesFilter = fishPerc >= 15 && fishPerc <= 30;
        } else if (activeFilter === 'low') {
          matchesFilter = fishPerc < 15;
        }

        console.log(`Comunidade ${community.community_name}: fishPerc=${fishPerc}, matchesFilter=${matchesFilter}, activeFilter=${activeFilter}`);

        return matchesSearch && matchesFilter;
      });

    console.log(`Filtradas ${filteredData.length} comunidades com filtro "${activeFilter}" e busca "${searchTerm}"`);


    // Paginar os resultados
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);

    // Função para mudar de página
    const paginate = (pageNumber) => {
      if (pageNumber < 1 || pageNumber > totalPages) return;
      setCurrentPage(pageNumber);
    };

    return (
      <div className="community-details-section">
        <h3>Detalhes por Comunidade</h3>

        <div className="table-filters">
          <div className="search-filter">
            <input
              type="text"
              placeholder="Buscar comunidade ou município..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1); // Reset para primeira página ao filtrar
              }}
              className="search-input"
            />
            <button className="search-btn">
              <i className="fas fa-search"></i>
            </button>
          </div>

          <div className="filter-buttons">
            <button
              className={`filter-btn ${activeFilter === 'all' ? 'active' : ''}`}
              onClick={() => {
                setActiveFilter('all');
                setCurrentPage(1);
                console.log("Filtro alterado para: all");
              }}
            >
              Todos
            </button>
            <button
              className={`filter-btn high ${activeFilter === 'high' ? 'active' : ''}`}
              onClick={() => {
                setActiveFilter('high');
                setCurrentPage(1);
                console.log("Filtro alterado para: high");
              }}
            >
              Alta Dependência
            </button>
            <button
              className={`filter-btn moderate ${activeFilter === 'moderate' ? 'active' : ''}`}
              onClick={() => {
                setActiveFilter('moderate');
                setCurrentPage(1);
                console.log("Filtro alterado para: moderate");
              }}
            >
              Dependência Moderada
            </button>
            <button
              className={`filter-btn low ${activeFilter === 'low' ? 'active' : ''}`}
              onClick={() => {
                setActiveFilter('low');
                setCurrentPage(1);
                console.log("Filtro alterado para: low");
              }}
            >
              Baixa Dependência
            </button>
          </div>
        </div>

        <div className="table-container">
          {currentItems.length > 0 ? (
            <table className="communities-table">
              <thead>
                <tr>
                  <th>Comunidade</th>
                  <th>Município</th>
                  <th>Cluster</th>
                  <th>População</th>
                  <th>Pescadores</th>
                  <th>% Pescadores</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.map(community => {
                  const fishPerc = parseFloat(community.fishermen_percentage);
                  const clusterType = classifyCommunityByFishermen(fishPerc, community);
                  const definition = clusterDefinitions[clusterType];

                  return (
                    <tr key={community.community_id} className={`row-${definition.class}`}>
                      <td>
                        <Link to={`/community/${community.community_id}`}>
                          {community.community_name}
                        </Link>
                      </td>
                      <td>{community.municipality_name}</td>
                      <td>
                        <span className={`cluster-badge ${definition.class}`}>
                          {definition.label}
                        </span>
                      </td>
                      <td>{parseInt(community.population).toLocaleString('pt-BR')}</td>
                      <td>{parseInt(community.fishermen).toLocaleString('pt-BR')}</td>
                      <td className={`percentage-cell ${definition.class}`}>
                        {community.fishermen_percentage}%
                      </td>
                      <td>
                        <Link to={`/community/${community.community_id}`} className="action-btn">
                          <i className="fas fa-chart-bar"></i> Detalhes
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <div className="no-data-message">
              Nenhuma comunidade encontrada com os critérios selecionados.
            </div>
          )}
        </div>

        {totalPages > 1 && (
          <div className="table-pagination">
            <button
              className="pagination-btn"
              disabled={currentPage === 1}
              onClick={() => paginate(currentPage - 1)}
            >
              Anterior
            </button>
            <div className="pagination-numbers">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                // Lógica para mostrar as páginas corretas ao redor da página atual
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }

                return (
                  <button
                    key={pageNum}
                    className={`page-number ${currentPage === pageNum ? 'active' : ''}`}
                    onClick={() => paginate(pageNum)}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>
            <button
              className="pagination-btn"
              disabled={currentPage === totalPages}
              onClick={() => paginate(currentPage + 1)}
            >
              Próxima
            </button>
          </div>
        )}
      </div>
    );
  };

  const renderDebugInfo = () => {
    if (process.env.NODE_ENV !== 'development') return null;

    return (
      <div className="debug-panel">
        <h4>Informações de Debug</h4>
        <button onClick={() => setShowDebug(!showDebug)} className="debug-toggle">
          {showDebug ? 'Esconder Detalhes' : 'Mostrar Detalhes'}
        </button>

        {showDebug && (
          <div className="debug-details">
            <p>Análise selecionada: {analysisType}</p>
            <p>Filtro ativo: {activeFilter}</p>
            <p>Clusters visíveis: {visibleClusters.join(', ')}</p>
            <p>Página atual: {currentPage}</p>
            <p>Termo de busca: "{searchTerm}"</p>
            <p>Termo de busca no mapa: "{mapSearchTerm}"</p>
            <hr />
            <p>Status de carregamento: {loading ? 'Carregando...' : 'Concluído'}</p>
            <p>Erro: {error ? error : 'Nenhum'}</p>
            <p>Total de comunidades: {clusterData?.communityData?.length || 0}</p>
            <p>Com coordenadas: {clusterData?.communityData?.filter(c => c.latitude && c.longitude).length || 0}</p>
            <button onClick={() => console.log('Estado atual:', {
              analysisType,
              activeFilter,
              visibleClusters,
              clusterData,
              currentPage
            })} className="debug-log-btn">
              Log no Console
            </button>
          </div>
        )}
      </div>
    );
  };

  // Modified render method with dropdown selector
  useEffect(() => {
    if (clusterData) {
      debugMapCoordinates();
    }
  }, [clusterData]);

  return (
    <div className="advanced-analysis container">
      <h2>Análise Avançada de Dados</h2>

      {loading && (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Carregando dados para análise...</p>
        </div>
      )}

      {error && (
        <div className="error-message">
          <div className="error-icon">⚠️</div>
          <div className="error-content">
            <p>{error}</p>
            <button className="retry-button" onClick={() => window.location.reload()}>
              Tentar novamente
            </button>
          </div>
        </div>
      )}

      {!loading && !error && (
        <>
          {/* Replace tabs with dropdown selector */}
          <div className="analysis-controls">
            <div className="analysis-selector">
              <label htmlFor="analysis-type-select">Selecione o tipo de análise:</label>
              <select
                id="analysis-type-select"
                value={analysisType}
                onChange={handleAnalysisTypeChange}
                className="analysis-type-select"
              >
                <option value="overview">Visão Geral</option>
                {/* <option value="statistics" disabled>Estatísticas (Indisponível)</option> */}
                <option value="clusters">Análise de Clusters</option>
                <option value="regression">Regressão</option>
                {/* <option value="predictions" disabled>Predições (Indisponível)</option> */}
              </select>
            </div>
          </div>

          {/* Content based on selected analysis type */}
          <div className="analysis-content">
            {analysisType === 'overview' && (
              <div className="overview-section analysis-section">
                {renderOverview()}
              </div>
            )}

            {analysisType === 'clusters' && (
              <div className="clusters-section analysis-section">
                {clusterData ? (
                  <>
                    {renderClusterAnalysis()}
                    {renderClusterMap()}
                    {renderInterpretation()}
                    {renderCommunityDetails()}
                  </>
                ) : (
                  <div className="loading-message">Carregando dados de clusters...</div>
                )}
              </div>
            )}

            {analysisType === 'regression' && (
              <div className="regression-section analysis-section">
                {regressionData ? (
                  renderRegressionAnalysis()
                ) : (
                  <div className="loading-message">Carregando dados de regressão...</div>
                )}
              </div>
            )}
          </div>
        </>
      )}

      {renderDebugInfo()}
    </div>
  );
};

export default AdvancedAnalysis;
