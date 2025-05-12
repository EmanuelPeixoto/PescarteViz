import { useState, useEffect } from 'react';
import { fetchComunidadesSummary } from '../services/communitiesApi';

export const useCommunityData = () => {
  const [communitiesData, setCommunitiesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalMunicipios: 0,
    totalCommunities: 0,
    totalFishermen: 0,
    totalPeople: 0,
    totalFamilies: 0,
    averageFishermenPercentage: "0.0"
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await fetchComunidadesSummary();
        
        if (data && data.length > 0) {
          setCommunitiesData(data);

          // Calculate statistics
          const calculatedStats = data.reduce((acc, item) => {
            acc.totalMunicipios += 1;
            acc.totalCommunities += parseInt(item.num_comunidades) || 0;
            acc.totalFishermen += parseInt(item.total_pescadores) || 0;
            acc.totalPeople += parseInt(item.total_pessoas) || 0;
            acc.totalFamilies += parseInt(item.total_familias) || 0;
            return acc;
          }, {
            totalMunicipios: 0,
            totalCommunities: 0,
            totalFishermen: 0,
            totalPeople: 0,
            totalFamilies: 0
          });

          calculatedStats.averageFishermenPercentage = calculatedStats.totalPeople > 0
            ? ((calculatedStats.totalFishermen / calculatedStats.totalPeople) * 100).toFixed(1)
            : "0.0";

          setStats(calculatedStats);
        }
        
        setLoading(false);
      } catch (err) {
        setError('Falha ao carregar dados do projeto PESCARTE: ' + err.message);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { communitiesData, stats, loading, error };
};