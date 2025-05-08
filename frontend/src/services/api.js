import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

export const fetchSalesByCategory = async () => {
  try {
    const response = await axios.get(`${API_URL}/sales/by-category`);
    return response.data;
  } catch (error) {
    console.error('Error fetching sales by category:', error);
    throw error;
  }
};

export const fetchMonthlySales = async () => {
  try {
    const response = await axios.get(`${API_URL}/sales/monthly`);
    return response.data;
  } catch (error) {
    console.error('Error fetching monthly sales:', error);
    throw error;
  }
};

export const fetchProductInventory = async () => {
  try {
    const response = await axios.get(`${API_URL}/products/inventory`);
    return response.data;
  } catch (error) {
    console.error('Error fetching product inventory:', error);
    throw error;
  }
};

export const fetchRecentSales = async () => {
  try {
    const response = await axios.get(`${API_URL}/sales/recent`);
    return response.data;
  } catch (error) {
    console.error('Error fetching recent sales:', error);
    throw error;
  }
};
