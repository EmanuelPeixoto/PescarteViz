import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { API_URL } from '../../config';
import axios from 'axios';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Correção para o ícone do Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png'
});

const CommunityCoordinatesAdmin = () => {
  const [communities, setCommunities] = useState([]);
  const [selectedMunicipality, setSelectedMunicipality] = useState('');
  const [municipalities, setMunicipalities] = useState([]);
  const [selectedCommunity, setSelectedCommunity] = useState(null);
  const [position, setPosition] = useState([-22.0, -41.5]); // Default position (Rio de Janeiro state)
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Carregar municípios
  useEffect(() => {
    const fetchMunicipalities = async () => {
      try {
        const response = await axios.get(`${API_URL}/municipios`);
        setMunicipalities(response.data);
      } catch (err) {
        console.error("Error fetching municipalities", err);
        setError("Erro ao carregar municípios");
      }
    };

    fetchMunicipalities();
  }, []);

  // Carregar comunidades quando selecionar um município
  useEffect(() => {
    const fetchCommunities = async () => {
      if (!selectedMunicipality) {
        setCommunities([]);
        return;
      }

      try {
        setLoading(true);
        const response = await axios.get(`${API_URL}/comunidades/${selectedMunicipality}`);
        setCommunities(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching communities", err);
        setError("Erro ao carregar comunidades");
        setLoading(false);
      }
    };

    fetchCommunities();
  }, [selectedMunicipality]);

  // Atualizar posição quando selecionar uma comunidade
  useEffect(() => {
    if (selectedCommunity) {
      const community = communities.find(c => c.id === parseInt(selectedCommunity));
      if (community && community.latitude && community.longitude) {
        setPosition([community.latitude, community.longitude]);
      }
    }
  }, [selectedCommunity, communities]);

  // Componente para capturar cliques no mapa
  const MapClickHandler = () => {
    useMapEvents({
      click: (e) => {
        if (selectedCommunity) {
          setPosition([e.latlng.lat, e.latlng.lng]);
        } else {
          alert("Selecione uma comunidade antes de definir as coordenadas");
        }
      }
    });
    return null;
  };

  // Salvar coordenadas
  const handleSaveCoordinates = async () => {
    if (!selectedCommunity) {
      setError("Selecione uma comunidade");
      return;
    }

    try {
      setLoading(true);
      await axios.put(`${API_URL}/comunidades/${selectedCommunity}/coordinates`, {
        latitude: position[0],
        longitude: position[1]
      });

      setMessage("Coordenadas salvas com sucesso!");
      
      // Atualizar a lista de comunidades
      const updatedCommunities = communities.map(c => {
        if (c.id === parseInt(selectedCommunity)) {
          return {
            ...c,
            latitude: position[0],
            longitude: position[1]
          };
        }
        return c;
      });
      
      setCommunities(updatedCommunities);
      setLoading(false);
      
      // Limpar a mensagem após 3 segundos
      setTimeout(() => {
        setMessage(null);
      }, 3000);
      
    } catch (err) {
      console.error("Error saving coordinates", err);
      setError("Erro ao salvar coordenadas: " + (err.response?.data?.error || err.message));
      setLoading(false);
    }
  };

  const handleMunicipalityChange = (e) => {
    setSelectedMunicipality(e.target.value);
    setSelectedCommunity(null);
  };

  const handleCommunityChange = (e) => {
    setSelectedCommunity(e.target.value);
  };

  return (
    <div className="coordinates-admin">
      <h2>Administração de Coordenadas Geográficas</h2>
      
      {error && <div className="error-message">{error}</div>}
      {message && <div className="success-message">{message}</div>}
      
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="municipality">Município:</label>
          <select 
            id="municipality" 
            value={selectedMunicipality} 
            onChange={handleMunicipalityChange}
            className="form-select"
          >
            <option value="">Selecione um município</option>
            {municipalities.map(municipality => (
              <option key={municipality.id} value={municipality.id}>
                {municipality.nome}
              </option>
            ))}
          </select>
        </div>
        
        <div className="form-group">
          <label htmlFor="community">Comunidade:</label>
          <select 
            id="community" 
            value={selectedCommunity || ''} 
            onChange={handleCommunityChange}
            className="form-select"
            disabled={!selectedMunicipality || loading}
          >
            <option value="">Selecione uma comunidade</option>
            {communities.map(community => (
              <option key={community.id} value={community.id}>
                {community.nome} {community.latitude ? '✓' : ''}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      <div className="map-container">
        <MapContainer 
          center={position} 
          zoom={12} 
          style={{ height: '500px', width: '100%', marginTop: '20px', borderRadius: '8px' }}
          key={position.join(',')} // Re-render map when position changes
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          <Marker position={position} />
          <MapClickHandler />
        </MapContainer>
      </div>
      
      <div className="coordinates-display">
        <p>Latitude: {position[0].toFixed(6)}</p>
        <p>Longitude: {position[1].toFixed(6)}</p>
      </div>
      
      <button 
        className="button-primary" 
        onClick={handleSaveCoordinates}
        disabled={!selectedCommunity || loading}
      >
        {loading ? 'Salvando...' : 'Salvar Coordenadas'}
      </button>
      
      <p className="help-text">
        Clique no mapa para definir a posição geográfica da comunidade selecionada.
      </p>
    </div>
  );
};

export default CommunityCoordinatesAdmin;