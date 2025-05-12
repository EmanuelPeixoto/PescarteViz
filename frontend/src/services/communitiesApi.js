import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

export const fetchMunicipios = async () => {
  try {
    const response = await axios.get(`${API_URL}/municipios`);
    return response.data;
  } catch (error) {
    console.error('Error fetching municipalities:', error);
    throw error;
  }
};

export const fetchComunidadesByMunicipio = async (municipioId) => {
  try {
    const response = await axios.get(`${API_URL}/comunidades/${municipioId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching communities:', error);
    throw error;
  }
};

export const fetchCommunityDetails = async (communityId) => {
  try {
    const response = await axios.get(`${API_URL}/comunidades/details/${communityId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching community details:', error);
    throw error;
  }
};

export const fetchComunidadesSummary = async () => {
  try {
    const response = await axios.get(`${API_URL}/comunidades/summary/municipio`);
    return response.data;
  } catch (error) {
    console.error('Error fetching communities summary:', error);
    throw error;
  }
};

export const fetchAllCommunities = async () => {
  try {
    // First get all municipalities
    const municipios = await fetchMunicipios();

    // Then fetch communities for each municipality
    const allCommunities = [];
    for (const municipio of municipios) {
      const communities = await fetchComunidadesByMunicipio(municipio.id);
      // Add municipality name to each community
      const communitiesWithMunicName = communities.map(community => ({
        ...community,
        municipio_nome: municipio.nome
      }));
      allCommunities.push(...communitiesWithMunicName);
    }

    return allCommunities;
  } catch (error) {
    console.error('Error fetching all communities:', error);
    throw error;
  }
};

export const fetchCommunityTimeSeries = async (communityId) => {
  try {
    const response = await axios.get(`${API_URL}/comunidades/timeseries/${communityId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching community time series:', error);
    throw error;
  }
};
