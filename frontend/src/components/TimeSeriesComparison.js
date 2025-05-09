// In src/components/TimeSeriesComparison.js
import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

const TimeSeriesComparison = () => {
  const [timeSeriesData, setTimeSeriesData] = useState([]);
  const [selectedCommunity, setSelectedCommunity] = useState('');
  const [communities, setCommunities] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Fetch communities for dropdown
  useEffect(() => {
    const fetchAllCommunities = async () => {
      try {
        const response = await axios.get(`${API_URL}/comunidades/all`);
        setCommunities(response.data);
      } catch (err) {
        console.error("Failed to fetch communities:", err);
      }
    };
    
    fetchAllCommunities();
  }, []);
  
  // Fetch time series data when community is selected
  useEffect(() => {
    const fetchTimeSeries = async () => {
      if (!selectedCommunity) return;
      
      setLoading(true);
      try {
        const response = await axios.get(
          `${API_URL}/comunidades/timeseries/${selectedCommunity}`
        );
        setTimeSeriesData(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch time series data:", err);
        setLoading(false);
      }
    };
    
    fetchTimeSeries();
  }, [selectedCommunity]);
  
  // Chart configuration
  const chartData = {
    labels: timeSeriesData.map(d => d.ano),
    datasets: [
      {
        label: 'População Total',
        data: timeSeriesData.map(d => d.pessoas),
        borderColor: 'rgba(54, 162, 235, 1)',
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        fill: false,
        tension: 0.4
      },
      {
        label: 'Pescadores',
        data: timeSeriesData.map(d => d.pescadores),
        borderColor: 'rgba(255, 99, 132, 1)',
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        fill: false,
        tension: 0.4
      }
    ]
  };
  
  return (
    <div className="time-series-container">
      <h2>Evolução Temporal</h2>
      
      <div className="form-group">
        <label>Selecione uma Comunidade:</label>
        <select 
          value={selectedCommunity}
          onChange={(e) => setSelectedCommunity(e.target.value)}
        >
          <option value="">Selecione uma comunidade</option>
          {communities.map(c => (
            <option key={c.id} value={c.id}>{c.nome}</option>
          ))}
        </select>
      </div>
      
      {loading ? (
        <div className="loading">Carregando dados...</div>
      ) : timeSeriesData.length > 0 ? (
        <div className="chart-container">
          <Line data={chartData} options={{
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              y: {
                beginAtZero: true
              }
            }
          }} />
        </div>
      ) : (
        selectedCommunity && <div>Nenhum dado histórico disponível para esta comunidade</div>
      )}
    </div>
  );
};

export default TimeSeriesComparison;