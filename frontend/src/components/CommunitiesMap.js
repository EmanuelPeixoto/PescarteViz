// In src/components/CommunitiesMap.js
import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Link } from 'react-router-dom';
import L from 'leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';

// Fix for Leaflet marker icons
useEffect(() => {
  // This code should run after component mounts to fix Leaflet icon issues
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconUrl: require('leaflet/dist/images/marker-icon.png'),
    iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
    shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
  });
}, []);

const CommunitiesMap = ({ communities }) => {
  // Default center on Campos dos Goytacazes region
  const defaultPosition = [-21.7545, -41.3244];

  // Create custom icon for fishing communities
  const customIcon = new L.Icon({
    iconUrl: require('../assets/fishing-marker.png'),
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -30]
  });

  // Add this check to ensure we have valid communities array
  if (!communities || communities.length === 0) {
    return (
      <div className="map-container empty-map">
        <div className="map-placeholder">
          <h3>Nenhuma comunidade com coordenadas geográficas disponíveis</h3>
          <p>Adicione coordenadas às comunidades para visualizá-las no mapa.</p>
        </div>
      </div>
    );
  }

  // Filter communities with valid coordinates
  const communitiesWithCoords = communities.filter(
    community => community.latitude && community.longitude
  );

  if (communitiesWithCoords.length === 0) {
    return (
      <div className="map-container empty-map">
        <div className="map-placeholder">
          <h3>Nenhuma comunidade com coordenadas geográficas disponíveis</h3>
          <p>Adicione coordenadas às comunidades para visualizá-las no mapa.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="map-container">
      <MapContainer
        center={defaultPosition}
        zoom={8}
        style={{ height: '600px', width: '100%', borderRadius: '8px' }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <MarkerClusterGroup>
          {communitiesWithCoords.map(community => (
            <Marker
              key={community.id}
              position={[community.latitude, community.longitude]}
              icon={customIcon}
            >
              <Popup>
                <div className="map-popup">
                  <h3>{community.nome}</h3>
                  <p>Pescadores: {community.pescadores}</p>
                  <p>População: {community.pessoas}</p>
                  <Link to={`/community/${community.id}`} className="view-details-link">
                    Ver detalhes
                  </Link>
                </div>
              </Popup>
            </Marker>
          ))}
        </MarkerClusterGroup>
      </MapContainer>
    </div>
  );
};

export default CommunitiesMap;