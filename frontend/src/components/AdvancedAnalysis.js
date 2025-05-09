import React, { useState, useEffect } from 'react';
import { fetchAllCommunities } from '../services/communitiesApi';
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
  registerables
} from 'chart.js';
import { Scatter, Bar, Line } from 'react-chartjs-2';
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
  annotationPlugin,
  ...registerables
);

const AdvancedAnalysis = () => {
  const [communitiesData, setCommunitiesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [analysisType, setAnalysisType] = useState('correlation');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const allCommunities = await fetchAllCommunities();
        setCommunitiesData(allCommunities);
        setLoading(false);
      } catch (err) {
        setError('Falha ao carregar dados para análise: ' + err.message);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Update the generateRegressionLine function to use sumYY
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

    // Calculate R-squared using sumYY
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

    // Use sumYY properly for the actual calculation of R-squared
    // Pearson's correlation coefficient squared = R-squared
    const correlation = (n * sumXY - sumX * sumY) /
                        (Math.sqrt((n * sumXX - sumX * sumX) * (n * sumYY - sumY * sumY)));
    const rSquared = correlation * correlation;

    // Generate points for regression line
    const xValues = data.map(item => parseFloat(item[xKey]));
    const minX = Math.min(...xValues);
    const maxX = Math.max(...xValues);

    const regressionData = [
      { x: minX, y: slope * minX + intercept },
      { x: maxX, y: slope * maxX + intercept }
    ];

    return { regressionData, rSquared, slope, intercept };
  };

  // Correlation scatter plot data
  const correlationData = {
    datasets: [
      {
        label: 'Comunidades (População vs. Pescadores)',
        data: communitiesData.map(community => ({
          x: parseInt(community.pessoas) || 0,
          y: parseInt(community.pescadores) || 0,
          r: 8, // Point radius
          community: community.nome,
          municipio: community.municipio_nome || 'Desconhecido'
        })),
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
        pointHoverRadius: 10,
        pointHoverBackgroundColor: 'rgba(54, 162, 235, 0.9)',
      }
    ],
  };

  // Get regression line data if we have communities
  let regressionLine = null;
  let rSquared = 0;

  if (communitiesData && communitiesData.length > 0) {
    const regression = generateRegressionLine(communitiesData, 'pessoas', 'pescadores');
    regressionLine = {
      type: 'line',
      label: 'Linha de Regressão',
      data: regression.regressionData,
      borderColor: 'rgba(255, 99, 132, 1)',
      borderWidth: 2,
      fill: false,
      pointRadius: 0,
      order: 0
    };
    rSquared = regression.rSquared;

    // Add regression line to scatter plot
    correlationData.datasets.push(regressionLine);
  }

  // Options for correlation scatter plot
  const correlationOptions = {
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
  };

  // Distribution analysis - percentage of fishermen
  const percentageData = communitiesData.map(community => {
    const pessoas = parseInt(community.pessoas) || 1;
    const pescadores = parseInt(community.pescadores) || 0;
    return (pescadores / pessoas) * 100;
  });

  // Create histogram bins
  const createHistogramBins = (data, binCount = 10) => {
    const min = Math.min(...data);
    const max = Math.max(...data);
    const binWidth = (max - min) / binCount;

    const bins = Array(binCount).fill(0);
    const binLabels = [];

    for (let i = 0; i < binCount; i++) {
      const lowerBound = min + i * binWidth;
      const upperBound = lowerBound + binWidth;
      binLabels.push(`${lowerBound.toFixed(0)}%-${upperBound.toFixed(0)}%`);

      data.forEach(value => {
        if (value >= lowerBound && value < upperBound) {
          bins[i]++;
        }
        // Special case for the last bin to include the max value
        if (i === binCount - 1 && value === upperBound) {
          bins[i]++;
        }
      });
    }

    return { bins, binLabels };
  };

  const { bins: percentageBins, binLabels: percentageLabels } = createHistogramBins(percentageData);

  const distributionData = {
    labels: percentageLabels,
    datasets: [
      {
        label: 'Número de Comunidades',
        data: percentageBins,
        backgroundColor: 'rgba(153, 102, 255, 0.7)',
        borderColor: 'rgba(153, 102, 255, 1)',
        borderWidth: 1,
      }
    ]
  };

  const distributionOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        title: {
          display: true,
          text: 'Percentual de Pescadores',
          font: {
            size: 14,
            weight: 'bold'
          }
        }
      },
      y: {
        title: {
          display: true,
          text: 'Número de Comunidades',
          font: {
            size: 14,
            weight: 'bold'
          }
        },
        beginAtZero: true
      }
    },
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Distribuição do Percentual de Pescadores nas Comunidades',
        font: {
          size: 18,
          weight: 'bold'
        }
      }
    }
  };

  // Time series analysis (simulated)
  const timeSeriesData = {
    labels: ['2015', '2016', '2017', '2018', '2019', '2020', '2021', '2022', '2023', '2024'],
    datasets: [
      {
        label: 'Pescadores Registrados',
        data: [2500, 2650, 2750, 2900, 3200, 3500, 3650, 3800, 4100, 4250],
        borderColor: 'rgba(255, 99, 132, 1)',
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        fill: true,
        tension: 0.4
      },
      {
        label: 'População Total das Comunidades',
        data: [12000, 12200, 12500, 12800, 13100, 13500, 14000, 14500, 15000, 15200],
        borderColor: 'rgba(54, 162, 235, 1)',
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        fill: true,
        tension: 0.4
      }
    ]
  };

  const timeSeriesOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        title: {
          display: true,
          text: 'Ano',
          font: {
            size: 14,
            weight: 'bold'
          }
        }
      },
      y: {
        title: {
          display: true,
          text: 'Número de Pessoas',
          font: {
            size: 14,
            weight: 'bold'
          }
        },
        beginAtZero: false,
        ticks: {
          callback: function(value) {
            return value.toLocaleString('pt-BR');
          }
        }
      }
    },
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Evolução Histórica da População e Pescadores',
        font: {
          size: 18,
          weight: 'bold'
        }
      },
      annotation: {
        annotations: {
          line1: {
            type: 'line',
            mode: 'horizontal',
            scaleID: 'y',
            value: 4000,
            borderColor: 'rgba(255, 99, 132, 0.5)',
            borderWidth: 2,
            borderDash: [6, 6],
            label: {
              content: 'Meta 2024',
              position: 'end',
              backgroundColor: 'rgba(255, 99, 132, 0.8)',
              color: 'white'
            }
          }
        }
      }
    }
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
            <option value="correlation">Correlação População-Pescadores</option>
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
          {analysisType === 'correlation' && (
            <div className="analysis-section">
              <div className="analysis-header">
                <h2>Correlação entre População e Número de Pescadores</h2>
                <div className="analysis-stats">
                  <div className="stat-badge">
                    <span>R²:</span>
                    <span>{rSquared.toFixed(3)}</span>
                  </div>
                  <div className="insight">
                    {rSquared > 0.7 ? (
                      'Forte correlação entre população e número de pescadores'
                    ) : rSquared > 0.4 ? (
                      'Correlação moderada entre população e número de pescadores'
                    ) : (
                      'Correlação fraca entre população e número de pescadores'
                    )}
                  </div>
                </div>
              </div>
              <div className="chart-large-container">
                <Scatter data={correlationData} options={correlationOptions} />
              </div>
              <div className="analysis-interpretations">
                <h3>Interpretação dos Resultados:</h3>
                <ul>
                  <li>O gráfico mostra a relação entre população total e número de pescadores nas comunidades.</li>
                  <li>A linha de regressão indica a tendência geral dessa relação.</li>
                  <li>O valor R² de {rSquared.toFixed(3)} indica o quanto da variação no número de pescadores pode ser explicada pela população total.</li>
                  <li>Pontos acima da linha têm proporcionalmente mais pescadores do que a média das comunidades.</li>
                  <li>Pontos abaixo da linha têm proporcionalmente menos pescadores do que a média das comunidades.</li>
                </ul>
              </div>
            </div>
          )}

          {analysisType === 'distribution' && (
            <div className="analysis-section">
              <div className="analysis-header">
                <h2>Distribuição do Percentual de Pescadores nas Comunidades</h2>
                <div className="analysis-stats">
                  <div className="stat-badge">
                    <span>Média:</span>
                    <span>{(percentageData.reduce((a, b) => a + b, 0) / percentageData.length).toFixed(1)}%</span>
                  </div>
                  <div className="stat-badge">
                    <span>Mediana:</span>
                    <span>{percentageData.sort((a, b) => a - b)[Math.floor(percentageData.length / 2)].toFixed(1)}%</span>
                  </div>
                </div>
              </div>
              <div className="chart-large-container">
                <Bar data={distributionData} options={distributionOptions} />
              </div>
              <div className="analysis-interpretations">
                <h3>Interpretação dos Resultados:</h3>
                <ul>
                  <li>O histograma mostra como as comunidades estão distribuídas em termos do percentual de pescadores.</li>
                  <li>A maior concentração de comunidades está na faixa de {percentageLabels[percentageBins.indexOf(Math.max(...percentageBins))]}.</li>
                  <li>A média percentual de pescadores nas comunidades é de {(percentageData.reduce((a, b) => a + b, 0) / percentageData.length).toFixed(1)}%.</li>
                  <li>Comunidades com percentual muito acima da média podem ser consideradas fortemente dependentes da pesca.</li>
                </ul>
              </div>
            </div>
          )}

          {analysisType === 'timeseries' && (
            <div className="analysis-section">
              <div className="analysis-header">
                <h2>Análise Temporal (Histórico de 10 Anos)</h2>
                <div className="analysis-stats">
                  <div className="stat-badge">
                    <span>Crescimento de Pescadores:</span>
                    <span>+70%</span>
                  </div>
                  <div className="stat-badge">
                    <span>Crescimento Populacional:</span>
                    <span>+27%</span>
                  </div>
                </div>
              </div>
              <div className="chart-large-container">
                <Line data={timeSeriesData} options={timeSeriesOptions} />
              </div>
              <div className="analysis-interpretations">
                <h3>Interpretação dos Resultados:</h3>
                <ul>
                  <li>O gráfico mostra a evolução temporal da população total e do número de pescadores nas comunidades.</li>
                  <li>Observe que o número de pescadores cresceu a uma taxa mais acelerada que a população total.</li>
                  <li>O percentual de pescadores na população aumentou de 20.8% em 2015 para 28% em 2024.</li>
                  <li>A linha pontilhada horizontal representa a meta estabelecida para o número de pescadores registrados em 2024.</li>
                </ul>
              </div>
              <div className="data-source-note">
                <p><strong>Nota:</strong> Os dados temporais são baseados em estimativas e projeções para fins de demonstração.</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdvancedAnalysis;
