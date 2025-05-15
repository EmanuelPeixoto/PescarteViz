import axios from 'axios';
import { fetchComunidadesSummary, fetchAllCommunities as fetchAllCommunitiesOriginal } from './communitiesApi';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

// PESCARTE data methods
export const fetchPescarteOverview = async () => {
  try {
    return await fetchComunidadesSummary();
  } catch (error) {
    console.error('Erro ao buscar visão geral do PESCARTE:', error);
    throw error;
  }
};

// Export only the functions that are actually needed for PESCARTE
export const fetchCommunityStatistics = async () => {
  try {
    const response = await axios.get(`${API_URL}/comunidades/stats`);
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar estatísticas de comunidades:', error);
    throw error;
  }
};

// Adicionar a função fetchAllCommunities
export const fetchAllCommunities = async () => {
  try {
    return await fetchAllCommunitiesOriginal();
  } catch (error) {
    console.error('Erro ao buscar todas as comunidades:', error);
    throw error;
  }
};
