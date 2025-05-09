import React, { useState } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

const CommunityLocationEditor = ({ community, onSave }) => {
  const [position, setPosition] = useState([
    community.latitude || -21.7545, 
    community.longitude || -41.3244
  ]);
  const [saving, setSaving] = useState(false);
  
  const LocationMarker = () => {
    const map = useMapEvents({
      click(e) {
        setPosition([e.latlng.lat, e.latlng.lng]);
      }
    });
    
    return position ? (
      <Marker position={position} />
    ) : null;
  };
  
  const handleSave = async () => {
    try {
      setSaving(true);
      await axios.put(`${API_URL}/comunidades/${community.id}/location`, {
        latitude: position[0],
        longitude: position[1]
      });
      onSave && onSave(position);
      setSaving(false);
    } catch (error) {
      console.error('Error saving location:', error);
      setSaving(false);
    }
  };
  
  return (
    <div className="location-editor">
      <h3>Posição Geográfica - {community.nome}</h3>
      <div className="map-container" style={{ height: '400px' }}>
        <MapContainer 
          center={position} 
          zoom={12} 
          style={{ height: '100%', width: '100%' }}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <LocationMarker />
        </MapContainer>
      </div>
      
      <div className="coordinates-display">
        <p>Latitude: {position[0].toFixed(6)}</p>
        <p>Longitude: {position[1].toFixed(6)}</p>
      </div>
      
      <button 
        className="button-primary" 
        onClick={handleSave}
        disabled={saving}>
        {saving ? 'Salvando...' : 'Salvar Posição'}
      </button>
      <p className="help-text">Clique no mapa para definir a localização.</p>
    </div>
  );
};

export default CommunityLocationEditor;