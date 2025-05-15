import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Tooltip } from 'react-leaflet';
import { Link } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Custom fishing boat icon
const fishingIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const CommunitiesMapModule = ({
  communities,
  title = "Localização das Comunidades Pesqueiras",
  height = "400px",
  showSearch = true
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Default center of the map (can be calculated dynamically)
  const defaultCenter = [-22.0, -41.0]; // Approximate center of the communities

  // Filter communities based on search term
  const filteredCommunities = communities.filter(community =>
    !searchTerm ||
    community.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    community.municipio_nome?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="communities-map-module">
      <h3>{title}</h3>

      {showSearch && (
        <div className="map-controls">
          <div className="search-geo-filter">
            <input
              type="text"
              placeholder="Buscar comunidade ou município..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="map-search-input"
            />
          </div>
        </div>
      )}

      <div className="map-wrapper" style={{ height, width: '100%' }}>
        {filteredCommunities.length > 0 ? (
          <MapContainer
            center={defaultCenter}
            zoom={7}
            style={{ height: '100%', width: '100%', borderRadius: '8px' }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />

            {filteredCommunities
              .filter(community => community.latitude && community.longitude)
              .map(community => (
                <Marker
                  key={community.id}
                  position={[parseFloat(community.latitude), parseFloat(community.longitude)]}
                  icon={fishingIcon}
                >
                  <Popup>
                    <div className="map-popup">
                      <h4>{community.nome}</h4>
                      <p><strong>Município:</strong> {community.municipio_nome}</p>
                      <p><strong>População:</strong> {parseInt(community.pessoas || 0).toLocaleString('pt-BR')}</p>
                      <p><strong>Pescadores:</strong> {parseInt(community.pescadores || 0).toLocaleString('pt-BR')}</p>
                      <Link to={`/community/${community.id}`} className="popup-link">
                        Ver detalhes
                      </Link>
                    </div>
                  </Popup>
                  <Tooltip>{community.nome}</Tooltip>
                </Marker>
              ))}
          </MapContainer>
        ) : (
          <div className="no-communities-message">
            Nenhuma comunidade encontrada com as coordenadas geográficas necessárias.
          </div>
        )}
      </div>
    </div>
  );
};

export default CommunitiesMapModule;
