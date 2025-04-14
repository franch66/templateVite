import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import Encryptor from './Encryptor';
import Decryptor from './Decryptor';
import '../styles/ListLogs.css';

const encryptionPassword = import.meta.env.VITE_ENCRYPTION_PASSWORD;

export const ListLogs = () => {
  const [fechaInicio, setFechaInicio] = useState('0001-01-01');
  const [fechaFin, setFechaFin] = useState('9999-12-31');
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

  const cleanDataString = (str) => {
    if (!str) return '';
    return str
      .replace(/'/g, '"')
      .replace(/None/g, 'null')
      .replace(/\\"/g, '"');
  };

  const handleEncryptedData = async (encryptedBody) => {
    const token = localStorage.getItem('authToken');
    if (!token || token === 'undefined') {
      setError('Token de autenticación inválido');
      setLoading(false);
      return;
    }
  
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/listlogs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token
        },
        body: JSON.stringify(encryptedBody)
      });

      const responseData = await response.json();

      if (!response.ok) {
        let errorMessage = 'Error desconocido';
        
        if (response.status === 400 || response.status === 401) {
          errorMessage = Array.isArray(responseData) && responseData[0]?.response 
            ? responseData[0].response 
            : responseData?.response || errorMessage;
        } else {
          errorMessage = responseData.message || `Error HTTP: ${response.status}`;
        }
        
        throw new Error(errorMessage);
      }

      setEncryptedResponse(responseData);
    } catch (err) {
      setError(err.message || 'Error al obtener registros');
      console.error('API Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const exportToExcel = () => {
    try {
      const excelData = data.map(log => ({
        'Fecha Inicio': new Date(log.timestar).toLocaleString(),
        'Fecha Fin': new Date(log.timeend).toLocaleString(),
        'Nivel': log.log_level,
        'Código': log["respcod:"] || '',
        'Usuario': log.nombre || '',
        'IP Origen': log.Ip_Origen || '',
        'Servicio': log.Servicio || '',
        'Método': log.Metodo || '',
        'Datos Entrada': cleanDataString(log.DatosIn),
        'Datos Salida': cleanDataString(log.DatosOut)
      }));

      const worksheet = XLSX.utils.json_to_sheet(excelData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Registros");
      XLSX.writeFile(workbook, `Registros_${new Date().toISOString().slice(0,10)}.xlsx`);
      
    } catch (error) {
      console.error('Error al exportar a Excel:', error);
      setError('Error al generar el archivo Excel');
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
            {loading ? 'Cargando...' : 'Buscar Registros'}
          </button>
          
          {data.length > 0 && (
            <button 
              type="button" 
              onClick={exportToExcel}
              className="export-button"
            >
              Descargar Excel
            </button>
          )}
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
              setError('Error al procesar los registros');
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
                <th>Fecha Inicio</th>
                <th>Fecha Fin</th>
                <th>Nivel</th>
                <th>Código</th>
                <th>Usuario</th>
                <th>IP Origen</th>
                <th>Servicio</th>
                <th>Método</th>
                <th>Datos Entrada</th>
                <th>Datos Salida</th>
              </tr>
            </thead>
            <tbody>
              {data.map((log, index) => (
                <tr key={index}>
                  <td>{new Date(log.timestar).toLocaleString()}</td>
                  <td>{new Date(log.timeend).toLocaleString()}</td>
                  <td>{log.log_level}</td>
                  <td>{log["respcod:"]}</td>
                  <td>{log.nombre}</td>
                  <td>{log.Ip_Origen}</td>
                  <td>{log.Servicio}</td>
                  <td>{log.Metodo}</td>
                  <td className="json-data">
                    <pre>
                      {cleanDataString(log.DatosIn)}
                    </pre>
                  </td>
                  <td className="json-data">
                    <pre>
                      {cleanDataString(log.DatosOut)}
                    </pre>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};