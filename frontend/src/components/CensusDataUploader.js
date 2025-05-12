import React, { useState } from 'react';
import axios from 'axios';
import { API_URL } from '../services/api';

const CensusDataUploader = () => {
  const [file, setFile] = useState(null);
  const [year, setYear] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [preview, setPreview] = useState([]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    
    // Preview file
    if (selectedFile) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        const text = evt.target.result;
        const lines = text.split('\n').slice(0, 6); // First 5 lines for preview
        setPreview(lines);
      };
      reader.readAsText(selectedFile);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!file || !year) {
      setError('Por favor, selecione um arquivo e especifique o ano do censo.');
      return;
    }
    
    setLoading(true);
    setError('');
    setMessage('');
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('year', year);
    
    try {
      const response = await axios.post(`${API_URL}/upload/csv/census`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      setMessage(`Dados do censo para o ano ${year} importados com sucesso! ${response.data.recordsImported} registros importados.`);
    } catch (err) {
      setError(`Erro ao importar arquivo: ${err.response?.data?.error || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="data-uploader-container">
      <h2>Importar Dados de Censo Histórico</h2>
      <p>
        Carregue arquivos CSV com dados de censos de anos anteriores.
        O formato deve seguir o padrão: comunidade_id, pessoas, familias, pescadores.
      </p>
      
      {error && <div className="error-message">{error}</div>}
      {message && <div className="success-message">{message}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Ano do Censo:</label>
          <input 
            type="number" 
            value={year} 
            onChange={(e) => setYear(e.target.value)}
            min="1990" 
            max={new Date().getFullYear() - 1}
            required
          />
        </div>
        
        <div className="form-group">
          <label>Arquivo CSV:</label>
          <input 
            type="file" 
            accept=".csv" 
            onChange={handleFileChange}
            required
          />
        </div>
        
        <button type="submit" disabled={loading}>
          {loading ? 'Importando...' : 'Importar Dados'}
        </button>
      </form>
      
      {preview.length > 0 && (
        <div className="file-preview">
          <h3>Prévia do arquivo:</h3>
          <pre>{preview.join('\n')}</pre>
        </div>
      )}
      
      <div className="csv-format-guide">
        <h3>Formato esperado do CSV:</h3>
        <pre>
          comunidade_id,pessoas,familias,pescadores
          1,850,305,455
          2,185,67,92
          ...
        </pre>
      </div>
    </div>
  );
};

export default CensusDataUploader;