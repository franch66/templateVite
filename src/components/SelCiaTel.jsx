import React, { useState, useEffect } from 'react';
import Encryptor from './Encryptor';
import Decryptor from './Decryptor';
import '../styles/SelCiaTel.css';
const encryptionPassword = import.meta.env.VITE_ENCRYPTION_PASSWORD;

export const SelCiaTel = () => {
  const [operador, setOperador] = useState('');
  const [categoria, setCategoria] = useState('');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
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
    if (!token || token === 'undefined') {
      setError('Token de autenticación inválido');
      setLoading(false);
      return;
    }
  
    try {
      const requestConfig = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token
        },
        body: JSON.stringify(encryptedBody)
      };
  
      const response = await fetch(`${import.meta.env.VITE_API_URL}/selCiaTel`, requestConfig);
      
      // Manejo de errores HTTP
      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch (jsonError) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
  
        // Extracción del mensaje de error específico
        let errorMessage = 'Error desconocido';
        if (response.status === 400 || response.status === 401) {
          errorMessage = Array.isArray(errorData) 
            ? errorData[0]?.response 
            : errorData?.response || errorMessage;
        } else {
          errorMessage = errorData.message || `Error HTTP: ${response.status}`;
        }
  
        throw new Error(errorMessage);
      }
  
      const responseData = await response.json();
      setEncryptedResponse(responseData);
    } catch (err) {
      console.error('[API ERROR]', err);
      // Manejo específico para errores de autenticación
      if (err.message.includes('401')) {
        setError('Sesión expirada o no autorizada');
      } else if (err.message.includes('400')) {
        setError('Solicitud incorrecta: ' + err.message);
      } else {
        setError(err.message || 'Error al obtener datos');
      }
    } finally {
      setLoading(false); // Asegura resetear el estado de carga
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setEncrypting(true);
  };

  return (
    <div className="buscador-grid-container">
      <form className="search-form" onSubmit={handleSearch}>
        <div className="input-group">
          <label>Operador:</label>
          <input type="text" value={operador} onChange={(e) => setOperador(e.target.value)} placeholder="Ej: ALL" />
        </div>
        <div className="input-group">
          <label>Categoría:</label>
          <input type="text" value={categoria} onChange={(e) => setCategoria(e.target.value)} placeholder="Ej: Entretenimiento" />
        </div>
        <button type="submit" disabled={loading}>{loading ? 'Buscando...' : 'Buscar'}</button>
      </form>

      {encrypting && (
        <Encryptor 
          password={encryptionPassword}
          message={JSON.stringify({ operador: operador || 'ALL', categoria: categoria || '' })}
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
            //console.log('[DECRYPTED RESPONSE]', result);
            setDecrypting(false);
            try {
              setData(JSON.parse(result));
            } catch (err) {
              setError('Error al procesar los datos descifrados');
            }
          }}
          onError={(errorMsg) => {
            setError(errorMsg);
            setDecrypting(false);
          }}
        />
      )}

      {error && <div className="error-message">{error}</div>}

      {data.length > 0 && (
        <div className="grid-container">
          <table>
            <thead>
              <tr>
                <th>Operador</th>
                <th>Categoría</th>
                <th>Descripción</th>
                <th>Precio</th>
                <th>Comisión</th>
                <th>SKU</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item, index) => (
                <tr key={index}>
                  <td>{item.operador}</td>
                  <td>{item.categoria}</td>
                  <td>{item.descripcion}</td>
                  <td>${item.precio?.toFixed(2)}</td>
                  <td>{item.pc_porcentaje_comision}%</td>
                  <td>{item.sku_id}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
