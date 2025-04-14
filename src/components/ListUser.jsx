import React, { useState, useEffect } from 'react';
import Encryptor from './Encryptor';
import Decryptor from './Decryptor';
import { Delusr } from './Delusr';
import { Updusr } from './Updusr';
import '../styles/ListUser.css';

const encryptionPassword = import.meta.env.VITE_ENCRYPTION_PASSWORD;

export const ListUser = ({ onAction }) => {
  const [fechaInicio, setFechaInicio] = useState('0001-01-01');
  const [fechaFin, setFechaFin] = useState('9999-12-31');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [encrypting, setEncrypting] = useState(false);
  const [decrypting, setDecrypting] = useState(false);
  const [encryptedResponse, setEncryptedResponse] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);

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
      const response = await fetch(`${import.meta.env.VITE_API_URL}/listusr`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token
        },
        body: JSON.stringify(encryptedBody)
      });
  
      const responseData = await response.json();
  
      if (!response.ok) {
        let errorMessage;
        
        // Manejar códigos 400 y 401 específicamente
        if (response.status === 400 || response.status === 401) {
          errorMessage = Array.isArray(responseData) && responseData[0]?.response 
            ? responseData[0].response 
            : 'Error desconocido';
        } else {
          errorMessage = responseData.message || `Error HTTP: ${response.status}`;
        }
        
        throw new Error(errorMessage);
      }
  
      setEncryptedResponse(responseData);
    } catch (err) {
      setError(err.message || 'Error al obtener usuarios'); // Usar el mensaje de error capturado
      console.error('API Error:', err);
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
            {loading ? 'Cargando...' : 'Buscar Usuarios'}
            </button>
            <button 
                type="button" 
                className="secondary-button"
                onClick={() => onAction('Reguser')}
            >
                ➕ Agregar Usuario
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
              setError('Error al procesar los datos de usuarios');
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
                <th>ID</th>
                <th>Clave</th>
                <th>Nombre</th>
                <th>Email</th>
                <th>Nivel</th>
                <th>Fecha Alta</th>
              </tr>
            </thead>
            <tbody>
              {data.map((user) => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>{user.claveColab}</td>
                  <td>{user.name}</td>
                  <td>{user["email:"]}</td> 
                  <td>{user.nivel}</td>
                  <td>{new Date(user.fecha_alta).toLocaleDateString()}</td>
                  <td>
                    <button 
                      className="edit-button"
                      onClick={() => setSelectedUser(user)}
                    >
                      ✏️ Editar
                    </button>                    
                    <button 
                      className="delete-button"
                      onClick={() => setSelectedUserId(user.id)}
                    >
                      🗑️ Eliminar
                    </button>
                  </td>                  
                </tr>
              ))}
            </tbody>
            
          </table>
        </div>
      )}
      {selectedUser && (
        <Updusr
          userData={selectedUser}
          onSuccess={() => {
            setSelectedUser(null);
            handleSearch(new Event('submit')); // Recargar datos
          }}
          onClose={() => setSelectedUser(null)}
        />
      )}      
      {selectedUserId && (
        <Delusr
          userId={selectedUserId}
          onSuccess={() => {
            setData(data.filter(user => user.id !== selectedUserId));
            setSelectedUserId(null);
          }}
          onClose={() => setSelectedUserId(null)}
        />
      )}      
    </div>
  );  
};

