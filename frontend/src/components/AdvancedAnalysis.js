import React, { useState, useEffect } from 'react';
import { fetchAllCommunities } from '../services/communitiesApi';
import axios from 'axios';
import { handleApiError } from '../utils/errorHandler';
import {
  Chart as ChartJS,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  Title,
  registerables,
  PieController,
  ArcElement
} from 'chart.js';
import { Scatter, Bar, Line, Pie } from 'react-chartjs-2';
import annotationPlugin from 'chartjs-plugin-annotation';

// Register ChartJS components
ChartJS.register(
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  CategoryScale,
  Title,
  Tooltip,
  Legend,
  PieController,
  ArcElement,
  annotationPlugin,
  ...registerables
);

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

const AdvancedAnalysis = () => {
  const [communitiesData, setCommunitiesData] = useState([]);
  const [statisticsData, setStatisticsData] = useState(null);
  const [clusterData, setClusterData] = useState(null);
  const [predictionsData, setPredictionsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [analysisType, setAnalysisType] = useState('statistics');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch all required data in parallel
        const communities = await fetchAllCommunities();

        // Use individual try-catch for each request to continue even if one fails
        let statistics = null;
        try {
          statistics = await axios.get(`${API_URL}/analytics/statistics`).then(res => res.data);
        } catch (err) {
          console.error("Error fetching statistics:", err);
        }

        let clusters = null;
        try {
          clusters = await axios.get(`${API_URL}/analytics/clusters`).then(res => res.data);
        } catch (err) {
          console.error("Error fetching clusters:", err);
        }

        let predictions = null;
        try {
          predictions = await axios.get(`${API_URL}/analytics/predictions`).then(res => res.data);
        } catch (err) {
          console.error("Error fetching predictions:", err);
        }

        setCommunitiesData(communities || []);
        setStatisticsData(statistics);
        setClusterData(clusters);
        setPredictionsData(predictions);
        setLoading(false);
        setAnalysisType('statistics');
      } catch (err) {
        const errorMsg = handleApiError(err);
        setError('Falha ao carregar dados para análise: ' + errorMsg);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const generateRegressionLine = (data, xKey, yKey) => {
    const n = data.length;
    let sumX = 0;
    let sumY = 0;
    let sumXY = 0;
    let sumXX = 0;
    let sumYY = 0;

    data.forEach(item => {
      const x = parseFloat(item[xKey]);
      const y = parseFloat(item[yKey]);

      sumX += x;
      sumY += y;
      sumXY += x * y;
      sumXX += x * x;
      sumYY += y * y;  // This is used for calculating r-squared
    });

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    const meanY = sumY / n;
    let totalVariation = 0;
    let explainedVariation = 0;

    data.forEach(item => {
      const x = parseFloat(item[xKey]);
      const y = parseFloat(item[yKey]);
      const predicted = slope * x + intercept;

      totalVariation += Math.pow(y - meanY, 2);
      explainedVariation += Math.pow(predicted - meanY, 2);
    });

    const correlation = (n * sumXY - sumX * sumY) /
                        (Math.sqrt((n * sumXX - sumX * sumX) * (n * sumYY - sumY * sumY)));
    const rSquared = correlation * correlation;

    const xValues = data.map(item => parseFloat(item[xKey]));
    const minX = Math.min(...xValues);
    const maxX = Math.max(...xValues);

    const regressionData = [
      { x: minX, y: slope * minX + intercept },
      { x: maxX, y: slope * maxX + intercept }
    ];

    return { regressionData, rSquared, slope, intercept };
  };

  const clusterChartData = clusterData ? {
    labels: Object.keys(clusterData.clusterSummary),
    datasets: [
      {
        label: 'Número de Comunidades',
        data: Object.values(clusterData.clusterSummary),
        backgroundColor: [
          'rgba(255, 99, 132, 0.7)',
          'rgba(54, 162, 235, 0.7)',
          'rgba(255, 206, 86, 0.7)'
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)'
        ],
        borderWidth: 1
      }
    ]
  } : null;

  const predictiveChartData = predictionsData ? {
    labels: [predictionsData.current.year, ...predictionsData.predictions.map(d => d.year)],
    datasets: [
      {
        label: 'População Total',
        data: [predictionsData.current.population, ...predictionsData.predictions.map(d => d.population)],
        borderColor: 'rgba(54, 162, 235, 1)',
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        fill: true,
        tension: 0.4
      },
      {
        label: 'Pescadores',
        data: [predictionsData.current.fishermen, ...predictionsData.predictions.map(d => d.fishermen)],
        borderColor: 'rgba(255, 99, 132, 1)',
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        fill: true,
        tension: 0.4
      }
    ]
  } : null;

  const clusterOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Distribuição de Comunidades por Dependência da Pesca',
        font: {
          size: 18,
          weight: 'bold'
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const value = context.raw;
            const total = Object.values(clusterData.clusterSummary).reduce((a, b) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${context.label}: ${value} comunidades (${percentage}%)`;
          }
        }
      }
    }
  };

  const renderClusterAnalysis = () => {
    if (!clusterData) return null;

    return (
      <div className="analysis-section">
        <div className="analysis-header">
          <h2>Análise de Cluster por Dependência da Pesca</h2>
          <div className="analysis-stats">
            <div className="stat-badge">
              <span>Total de Comunidades:</span>
              <span>{Object.values(clusterData.clusterSummary).reduce((a, b) => a + b, 0)}</span>
            </div>
          </div>
        </div>

        <div className="chart-container">
          <div className="chart-medium-container">
            <Pie data={clusterChartData} options={clusterOptions} />
          </div>

          <div className="stats-cards">
            {Object.keys(clusterData.clusterSummary).map(cluster => (
              <div className="cluster-card" key={cluster}>
                <h3>{cluster}</h3>
                <div className="cluster-value">{clusterData.clusterSummary[cluster]}</div>
                <div className="cluster-subtitle">comunidades</div>
              </div>
            ))}
          </div>
        </div>

        <div className="data-table-container">
          <h3>Comunidades por Cluster</h3>
          <div className="table-responsive">
            <table className="analytics-table">
              <thead>
                <tr>
                  <th>Comunidade</th>
                  <th>Município</th>
                  <th>População</th>
                  <th>Pescadores</th>
                  <th>% Pescadores</th>
                  <th>Tamanho Médio Família</th>
                  <th>Cluster</th>
                </tr>
              </thead>
              <tbody>
                {clusterData.clusterAnalysis.map((item, index) => (
                  <tr key={index}>
                    <td>{item.community_name}</td>
                    <td>{item.municipality_name}</td>
                    <td>{item.population}</td>
                    <td>{item.fishermen}</td>
                    <td>{item.fishermen_percentage}%</td>
                    <td>{item.avg_family_size}</td>
                    <td>{item.cluster}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="analysis-interpretations">
          <h3>Interpretação dos Resultados:</h3>
          <ul>
            <li>As comunidades foram agrupadas em três clusters baseados na porcentagem de pescadores em relação à população total.</li>
            <li><strong>Alta dependência</strong>: Comunidades onde mais de {clusterData.clusterAnalysis.find(c => c.cluster === 'High fishing dependence')?.fishermen_percentage}% da população são pescadores.</li>
            <li><strong>Dependência moderada</strong>: Entre {clusterData.clusterAnalysis.find(c => c.cluster === 'Low fishing dependence')?.fishermen_percentage}% e {clusterData.clusterAnalysis.find(c => c.cluster === 'High fishing dependence')?.fishermen_percentage}% da população.</li>
            <li><strong>Baixa dependência</strong>: Menos de {clusterData.clusterAnalysis.find(c => c.cluster === 'Low fishing dependence')?.fishermen_percentage}% da população.</li>
          </ul>
        </div>
      </div>
    );
  };

  const renderPredictiveAnalysis = () => {
    if (!predictionsData) return null;

    const lastPrediction = predictionsData.predictions[predictionsData.predictions.length - 1];
    const growthPercentage = ((lastPrediction.fishermen / predictionsData.current.fishermen - 1) * 100).toFixed(1);

    return (
      <div className="analysis-section">
        <div className="analysis-header">
          <h2>Análise Preditiva - Projeção para os Próximos 5 Anos</h2>
          <div className="analysis-stats">
            <div className="stat-badge">
              <span>Crescimento Projetado:</span>
              <span>{growthPercentage}%</span>
            </div>
            <div className="stat-badge">
              <span>População em {lastPrediction.year}:</span>
              <span>{lastPrediction.population.toLocaleString('pt-BR')}</span>
            </div>
          </div>
        </div>

        <div className="chart-large-container">
          <Line
            data={predictiveChartData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              scales: {
                y: {
                  beginAtZero: false,
                  title: {
                    display: true,
                    text: 'Número de Pessoas',
                    font: {
                      size: 14,
                      weight: 'bold'
                    }
                  }
                },
                x: {
                  title: {
                    display: true,
                    text: 'Ano',
                    font: {
                      size: 14,
                      weight: 'bold'
                    }
                  }
                }
              },
              plugins: {
                tooltip: {
                  callbacks: {
                    label: function(context) {
                      const value = context.raw;
                      return `${context.dataset.label}: ${value.toLocaleString('pt-BR')}`;
                    }
                  }
                }
              }
            }}
          />
        </div>

        <div className="prediction-table-container">
          <h3>Projeções Detalhadas</h3>
          <div className="table-responsive">
            <table className="analytics-table">
              <thead>
                <tr>
                  <th>Ano</th>
                  <th>População Total</th>
                  <th>Pescadores</th>
                  <th>% Pescadores</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>{predictionsData.current.year} (Atual)</strong></td>
                  <td>{predictionsData.current.population.toLocaleString('pt-BR')}</td>
                  <td>{predictionsData.current.fishermen.toLocaleString('pt-BR')}</td>
                  <td>{predictionsData.current.percentage}%</td>
                </tr>
                {predictionsData.predictions.map((item, index) => (
                  <tr key={index}>
                    <td>{item.year}</td>
                    <td>{item.population.toLocaleString('pt-BR')}</td>
                    <td>{item.fishermen.toLocaleString('pt-BR')}</td>
                    <td>{item.percentage}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="analysis-interpretations">
          <h3>Interpretação das Projeções:</h3>
          <ul>
            <li>As projeções indicam um crescimento de {growthPercentage}% no número de pescadores até {lastPrediction.year}.</li>
            <li>A percentagem de pescadores em relação à população total tende a {predictionsData.current.percentage < lastPrediction.percentage ? 'aumentar' : 'diminuir'} ao longo do tempo.</li>
            <li>Este modelo considera um crescimento populacional anual de 2% e um crescimento de 3% no número de pescadores.</li>
            <li>Fatores como políticas públicas, condições ambientais e econômicas podem alterar estas projeções.</li>
          </ul>
        </div>

        <div className="data-source-note">
          <p><strong>Nota:</strong> Estas projeções são baseadas em modelos simplificados de crescimento e devem ser interpretadas com cautela.</p>
        </div>
      </div>
    );
  };

  const renderStatisticsOverview = () => {
    if (!statisticsData) return null;

    const stats = statisticsData.generalStats;
    const sizeDistributionData = {
      labels: statisticsData.sizeDistribution.map(d => d.size_category),
      datasets: [{
        label: 'Número de Comunidades',
        data: statisticsData.sizeDistribution.map(d => parseInt(d.community_count)),
        backgroundColor: 'rgba(75, 192, 192, 0.7)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1
      }]
    };

    return (
      <div className="analysis-section">
        <div className="analysis-header">
          <h2>Estatísticas Gerais das Comunidades Pesqueiras</h2>
        </div>

        <div className="stats-overview">
          <div className="stat-card highlight">
            <h3>Total de Comunidades</h3>
            <div className="stat-value">{stats.total_communities}</div>
          </div>
          <div className="stat-card">
            <h3>Média % Pescadores</h3>
            <div className="stat-value">{parseFloat(stats.avg_pescadores_perc).toFixed(1)}%</div>
            <div className="stat-subtitle">Desvio Padrão: {parseFloat(stats.stddev_pescadores_perc).toFixed(1)}%</div>
          </div>
          <div className="stat-card">
            <h3>Tamanho Médio de Família</h3>
            <div className="stat-value">{parseFloat(stats.avg_family_size).toFixed(1)}</div>
            <div className="stat-subtitle">pessoas por família</div>
          </div>
          <div className="stat-card">
            <h3>Tamanho Mediano</h3>
            <div className="stat-value">{stats.median_community_size}</div>
            <div className="stat-subtitle">pessoas por comunidade</div>
          </div>
        </div>

        <div className="extreme-values-section">
          <div className="extreme-card highest">
            <h3>Maior % de Pescadores</h3>
            <div className="extreme-value">{parseFloat(stats.highest_perc_value).toFixed(1)}%</div>
            <div className="extreme-details">
              <div>{stats.highest_perc_community}</div>
              <div>{stats.highest_perc_municipio}</div>
            </div>
          </div>
          <div className="extreme-card lowest">
            <h3>Menor % de Pescadores</h3>
            <div className="extreme-value">{parseFloat(stats.lowest_perc_value).toFixed(1)}%</div>
            <div className="extreme-details">
              <div>{stats.lowest_perc_community}</div>
              <div>{stats.lowest_perc_municipio}</div>
            </div>
          </div>
        </div>

        <div className="chart-section">
          <h3>Distribuição de Comunidades por Tamanho</h3>
          <div className="chart-medium-container">
            <Bar
              data={sizeDistributionData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: false
                  }
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    title: {
                      display: true,
                      text: 'Número de Comunidades',
                      font: {
                        size: 14,
                        weight: 'bold'
                      }
                    }
                  }
                }
              }}
            />
          </div>
        </div>

        <div className="analysis-interpretations">
          <h3>Destaques da Análise Estatística:</h3>
          <ul>
            <li>A percentagem média de pescadores nas comunidades é de {parseFloat(stats.avg_pescadores_perc).toFixed(1)}%.</li>
            <li>A comunidade com maior dependência da pesca é {stats.highest_perc_community} ({parseFloat(stats.highest_perc_value).toFixed(1)}%).</li>
            <li>A maioria das comunidades possui entre {statisticsData.sizeDistribution[0]?.size_category} pessoas.</li>
            <li>O tamanho médio das famílias é de {parseFloat(stats.avg_family_size).toFixed(1)} pessoas.</li>
          </ul>
        </div>
      </div>
    );
  };

  return (
    <div className="advanced-analysis-container">
      <h1>Análise Avançada de Dados</h1>

      <div className="analysis-controls">
        <div className="analysis-selector">
          <label htmlFor="analysis-type">Tipo de Análise:</label>
          <select
            id="analysis-type"
            value={analysisType}
            onChange={(e) => setAnalysisType(e.target.value)}
          >
            <option value="statistics">Estatísticas Gerais</option>
            <option value="correlation">Correlação População-Pescadores</option>
            <option value="clusters">Análise de Clusters</option>
            <option value="predictions">Projeções Futuras</option>
            <option value="distribution">Distribuição % de Pescadores</option>
            <option value="timeseries">Análise Temporal</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="loading">Carregando dados para análise...</div>
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : (
        <div className="analysis-container">
          {analysisType === 'statistics' && renderStatisticsOverview()}
          {analysisType === 'correlation' && (
            <div className="analysis-section">
              <div className="analysis-header">
                <h2>Correlação entre População e Número de Pescadores</h2>
                <div className="analysis-stats">
                  <div className="stat-badge">
                    <span>R²:</span>
                    <span>{generateRegressionLine(communitiesData, 'pessoas', 'pescadores').rSquared.toFixed(3)}</span>
                  </div>
                </div>
              </div>
              <div className="chart-large-container">
                <Scatter data={{
                  datasets: [
                    {
                      label: 'Comunidades (População vs. Pescadores)',
                      data: communitiesData.map(community => ({
                        x: parseInt(community.pessoas) || 0,
                        y: parseInt(community.pescadores) || 0,
                        r: 8,
                        community: community.nome,
                        municipio: community.municipio_nome || 'Desconhecido'
                      })),
                      backgroundColor: 'rgba(54, 162, 235, 0.6)',
                      borderColor: 'rgba(54, 162, 235, 1)',
                      borderWidth: 1,
                      pointHoverRadius: 10,
                      pointHoverBackgroundColor: 'rgba(54, 162, 235, 0.9)',
                    },
                    {
                      type: 'line',
                      label: 'Linha de Regressão',
                      data: generateRegressionLine(communitiesData, 'pessoas', 'pescadores').regressionData,
                      borderColor: 'rgba(255, 99, 132, 1)',
                      borderWidth: 2,
                      fill: false,
                      pointRadius: 0,
                      order: 0
                    }
                  ]
                }} options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    x: {
                      title: {
                        display: true,
                        text: 'População Total',
                        font: {
                          size: 14,
                          weight: 'bold'
                        }
                      },
                      ticks: {
                        callback: function(value) {
                          return value.toLocaleString('pt-BR');
                        }
                      }
                    },
                    y: {
                      title: {
                        display: true,
                        text: 'Número de Pescadores',
                        font: {
                          size: 14,
                          weight: 'bold'
                        }
                      },
                      ticks: {
                        callback: function(value) {
                          return value.toLocaleString('pt-BR');
                        }
                      }
                    }
                  },
                  plugins: {
                    tooltip: {
                      callbacks: {
                        label: function(context) {
                          const point = context.raw;
                          return [
                            `Comunidade: ${point.community}`,
                            `Município: ${point.municipio}`,
                            `População: ${point.x.toLocaleString('pt-BR')}`,
                            `Pescadores: ${point.y.toLocaleString('pt-BR')}`,
                            `% Pescadores: ${((point.y / point.x) * 100).toFixed(1)}%`
                          ];
                        }
                      }
                    },
                    legend: {
                      position: 'top',
                    },
                    title: {
                      display: true,
                      text: 'Correlação entre População e Número de Pescadores',
                      font: {
                        size: 18,
                        weight: 'bold'
                      }
                    }
                  }
                }} />
              </div>
            </div>
          )}
          {analysisType === 'clusters' && renderClusterAnalysis()}
          {analysisType === 'predictions' && renderPredictiveAnalysis()}
          {analysisType === 'distribution' && (
            <div className="analysis-section">
              <div className="analysis-header">
                <h2>Distribuição do Percentual de Pescadores</h2>
              </div>
            </div>
          )}
          {analysisType === 'timeseries' && (
            <div className="analysis-section">
              <div className="analysis-header">
                <h2>Análise Temporal</h2>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdvancedAnalysis;
