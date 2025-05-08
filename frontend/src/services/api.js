import axios from 'axios';
import { fetchComunidadesSummary } from './communitiesApi';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

// Adaptado para usar dados do PESCARTE em vez de vendas
export const fetchPescarteOverview = async () => {
  try {
    // Reutilizamos a função existente para dados de comunidades
    return await fetchComunidadesSummary();
  } catch (error) {
    console.error('Erro ao buscar visão geral do PESCARTE:', error);
    throw error;
  }
};

// Manter métodos existentes para compatibilidade
export const fetchSalesByCategory = async () => {
  return fetchPescarteOverview();
};

export const fetchMonthlySales = async () => {
  return fetchPescarteOverview();
};

export const fetchProductInventory = async () => {
  return fetchPescarteOverview();
};

export const fetchRecentSales = async () => {
  return fetchPescarteOverview();
};
