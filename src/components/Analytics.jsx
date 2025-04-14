import React, { useState, useEffect, useCallback } from 'react';
import Encryptor from './Encryptor';
import Decryptor from './Decryptor';
import '../styles/Analytics.css';

const encryptionPassword = import.meta.env.VITE_ENCRYPTION_PASSWORD;
const endpoints = [
  { url: 'stats5H', title: 'Servicios Ejecutados:', type: 'counter' },
  { url: 'stats1H', title: 'Estadísticas de Uso por Servicio', type: 'bar' },
  { 
    url: 'stats4H', 
    title: 'Tiempo Promedio de Ejecución por Servicio', 
    type: 'bar',
    dataKey: 'TiempoPromedio'
  },
  { url: 'stats2H', title: 'Porcentaje transaccional', type: 'percentageBar' },
  { url: 'stats3H', title: 'Servicios con Códigos 500', type: 'percentageBar' }
];

export const Analytics = () => {
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [encryptedResponses, setEncryptedResponses] = useState(null);
  const [decryptedCount, setDecryptedCount] = useState(0);
  const [processStarted, setProcessStarted] = useState(false);
  const [fechaInicio, setFechaInicio] = useState('0001-01-01');
  const [fechaFin, setFechaFin] = useState('9999-12-31');

  const processData = useCallback((endpoint, decryptedData) => {
    try {
      const parsedData = typeof decryptedData === 'string' 
        ? JSON.parse(decryptedData) 
        : decryptedData;

      const endpointConfig = endpoints.find(e => e.url === endpoint);
      
      switch(endpoint) {
        case 'stats5H':
          return { conteo: parsedData.conteo };
          
        case 'stats1H':
          return parsedData.map(item => ({
            label: item.Servicio,
            value: item.Conteo
          }));
          
        case 'stats4H':
          return parsedData.map(item => ({
            label: item.Servicio,
            value: parseFloat(item[endpointConfig.dataKey]).toFixed(4)
          }));
          
        case 'stats2H':
        case 'stats3H':
          return parsedData.map(item => ({
            label: item.Servicio,
            value: item.Count || item.count || 0
          }));
          
        default:
          return parsedData;
      }
    } catch (err) {
      console.error(`Error procesando ${endpoint}:`, err.message, decryptedData);
      throw new Error(`Error en formato de datos para ${endpoint}`);
    }
  }, []);

  const handleEncrypted = useCallback(async (encryptedBody) => {
    if (processStarted) return;
    
    setProcessStarted(true);
    setLoading(true);
    setErrors({});
    setData({});
    setEncryptedResponses(null);
    
    const token = localStorage.getItem('authToken');
    if (!token) {
      setErrors({ general: 'Token inválido' });
      setLoading(false);
      return;
    }

    try {
      const controller = new AbortController();
      const responses = await Promise.all(
        endpoints.map(async ({ url }) => {
          try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/${url}`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': token
              },
              body: JSON.stringify(encryptedBody),
              signal: controller.signal
            });

            if (!response.ok) {
              const errorData = await response.json();
              throw new Error(errorData[0]?.response || 'Error en el servidor');
            }

            return { url, data: await response.json() };
          } catch (err) {
            return { url, error: err.message };
          }
        })
      );

      const validResponses = responses.reduce((acc, { url, data, error }) => {
        if (error) {
          setErrors(prev => ({ ...prev, [url]: error }));
          return acc;
        }
        if (data) acc[url] = data;
        return acc;
      }, {});

      setEncryptedResponses(validResponses);
      
    } catch (err) {
      setErrors({ general: err.message });
      setLoading(false);
    }
  }, [processStarted]);

  useEffect(() => {
    if (encryptedResponses && Object.keys(encryptedResponses).length > 0) {
      setDecryptedCount(0);
      setLoading(true);
    }
  }, [encryptedResponses]);

  useEffect(() => {
    if (decryptedCount === Object.keys(encryptedResponses || {}).length) {
      setLoading(false);
    }
  }, [decryptedCount, encryptedResponses]);

  const handleSearch = (e) => {
    e.preventDefault();
    setProcessStarted(false);
    setLoading(true);
  };

  return (
    <div className="analytics-container">
      <form className="analytics-form" onSubmit={handleSearch}>
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
        
        <button type="submit" disabled={loading}>
          {loading ? 'Buscando...' : 'Buscar'}
        </button>
      </form>

      {!processStarted && loading && (
        <Encryptor
          password={encryptionPassword}
          message={JSON.stringify({
            fecini: fechaInicio,
            fecfin: fechaFin
          })}
          onEncrypted={handleEncrypted}
          onError={(errorMsg) => {
            setErrors({ general: errorMsg });
            setLoading(false);
          }}
        />
      )}

      {loading && <div className="loading">Cargando estadísticas...</div>}

      {Object.entries(errors).map(([key, error]) => (
        <div key={key} className="error-message">{error}</div>
      ))}

      {encryptedResponses && Object.entries(encryptedResponses).map(([url, encryptedData]) => (
        <Decryptor
          key={url}
          password={encryptionPassword}
          encryptedMessage={encryptedData}
          onDecrypted={(result) => {
            try {
              const processed = processData(url, result);
              setData(prev => ({ ...prev, [url]: processed }));
            } catch (err) {
              setErrors(prev => ({ ...prev, [url]: err.message }));
            }
            setDecryptedCount(prev => prev + 1);
          }}
          onError={(errorMsg) => {
            setErrors(prev => ({ ...prev, [url]: errorMsg }));
            setDecryptedCount(prev => prev + 1);
          }}
        />
      ))}

      {!loading && Object.keys(data).length > 0 && (
        <div className="dashboard">
          {endpoints.map(({ url, title, type }) => (
            <div key={url} className="chart-container">
              <h3>{title}</h3>
              {data[url] && (
                <>
                  {type === 'counter' && (
                    <div className="big-counter">
                      {data[url].conteo}
                    </div>
                  )}
                  
                  {type === 'bar' && (
                    <div className="classic-bar-chart">
                      {data[url].map((item, i) => {
                        const values = data[url].map(d => parseFloat(d.value));
                        const maxValue = Math.max(...values);
                        return (
                          <div key={i} className="bar-item">
                            <div className="bar-label">{item.label.replace(/\\\//g, '/')}</div>
                            <div className="bar">
                              <div 
                                className="bar-fill" 
                                style={{ 
                                  width: `${(parseFloat(item.value) / maxValue * 100)}%`
                                }}
                              >
                                {item.value}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {type === 'percentageBar' && (
                    <div className="percentage-bar-chart">
                      {data[url]
                        .sort((a, b) => b.value - a.value)
                        .map((item, index) => {
                          const total = data[url].reduce((sum, d) => sum + Number(d.value), 0);
                          const percent = total > 0 ? (Number(item.value) / total * 100) : 0;
                          const hue = (index * 360) / data[url].length;

                          return (
                            <div key={index} className="percentage-bar-item">
                              {/* Etiqueta del servicio */}
                              <div className="service-name">
                                {item.label.replace(/\\\//g, '/')}
                              </div>
                              
                              {/* Barra de porcentaje */}
                              <div className="bar-container">
                                <div 
                                  className="bar-fill" 
                                  style={{
                                    width: `${percent}%`,
                                    backgroundColor: `hsl(${hue}, 70%, 50%)`
                                  }}
                                >
                                  {percent.toFixed(1)}%
                                </div>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};