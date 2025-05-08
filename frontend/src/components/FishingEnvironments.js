import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

const FishingEnvironments = () => {
  const [environments, setEnvironments] = useState([]);
  const [newEnvironment, setNewEnvironment] = useState({ nome: '', descricao: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchEnvironments();
  }, []);

  const fetchEnvironments = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/ambientes-pesca`);
      setEnvironments(response.data);
      setLoading(false);
    } catch (err) {
      setError('Falha ao carregar ambientes de pesca');
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewEnvironment(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!newEnvironment.nome) {
      setError('Nome do ambiente é obrigatório');
      return;
    }

    try {
      await axios.post(`${API_URL}/ambientes-pesca`, newEnvironment);
      setNewEnvironment({ nome: '', descricao: '' });
      fetchEnvironments();
    } catch (err) {
      setError('Falha ao criar ambiente');
    }
  };

  if (loading) return <div className="loading">Carregando ambientes...</div>;

  return (
    <div className="environments-container">
      <h1>Ambientes de Pesca</h1>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit} className="environment-form">
        <h2>Adicionar Novo Ambiente</h2>

        <div className="form-group">
          <label htmlFor="nome">Nome:</label>
          <input
            type="text"
            id="nome"
            name="nome"
            value={newEnvironment.nome}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="descricao">Descrição:</label>
          <textarea
            id="descricao"
            name="descricao"
            value={newEnvironment.descricao}
            onChange={handleInputChange}
            rows="3"
          />
        </div>

        <button type="submit" className="submit-button">Adicionar Ambiente</button>
      </form>

      <div className="environments-list">
        <h2>Ambientes Existentes</h2>

        <table>
          <thead>
            <tr>
              <th>Nome</th>
              <th>Descrição</th>
            </tr>
          </thead>
          <tbody>
            {environments.map(env => (
              <tr key={env.id}>
                <td>{env.nome}</td>
                <td>{env.descricao || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FishingEnvironments;
