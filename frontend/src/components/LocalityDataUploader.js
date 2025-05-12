import React, { useState } from 'react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

const LocalityDataUploader = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [preview, setPreview] = useState(null);

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    setPreview(null);
    setError(null);
    
    // If CSV file, show preview
    if (selectedFile && selectedFile.name.endsWith('.csv')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target.result;
        // Parse and preview first 5 lines
        const lines = content.split('\n').slice(0, 6);
        setPreview(lines);
      };
      reader.readAsText(selectedFile);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    
    if (!file) {
      setError('Por favor, selecione um arquivo para upload.');
      return;
    }
    
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const response = await axios.post(`${API_URL}/upload/csv/localities`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      setSuccess(`Upload concluído com sucesso! ${response.data.recordsImported} localidades importadas.`);
      setFile(null);
      setPreview(null);
      document.getElementById('locality-file-input').value = '';
    } catch (err) {
      console.error('Upload error:', err);
      setError(`Erro no upload: ${err.response?.data?.error || err.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="data-upload-section">
      <h2>Importar Dados de Localidades</h2>
      
      <div className="upload-guidelines">
        <h3>Diretrizes para o arquivo CSV:</h3>
        <ul>
          <li>O arquivo deve estar no formato CSV (valores separados por vírgula).</li>
          <li>Colunas esperadas: <code>MUNICIPIO</code>, <code>COMUNIDADE</code>, <code>LOCALIDADE</code>.</li>
          <li>O nome do município e comunidade devem corresponder aos registros existentes.</li>
          <li>A primeira linha deve conter os nomes das colunas.</li>
        </ul>
      </div>
      
      <form onSubmit={handleUpload} className="upload-form">
        <div className="file-input-group">
          <label htmlFor="locality-file-input" className="file-input-label">
            Selecionar Arquivo CSV
          </label>
          <input
            type="file"
            id="locality-file-input"
            accept=".csv"
            onChange={handleFileSelect}
            className="file-input"
          />
          <span className="file-name">
            {file ? file.name : 'Nenhum arquivo selecionado'}
          </span>
        </div>
        
        <button 
          type="submit" 
          className="button-primary" 
          disabled={loading || !file}
        >
          {loading ? 'Importando...' : 'Importar Localidades'}
        </button>
      </form>
      
      {error && (
        <div className="error-message">
          <i className="fas fa-exclamation-circle"></i>
          {error}
        </div>
      )}
      
      {success && (
        <div className="success-message">
          <i className="fas fa-check-circle"></i>
          {success}
        </div>
      )}
      
      {preview && preview.length > 0 && (
        <div className="csv-preview">
          <h3>Pré-visualização do arquivo:</h3>
          <div className="preview-table-container">
            <table className="preview-table">
              <thead>
                <tr>
                  {preview[0].split(',').map((column, i) => (
                    <th key={i}>{column.trim()}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {preview.slice(1).map((line, i) => (
                  <tr key={i}>
                    {line.split(',').map((cell, j) => (
                      <td key={j}>{cell.trim()}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default LocalityDataUploader;