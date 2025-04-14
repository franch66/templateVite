import React, { useState, useEffect } from 'react';
import Encryptor from './Encryptor';
import Decryptor from './Decryptor';
import '../styles/Reguser.css';

const encryptionPassword = import.meta.env.VITE_ENCRYPTION_PASSWORD;

export const Reguser = () => {
  const [formData, setFormData] = useState({
    claveColab: '',
    name: '',
    email: '',
    tipo: 'X',
    password: '',
    nivel: '1',
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
      const response = await fetch(`${import.meta.env.VITE_API_URL}/regusr`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token
        },
        body: JSON.stringify(encryptedBody)
      });
  
      const responseData = await response.json();
      console.log('Respuesta cruda del servidor:', responseData); // Nuevo log
  
      if (response.status === 201) {
        setEncryptedResponse(responseData);
      } else if (response.status === 400) {
        console.log('Error 400 detectado. Estructura respuesta:', {
          status: response.status,
          data: responseData,
          esArray: Array.isArray(responseData),
          primerElemento: responseData[0]
        }); // Log detallado
        
        const errorMessage = Array.isArray(responseData) && responseData[0]?.response 
          || responseData?.response 
          || 'Error desconocido';
        
        setError(`Error en registro: ${errorMessage}`);
        setLoading(false);
      }
  
    } catch (err) {
      console.error('Error completo en la petición:', {
        error: err,
        response: err.response // Si está disponible
      }); // Log mejorado
      setError('Error en la comunicación con el servidor');
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
    <div className="buscador-grid-container">
      <form className="search-form" onSubmit={handleSubmit}>
        <div className="input-group">
          <label>Clave Colaborador:</label>
          <input
            type="text"
            name="claveColab"
            value={formData.claveColab}
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
          <label>Contraseña:</label>
          <input
            type="password"
            name="password"
            value={formData.password}
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
            <option value="1">1 - Básico</option>
            <option value="2">2 - Intermedio</option>
            <option value="3">3 - Administrador</option>
          </select>
        </div>



        <button type="submit" disabled={loading}>
          {loading ? 'Procesando...' : 'ALTA'}
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
                console.log('Resultado descifrado crudo:', result); // Nuevo log
                const parsedData = JSON.parse(result);
                console.log('Resultado parseado:', parsedData); // Nuevo log
                
                if (Array.isArray(parsedData) && parsedData[0]?.response === 'Exito') {
                  setSuccess('Usuario registrado exitosamente');
                  setFormData({
                    claveColab: '',
                    name: '',
                    email: '',
                    tipo: 'X',
                    password: '',
                    nivel: '1',
                    usuario_alt: ''
                  });
                  setLoading(false);
                  setEncrypting(false);
                  setDecrypting(false);
                } else {
                  setError(`Respuesta inesperada: ${JSON.stringify(parsedData)}`);
                }
              } catch (err) {
                console.error('Error en parseo JSON:', {
                  error: err,
                  resultado: result
                }); // Log detallado
                setError('Error al interpretar respuesta del servidor');
              }
            }}
            onError={(errorMsg) => {
              console.error('Error en descifrado:', errorMsg); // Nuevo log
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