import React, { useEffect, useState } from 'react';
import CommunitiesMapModule from '../maps/CommunitiesMapModule';
import { fetchAllCommunities } from '../../services/communitiesApi';

const CommunityMapSection = () => {
  const [communities, setCommunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadCommunities = async () => {
      try {
        setLoading(true);
        const data = await fetchAllCommunities();
        setCommunities(data);
        setLoading(false);
      } catch (err) {
        console.error("Erro ao carregar dados das comunidades:", err);
        setError("Não foi possível carregar o mapa das comunidades");
        setLoading(false);
      }
    };

    loadCommunities();
  }, []);

  if (loading) return <div className="loading-container">Carregando mapa...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="dashboard-map-section">
      <h2>Localização das Comunidades</h2>
      <div className="map-container">
        <CommunitiesMapModule
          communities={communities}
          height="500px"
          title="Distribuição Geográfica das Comunidades Pesqueiras"
        />
      </div>
    </div>
  );
};

export default CommunityMapSection;