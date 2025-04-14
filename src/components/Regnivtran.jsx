import React, { useState, useEffect } from 'react';
import Encryptor from './Encryptor';
import Decryptor from './Decryptor';
import '../styles/Reguser.css';

const encryptionPassword = import.meta.env.VITE_ENCRYPTION_PASSWORD;

export const Regnivtran = () => {
  const [formData, setFormData] = useState({
    Servicio: '',
    nivel: '1'
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [encrypting, setEncrypting] = useState(false);
  const [decrypting, setDecrypting] = useState(false);
  const [encryptedResponse, setEncryptedResponse] = useState(null);

  useEffect(() => {
    if (encryptedResponse) {
      setDecrypting(true);
    }
  }, [encryptedResponse]);

  const handleEncryptedData = async (encryptedBody) => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      setError('Token de autenticación inválido');
      setLoading(false);
      return;
    }
  
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/regnivtran`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token
        },
        body: JSON.stringify(encryptedBody)
      });
  
      let responseData;
      try {
        responseData = await response.json();
      } catch (jsonError) {
        throw new Error('Formato de respuesta inválido del servidor');
      }
  
      if (!response.ok) {
        let errorMessage = 'Error desconocido';
        
        // Manejo específico para 400 y 401
        if (response.status === 400 || response.status === 401) {
          errorMessage = Array.isArray(responseData) 
            ? responseData[0]?.response 
            : responseData?.response || errorMessage;
        }
        
        throw new Error(errorMessage);
      }
  
      setEncryptedResponse(responseData);
    } catch (err) {
      setError(err.message || 'Error en la comunicación con el servidor');
    } finally {
      setLoading(false); // Asegura resetear el loading en todos los casos
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    setEncrypting(true);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };
  
  return (
    <div className="buscador-grid-container">
      <form className="search-form" onSubmit={handleSubmit}>
        <div className="input-group">
          <label>Servicio:</label>
          <input
            type="text"
            name="Servicio"
            value={formData.Servicio}
            onChange={handleChange}
            required
          />
        </div>

        <div className="input-group">
          <label>Nivel:</label>
          <select
            name="nivel"
            value={formData.nivel}
            onChange={handleChange}
          >
            <option value="0">0 - Web</option>
            <option value="1">1 - Básico</option>
            <option value="2">2 - Intermedio</option>
            <option value="3">3 - Administrador</option>
          </select>
        </div>

        <button type="submit" disabled={loading}>
          {loading ? 'Procesando...' : 'REGISTRAR'}
        </button>
      </form>

      {encrypting && (
        <Encryptor
          password={encryptionPassword}
          message={JSON.stringify(formData)}
          onEncrypted={(result) => {
            setEncrypting(false);
            handleEncryptedData(result);
          }}
          onError={(errorMsg) => {
            setError(errorMsg);
            setEncrypting(false);
            setLoading(false);
          }}
        />
      )}
        
      {decrypting && encryptedResponse && (
        <Decryptor
          password={encryptionPassword}
          encryptedMessage={encryptedResponse}
          onDecrypted={(result) => {
            setDecrypting(false);
            try {
              const parsedData = JSON.parse(result);
              if (parsedData[0]?.response === 'Exito') {
                setSuccess('Nivel registrado exitosamente');
                setFormData({
                  Servicio: '',
                  nivel: '1'
                });
              } else {
                setError(`Respuesta inesperada: ${JSON.stringify(parsedData)}`);
              }
            } catch (err) {
              setError('Error al interpretar respuesta del servidor');
            }
          }}
          onError={(errorMsg) => {
            setError(errorMsg);
            setDecrypting(false);
          }}
        />
      )}

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}
    </div>
  );
};