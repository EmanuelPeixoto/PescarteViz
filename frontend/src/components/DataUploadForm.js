import React, { useState, useEffect } from 'react';
import { fetchMunicipios, fetchComunidadesByMunicipio } from '../services/communitiesApi';
import axios from 'axios';
import LocalityDataUploader from './LocalityDataUploader';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

const DataUploadForm = () => {
  const [municipios, setMunicipios] = useState([]);
  const [comunidades, setComunidades] = useState([]);
  const [selectedMunicipio, setSelectedMunicipio] = useState('');
  const [selectedComunidade, setSelectedComunidade] = useState('');
  const [dataType, setDataType] = useState('demograficos');
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadMunicipios = async () => {
      try {
        const data = await fetchMunicipios();
        setMunicipios(data);
      } catch (err) {
        setError('Falha ao carregar municípios');
        console.error(err);
      }
    };

    loadMunicipios();
  }, []);

  useEffect(() => {
    const loadComunidades = async () => {
      if (!selectedMunicipio) {
        setComunidades([]);
        return;
      }

      try {
        const data = await fetchComunidadesByMunicipio(selectedMunicipio);
        setComunidades(data);
      } catch (err) {
        setError('Falha ao carregar comunidades');
        console.error(err);
      }
    };

    loadComunidades();
  }, [selectedMunicipio]);

  const handleMunicipioChange = (e) => {
    setSelectedMunicipio(e.target.value);
    setSelectedComunidade('');
  };

  const handleComunidadeChange = (e) => {
    setSelectedComunidade(e.target.value);
  };

  const handleDataTypeChange = (e) => {
    setDataType(e.target.value);
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedComunidade || !file) {
      setError('Por favor, selecione uma comunidade e um arquivo');
      return;
    }

    setError(null);
    setMessage(null);
    setUploading(true);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('comunidadeId', selectedComunidade);
    formData.append('dataType', dataType);

    try {
      const response = await axios.post(`${API_URL}/upload/csv/${dataType}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setMessage(`Upload realizado com sucesso! ${response.data.recordsImported} registros importados.`);
    } catch (err) {
      console.error('Erro de upload:', err);
      setError(err.response?.data?.error || 'Falha ao carregar dados');
    } finally {
      setUploading(false);
    }
  };

  // Adicionar opção de download do modelo CSV para o formulário
  const downloadTemplate = (dataType) => {
    let headers = [];

    if (dataType === 'demograficos') {
      headers = ['faixa_etaria', 'genero', 'cor', 'profissao', 'renda_mensal', 'quantidade'];
    } else if (dataType === 'ambientes') {
      headers = ['ambiente_nome', 'descricao'];
    }

    const csvContent = headers.join(',') + '\n';
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `modelo_${dataType}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="data-upload-container">
      <div className="upload-form-container">
        <h2>Importar Dados da Comunidade</h2>

        {message && <div className="message success">{message}</div>}
        {error && <div className="message error">{error}</div>}

        <form onSubmit={handleSubmit} className="upload-form">
          <div className="form-group">
            <label htmlFor="municipio">Município:</label>
            <select
              id="municipio"
              value={selectedMunicipio}
              onChange={handleMunicipioChange}
              required
            >
              <option value="">Selecione o Município</option>
              {municipios.map(mun => (
                <option key={mun.id} value={mun.id}>{mun.nome}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="comunidade">Comunidade:</label>
            <select
              id="comunidade"
              value={selectedComunidade}
              onChange={handleComunidadeChange}
              disabled={!selectedMunicipio}
              required
            >
              <option value="">Selecione a Comunidade</option>
              {comunidades.map(com => (
                <option key={com.id} value={com.id}>{com.nome}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="dataType">Tipo de Dados:</label>
            <select
              id="dataType"
              value={dataType}
              onChange={handleDataTypeChange}
              required
            >
              <option value="demograficos">Dados Demográficos</option>
              <option value="ambientes">Ambientes de Pesca</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="csvFile">Arquivo CSV:</label>
            <input
              type="file"
              id="csvFile"
              accept=".csv"
              onChange={handleFileChange}
              required
            />
          </div>

          <button type="submit" disabled={uploading} className="upload-button">
            {uploading ? 'Enviando...' : 'Importar Dados'}
          </button>
        </form>

        <button onClick={() => downloadTemplate(dataType)} className="download-template-button">
          Baixar Modelo CSV
        </button>

        <div className="upload-instructions">
          <h3>Diretrizes de Formato CSV</h3>
          <p>Seu arquivo CSV deve conter as seguintes colunas:</p>

          {dataType === 'demograficos' ? (
            <ul>
              <li><strong>faixa_etaria</strong> - Faixa etária (ex.: "18-25", "26-35")</li>
              <li><strong>genero</strong> - Gênero</li>
              <li><strong>cor</strong> - Etnia/raça</li>
              <li><strong>profissao</strong> - Profissão</li>
              <li><strong>renda_mensal</strong> - Renda mensal (numérico)</li>
              <li><strong>quantidade</strong> - Número de pessoas nesta categoria</li>
            </ul>
          ) : (
            <ul>
              <li><strong>ambiente_nome</strong> - Nome do ambiente de pesca</li>
              <li><strong>descricao</strong> - Descrição do ambiente</li>
            </ul>
          )}
        </div>
      </div>

      <div className="upload-section">
        <LocalityDataUploader />
      </div>
    </div>
  );
};

export default DataUploadForm;
