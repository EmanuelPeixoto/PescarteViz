import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchComunidadesByMunicipio, fetchMunicipios } from '../services/communitiesApi';

const CommunitiesTable = () => {
  const [municipalities, setMunicipalities] = useState([]);
  const [communities, setCommunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMunicipality, setSelectedMunicipality] = useState('');
  
  useEffect(() => {
    const loadMunicipalities = async () => {
      try {
        const municData = await fetchMunicipios();
        setMunicipalities(municData);
      } catch (err) {
        setError('Falha ao carregar municípios');
      }
    };
    
    loadMunicipalities();
  }, []);
  
  useEffect(() => {
    const loadAllCommunities = async () => {
      try {
        setLoading(true);
        const allCommunities = [];
        
        if (selectedMunicipality) {
          const comData = await fetchComunidadesByMunicipio(selectedMunicipality);
          setCommunities(comData);
        } else {
          // If no municipality is selected, fetch all communities from all municipalities
          for (const municipality of municipalities) {
            const comData = await fetchComunidadesByMunicipio(municipality.id);
            allCommunities.push(...comData.map(com => ({
              ...com,
              municipio_nome: municipality.nome
            })));
          }
          setCommunities(allCommunities);
        }
        
        setLoading(false);
      } catch (err) {
        setError('Falha ao carregar comunidades');
        setLoading(false);
      }
    };
    
    if (municipalities.length > 0) {
      loadAllCommunities();
    }
  }, [municipalities, selectedMunicipality]);
  
  const filteredCommunities = communities.filter(com => 
    com.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  return (
    <div className="communities-table-container">
      <h1>Todas as Comunidades</h1>
      
      <div className="filters-container">
        <div className="search-filter">
          <input 
            type="text"
            placeholder="Buscar comunidade..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="municipality-filter">
          <select 
            value={selectedMunicipality}
            onChange={(e) => setSelectedMunicipality(e.target.value)}
          >
            <option value="">Todos os Municípios</option>
            {municipalities.map(munic => (
              <option key={munic.id} value={munic.id}>{munic.nome}</option>
            ))}
          </select>
        </div>
      </div>
      
      {loading ? (
        <div className="loading">Carregando comunidades...</div>
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : (
        <div className="communities-table">
          <table>
            <thead>
              <tr>
                <th>Comunidade</th>
                <th>Município</th>
                <th>População</th>
                <th>Pescadores</th>
                <th>% Pescadores</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredCommunities.map(com => (
                <tr key={com.id}>
                  <td>{com.nome}</td>
                  <td>{com.municipio_nome}</td>
                  <td>{com.pessoas}</td>
                  <td>{com.pescadores}</td>
                  <td>{((com.pescadores / com.pessoas) * 100).toFixed(1)}%</td>
                  <td>
                    <Link to={`/community/${com.id}`} className="button-secondary">Detalhes</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredCommunities.length === 0 && (
            <div className="no-results">Nenhuma comunidade encontrada</div>
          )}
        </div>
      )}
    </div>
  );
};

export default CommunitiesTable;