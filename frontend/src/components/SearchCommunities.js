import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchAllCommunities } from '../services/communitiesApi';

const SearchCommunities = () => {
  const [query, setQuery] = useState('');
  const [communities, setCommunities] = useState([]);
  const [filteredCommunities, setFilteredCommunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadCommunities = async () => {
      try {
        setLoading(true);
        const data = await fetchAllCommunities();
        setCommunities(data);
        setLoading(false);
      } catch (err) {
        setError('Falha ao carregar comunidades: ' + err.message);
        setLoading(false);
      }
    };

    loadCommunities();
  }, []);

  useEffect(() => {
    if (query.trim() === '') {
      setFilteredCommunities([]);
      return;
    }

    const results = communities.filter(community =>
      community.nome.toLowerCase().includes(query.toLowerCase()) ||
      community.municipio_nome.toLowerCase().includes(query.toLowerCase())
    );

    setFilteredCommunities(results.slice(0, 10)); // Limit to 10 results
  }, [query, communities]);

  const handleQueryChange = (e) => {
    setQuery(e.target.value);
  };

  // Add this function to provide a better search experience
  const highlightMatch = (text, query) => {
    if (!query.trim()) return text;

    const regex = new RegExp(`(${query.trim()})`, 'gi');
    const parts = text.split(regex);

    return parts.map((part, index) =>
      regex.test(part) ? <mark key={index}>{part}</mark> : part
    );
  };

  return (
    <div className="search-component">
      <div className="search-container">
        <input
          type="text"
          placeholder="Buscar comunidades..."
          value={query}
          onChange={handleQueryChange}
          className="search-input"
        />
        {query.trim() !== '' && (
          <button
            className="clear-search"
            onClick={() => setQuery('')}
            aria-label="Clear search"
          >
            ×
          </button>
        )}
      </div>

      {loading && <div className="search-loading">Carregando...</div>}
      {error && <div className="search-error">{error}</div>}

      {filteredCommunities.length > 0 && (
        <div className="search-results">
          {filteredCommunities.map(community => (
            <Link
              key={community.id}
              to={`/community/${community.id}`}
              className="search-result-item"
            >
              <span className="result-name">
                {highlightMatch(community.nome, query)}
              </span>
              <span className="result-municipality">
                {highlightMatch(community.municipio_nome, query)}
              </span>
            </Link>
          ))}
        </div>
      )}

      {query.trim() !== '' && filteredCommunities.length === 0 && !loading && (
        <div className="no-results">Nenhuma comunidade encontrada</div>
      )}
    </div>
  );
};

export default SearchCommunities;
