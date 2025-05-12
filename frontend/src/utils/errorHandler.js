/**
 * Utility function to handle API errors consistently across the application
 */
export const handleApiError = (error) => {
  console.error('API Error:', error);
  
  // Extract the most useful error message
  let errorMessage = 'Erro no servidor';
  
  if (error.response) {
    // The server responded with a status code outside the 2xx range
    if (error.response.data && error.response.data.error) {
      errorMessage = `Erro: ${error.response.data.error}`;
    } else {
      errorMessage = `Erro ${error.response.status}: ${error.response.statusText}`;
    }
  } else if (error.request) {
    // The request was made but no response was received
    errorMessage = 'Servidor não respondeu. Verifique sua conexão.';
  } else {
    // Something happened in setting up the request
    errorMessage = error.message;
  }
  
  return errorMessage;
};