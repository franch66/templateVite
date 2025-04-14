import React, { useState, useEffect } from 'react';
import Encryptor from './Encryptor';
import Decryptor from './Decryptor';
import '../styles/ListUser.css';
import { Delnivtran } from './Delnivtran';
import { Updnivtran } from './Updnivtran';

const encryptionPassword = import.meta.env.VITE_ENCRYPTION_PASSWORD;

export const Listnivtran = ({ onAction }) => {
  const [fechaInicio, setFechaInicio] = useState('0001-01-01');
  const [fechaFin, setFechaFin] = useState('9999-12-31');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [encrypting, setEncrypting] = useState(false);
  const [decrypting, setDecrypting] = useState(false);
  const [encryptedResponse, setEncryptedResponse] = useState(null);
  const [selectedNivelId, setSelectedNivelId] = useState(null);
  const [selectedNivel, setSelectedNivel] = useState(null);

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
      const response = await fetch(`${import.meta.env.VITE_API_URL}/listnivtran`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token
        },
        body: JSON.stringify(encryptedBody)
      });

      const responseData = await response.json();

      // Manejo específico de códigos de estado
      if (response.status === 401) {
        throw new Error('Usuario no autorizado');
      }
      
      if (response.status === 400) {
        setData([]);
        throw new Error('No hay datos para mostrar');
      }

      if (!response.ok) {
        throw new Error(responseData.message || `Error HTTP: ${response.status}`);
      }

      // Solo procesar si la respuesta es 201
      if (response.status === 201) {
        setEncryptedResponse(responseData);
      }
    } catch (err) {
      setError(err.message);
      console.error('API Error:', err);
      setEncryptedResponse(null); // Limpiar respuesta encriptada
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setEncrypting(true);
  };
  
  const refreshData = () => {
    handleSearch(new Event('submit'));
  };

  return (
    <div className="buscador-grid-container">
      <form className="search-form" onSubmit={handleSearch}>
        <div className="input-group">
          <label>Fecha Inicio:</label>
          <input
            type="date"
            value={fechaInicio}
            onChange={(e) => setFechaInicio(e.target.value || '0001-01-01')}
            min="0001-01-01"
          />
        </div>
        
        <div className="input-group">
          <label>Fecha Fin:</label>
          <input
            type="date"
            value={fechaFin}
            onChange={(e) => setFechaFin(e.target.value || '9999-12-31')}
            max="9999-12-31"
          />
        </div>
        <div className="button-group">               
          <button type="submit" disabled={loading}>
            {loading ? 'Cargando...' : 'Buscar Niveles'}
          </button>
          <button 
            type="button" 
            className="secondary-button"
            onClick={() => onAction('Regnivtran')}
          >
            ➕ Agregar Nivel
          </button>
        </div> 
        
        
      </form>

      {encrypting && (
        <Encryptor
          password={encryptionPassword}
          message={JSON.stringify({
            fecha_inicio: fechaInicio,
            fecha_fin: fechaFin
          })}
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
              setData(JSON.parse(result));
            } catch (err) {
              setError('Error al procesar los datos de niveles');
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
                <th>Acciones</th>
                <th>ID</th>
                <th>Servicio</th>
                <th>Nivel</th>
                <th>Fecha Alta</th>
                <th>Usuario Alta</th>
              </tr>
            </thead>
            <tbody>
              {data.map((nivel) => (
                <tr key={nivel.id}>
                  <td>
                  <button 
                      className="edit-button"
                      onClick={() => setSelectedNivel(nivel)}
                    >
                      ✏️ Editar
                    </button>                    
                    <button 
                      className="delete-button"
                      onClick={() => setSelectedNivelId(nivel.id)}
                    >
                      🗑️ Eliminar
                    </button>
                  </td>
                  <td>{nivel.id}</td>
                  <td>{nivel.Servicio}</td>
                  <td>{nivel.nivel}</td>
                  <td>{new Date(nivel.fecha_alta).toLocaleDateString()}</td>
                  <td>{nivel.usuario_alt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {selectedNivel && (
        <Updnivtran
          nivelData={selectedNivel}
          onSuccess={() => {
            refreshData();
            setSelectedNivel(null);
          }}
          onClose={() => setSelectedNivel(null)}
        />
      )}      
      {selectedNivelId && (
        <Delnivtran
          nivelId={selectedNivelId}
          onSuccess={() => {
            refreshData();
            setSelectedNivelId(null);
          }}
          onClose={() => setSelectedNivelId(null)}
        />
      )}      
    </div>
  );  
};