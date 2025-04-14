import React, { useState, useEffect } from 'react';
import Encryptor from './Encryptor';
import Decryptor from './Decryptor';
import '../styles/Delusr.css';

const encryptionPassword = import.meta.env.VITE_ENCRYPTION_PASSWORD;

export const Delnivtran = ({ nivelId, onSuccess, onClose }) => {
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
      const response = await fetch(`${import.meta.env.VITE_API_URL}/delnivtran`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token
        },
        body: JSON.stringify(encryptedBody)
      });

      const responseData = await response.json();

      if (response.status === 201) {
        setEncryptedResponse(responseData);
      } else if (response.status === 400) {
        const errorMessage = Array.isArray(responseData) && responseData[0]?.response || 'Error desconocido';
        setError(`Error al eliminar: ${errorMessage}`);
      } else if (response.status === 401) {
        setError('No autorizado para esta acción');
      }
    } catch (err) {
      setError('Error en la comunicación con el servidor');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    setLoading(true);
    setError('');
    setSuccess('');
    setEncrypting(true);
  };

  return (
    <div className="delusr-modal">
      <div className="modal-content">
        <h3>¿Confirmar eliminación del nivel ID: {nivelId}?</h3>
        
        {!success && (
          <div className="button-group">
            <button onClick={handleDelete} disabled={loading}>
              {loading ? 'Eliminando...' : 'Confirmar'}
            </button>
            <button onClick={onClose}>Cancelar</button>
          </div>
        )}

        {encrypting && (
          <Encryptor
            password={encryptionPassword}
            message={JSON.stringify({ idnivtran: nivelId })}
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
                if (Array.isArray(parsedData) && parsedData[0]?.response === 'Exito') {
                  setSuccess('Nivel eliminado exitosamente');
                  onSuccess();
                  setTimeout(onClose, 2000);
                }
              } catch (err) {
                setError('Error al procesar la respuesta');
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
    </div>
  );
};