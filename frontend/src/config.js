// Arquivo de configuração central para o frontend

// URL da API baseada em variáveis de ambiente ou fallback para localhost
export const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

// Adicione outras configurações conforme necessário
export const MAP_DEFAULT_CENTER = [-21.5, -41.0]; // Centro da Bacia de Campos
export const MAP_DEFAULT_ZOOM = 8;