// Update the predictions handling to handle limited data
export const fetchPredictions = async () => {
  try {
    const response = await axios.get(`${API_URL}/analytics/predictions`);
    
    // Handle the case where only current data exists
    if (response.data.predictions?.length === 0) {
      // Create a more user-friendly response
      return {
        current: response.data.current,
        predictions: [],
        hasHistoricalData: false,
        message: response.data.message || "Dados históricos insuficientes para realizar previsões."
      };
    }
    
    return {
      ...response.data,
      hasHistoricalData: true
    };
  } catch (error) {
    console.error('Error fetching predictions:', error);
    throw error;
  }
};