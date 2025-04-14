import React, { useState, useEffect } from 'react';
import Encryptor from './Encryptor';
import Decryptor from './Decryptor';
import '../styles/Updusr.css';

const encryptionPassword = import.meta.env.VITE_ENCRYPTION_PASSWORD;

export const Updusr = ({ userData, onSuccess, onClose }) => {
  const [formData, setFormData] = useState({
    idcolab: userData.id,
    clvcol: userData.claveColab,
    name: userData.name,
    email: userData["email:"],
    passuser: '',
    nivel: userData.nivel.toString(),
    usuario_alt: ''
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
      const response = await fetch(`${import.meta.env.VITE_API_URL}/updusr`, {
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
        setError(`Error al actualizar: ${errorMessage}`);
      }
    } catch (err) {
      setError('Error en la comunicación con el servidor');
    } finally {
      setLoading(false);
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
    <div className="updusr-modal">
      <div className="modal-content">
        <h3>Editar Usuario ID: {userData.id}</h3>
        
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>ID:</label>
             <div className="read-only-field">
               {formData.idcolab}
             </div>
          </div>

          <div className="input-group">
            <label>Clave:</label>
            <input
              type="text"
              name="clvcol"
              value={formData.clvcol}
              onChange={handleChange}
              required
            />
          </div>

          <div className="input-group">
            <label>Nombre:</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="input-group">
            <label>Email:</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="input-group">
            <label>Nueva Contraseña:</label>
            <input
              type="password"
              name="passuser"
              value={formData.passuser}
              onChange={handleChange}
              placeholder="Dejar en blanco para no cambiar"
            />
          </div>

          <div className="input-group">
            <label>Nivel:</label>
            <select
              name="nivel"
              value={formData.nivel}
              onChange={handleChange}
            >
              <option value="1">1 - Básico</option>
              <option value="2">2 - Intermedio</option>
              <option value="3">3 - Administrador</option>
            </select>
          </div>


          <div className="button-group">
            <button type="submit" disabled={loading}>
              {loading ? 'Guardando...' : 'Guardar Cambios'}
            </button>
            <button type="button" onClick={onClose}>Cancelar</button>
          </div>
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
                if (Array.isArray(parsedData) && parsedData[0]?.response === 'Exito') {
                  setSuccess('Usuario actualizado exitosamente');
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