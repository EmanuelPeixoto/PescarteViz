import React, { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import { fetchCommunityDetails, fetchMunicipios, fetchComunidadesByMunicipio } from '../services/communitiesApi';
import ChartContainer from './ui/ChartContainer';

const CommunityComparison = () => {
  const [municipalities, setMunicipalities] = useState([]);
  const [selectedMunicipality, setSelectedMunicipality] = useState('');
  const [communities, setCommunities] = useState([]);
  const [selectedCommunities, setSelectedCommunities] = useState([]);
  const [communityData, setCommunityData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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
  useEffect(() => {
    const loadCommunityData = async () => {
      if (selectedCommunities.length === 0) {
        setCommunityData([]);
        return;
      }

      try {
        setLoading(true);
        const promises = selectedCommunities.map(id => fetchCommunityDetails(id));
        const results = await Promise.all(promises);
        setCommunityData(results);
        setLoading(false);
      } catch (err) {
        console.error("Erro ao buscar detalhes da comunidade:", err);
        const errorMessage = err.response?.data?.error || err.message;
        setError(`Falha ao carregar detalhes da comunidade: ${errorMessage}`);
        setLoading(false);
      }
    };

    loadCommunityData();
  }, [selectedCommunities]);

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

  // Opções do gráfico
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          boxWidth: 12,
          font: {
            size: 11
          }
        }
      },
      title: {
        display: false // Remove title to save space
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.dataset.label || '';
            const value = context.raw;
            return `${label}: ${value.toLocaleString('pt-BR')}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          font: { size: 10 },
          maxTicksLimit: 6
        },
        grid: {
          display: true,
          color: 'rgba(0, 0, 0, 0.05)'
        }
      },
      x: {
        ticks: {
          font: { size: 10 },
          maxRotation: 45,
          minRotation: 45
        },
        grid: {
          display: false
        }
      }
    }
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

  if (loading && municipalities.length === 0) {
    return <div className="loading">Carregando municípios...</div>;
  }

  return (
    <div className="comparison-container">
      <h1>Comparar Comunidades</h1>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {/* Seletor de município */}
      <div className="municipality-selector">
        <h2>1. Selecionar Município</h2>
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

      {/* Caixas de seleção de comunidades */}
      {selectedMunicipality && (
        <div className="communities-selector">
          <h2>2. Selecionar Comunidades para Comparar (máximo 5)</h2>

          {loading && communities.length === 0 ? (
            <div>Carregando comunidades...</div>
          ) : communities.length > 0 ? (
            <div className="communities-grid">
              {communities.map(community => {
                // Add defensive checks for missing data
                const pescadores = community.pescadores || 0;
                const pessoas = community.pessoas || 0;

                return (
                  <div key={community.id} className="community-checkbox">
                    <label>
                      <input
                        type="checkbox"
                        checked={selectedCommunities.includes(community.id)}
                        onChange={() => toggleCommunity(community.id)}
                      />
                      {community.nome} {pescadores > 0 && pessoas > 0 ?
                        `(${pescadores} pescadores / ${pessoas} pessoas)` :
                        "(dados do censo indisponíveis)"}
                    </label>
                  </div>
                );
              })}
            </div>
          ) : (
            <div>Nenhuma comunidade encontrada para este município</div>
          )}
        </div>
      )}

      {/* Gráficos de comparação */}
      {communityData.length > 0 && (
        <div className="comparison-charts">
          <h2>3. Comparação de Comunidades</h2>

          <div className="chart-grid">
            <ChartContainer title="População Total" isLoading={loading}>
              <Bar data={populationData} options={chartOptions} />
            </ChartContainer>

            <ChartContainer title="Famílias" isLoading={loading}>
              <Bar data={familiesData} options={chartOptions} />
            </ChartContainer>

            <ChartContainer title="Percentual de Pescadores" isLoading={loading}>
              <Bar data={percentageData} options={chartOptions} />
            </ChartContainer>
          </div>

          {/* Tabela de dados */}
          <div className="comparison-table">
            <h3>Dados Comparativos</h3>
            <table>
              <thead>
                <tr>
                  <th>Comunidade</th>
                  <th>Município</th>
                  <th>População Total</th>
                  <th>Famílias</th>
                  <th>Pescadores</th>
                  <th>% Pescadores</th>
                </tr>
              </thead>
              <tbody>
                {communityData.map(community => (
                  <tr key={community.id}>
                    <td>{community.nome}</td>
                    <td>{community.municipio_nome}</td>
                    <td>{community.pessoas}</td>
                    <td>{community.familias}</td>
                    <td>{community.pescadores}</td>
                    <td>{((community.pescadores / community.pessoas) * 100).toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selectedMunicipality && selectedCommunities.length === 0 && (
        <div className="instruction-message">
          Selecione pelo menos uma comunidade para ver os dados comparativos
        </div>
      )}

      {!selectedMunicipality && (
        <div className="instruction-message">
          Selecione um município para começar a comparação
        </div>
      )}
    </div>
  );
};

export default CommunityComparison;
