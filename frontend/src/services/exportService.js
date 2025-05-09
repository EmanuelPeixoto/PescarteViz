import axios from 'axios';
import { saveAs } from 'file-saver';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

export const exportCommunityData = async (communityId, communityName) => {
  try {
    const response = await axios.get(`${API_URL}/export/community/${communityId}`, {
      responseType: 'blob'
    });
    
    const fileName = `comunidade_${communityName.replace(/ /g, '_')}.xlsx`;
    saveAs(new Blob([response.data]), fileName);
    
    return { success: true };
  } catch (error) {
    console.error('Export error:', error);
    return {
      success: false,
      error: 'Falha ao exportar dados. Por favor, tente novamente.'
    };
  }
};

export const exportMunicipalityData = async (municipalityId, municipalityName) => {
  try {
    const response = await axios.get(`${API_URL}/export/municipality/${municipalityId}`, {
      responseType: 'blob'
    });
    
    const fileName = `municipio_${municipalityName.replace(/ /g, '_')}.xlsx`;
    saveAs(new Blob([response.data]), fileName);
    
    return { success: true };
  } catch (error) {
    console.error('Export error:', error);
    return {
      success: false,
      error: 'Falha ao exportar dados. Por favor, tente novamente.'
    };
  }
};

export const exportAllData = async () => {
  try {
    const response = await axios.get(`${API_URL}/export/all`, {
      responseType: 'blob'
    });
    
    saveAs(new Blob([response.data]), 'pescarte_dados_completos.xlsx');
    
    return { success: true };
  } catch (error) {
    console.error('Export error:', error);
    return {
      success: false,
      error: 'Falha ao exportar todos os dados. Por favor, tente novamente.'
    };
  }
};