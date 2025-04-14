import React, { useState, useEffect } from 'react';
import Encryptor from './Encryptor';
import Decryptor from './Decryptor';
import { UserOpts } from './UserOpts';
import '../styles/Selper.css';

const encryptionPassword = import.meta.env.VITE_ENCRYPTION_PASSWORD;

const translations = {
  en: {
    title: "Profile Information",
    loading: "Loading profile...",
    error: "Error retrieving profile",
    userData: "User Data",
    registrationDate: "Registration Date",
    userLevel: "Access Level",
    key: "Key",
    type: "Type",
    administrator: "Administrator",
    landlord: "Landlord",
    tenant: "Tenant"
  },
  es: {
    title: "Información del Perfil",
    loading: "Cargando perfil...",
    error: "Error al obtener el perfil",
    userData: "Datos del Usuario",
    registrationDate: "Fecha de Registro",
    userLevel: "Nivel de Acceso",
    key: "Clave",
    type: "Tipo",
    administrator: "Administrador",
    landlord: "Arrendador",
    tenant: "Arrendatario"
  },
  fr: {
    title: "Informations du profil",
    loading: "Chargement du profil...",
    error: "Erreur de récupération du profil",
    userData: "Données utilisateur",
    registrationDate: "Date d'inscription",
    userLevel: "Niveau d'accès",
    key: "Clé",
    type: "Type",
    administrator: "Administrateur",
    landlord: "Propriétaire",
    tenant: "Locataire"
  },
  zh: {
    title: "个人资料信息",
    loading: "正在加载资料...",
    error: "检索资料时出错",
    userData: "用户数据",
    registrationDate: "注册日期",
    userLevel: "访问级别",
    key: "钥匙",
    type: "类型",
    administrator: "管理员",
    landlord: "房东",
    tenant: "租户"
  }
};

export const Selper = ({ userEmail, currentLanguage, onClaveObtenida, onNavigation }) => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [encrypting, setEncrypting] = useState(false);
  const [encryptedResponse, setEncryptedResponse] = useState(null);

  // Efecto para cargar el perfil cuando cambia el email
  useEffect(() => {
    const fetchProfile = () => {
      if (!userEmail) {
        setError(translations[currentLanguage].error);
        setLoading(false);
        return;
      }
      setEncrypting(true);
    };
    
    fetchProfile();
  }, [userEmail, currentLanguage]);

  // Efecto para enviar la clave al padre cuando se obtienen los datos del usuario
  useEffect(() => {
    if (userData && userData.claveColab && onClaveObtenida) {
      onClaveObtenida(userData.claveColab);
    }
  }, [userData, onClaveObtenida]);

  const handleEncryptedData = async (encryptedBody) => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error(translations[currentLanguage].error);
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}/selper`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token
        },
        body: JSON.stringify(encryptedBody)
      });

      const responseData = await response.json();
      
      if (response.ok) {
        setEncryptedResponse(responseData);
      } else {
        throw new Error(responseData?.response || translations[currentLanguage].error);
      }
    } catch (err) {
      setError(err.message);
      setLoading(false);
      setEncrypting(false);
    }
  };

  const renderUserType = () => {
    if (!userData?.tippers) return null;
    
    const types = userData.tippers.split(',');
    const isAdmin = userData.nivel === 3;

    return (
      <div className="type-container">
        <label>
          <input 
            type="checkbox" 
            checked={isAdmin} 
            readOnly 
            className="type-checkbox"
          />
          {translations[currentLanguage].administrator}
        </label>
        <label>
          <input 
            type="checkbox" 
            checked={types.includes('1')} 
            readOnly 
            className="type-checkbox"
          />
          {translations[currentLanguage].landlord}
        </label>
        <label>
          <input 
            type="checkbox" 
            checked={types.includes('2')} 
            readOnly 
            className="type-checkbox"
          />
          {translations[currentLanguage].tenant}
        </label>
      </div>
    );
  };

  const handleDecryptedData = (result) => {
    try {
      const parsedData = JSON.parse(result);
      
      if (Array.isArray(parsedData) {
        const userData = parsedData[0];
        setUserData(userData);
        setError('');
        
        // Notificar al padre sobre la clave obtenida
        if (userData.claveColab && onClaveObtenida) {
          onClaveObtenida(userData.claveColab);
        }
      } else if (parsedData?.response) {
        setError(parsedData.response);
      }
      
      setLoading(false);
    } catch (err) {
      setError(translations[currentLanguage].error);
      setLoading(false);
    }
  };

  return (
    <div className="selper-container">
      <h2>{translations[currentLanguage].title}</h2>
      
      {/* Componente para encriptar los datos */}
      {encrypting && (
        <Encryptor
          password={encryptionPassword}
          message={JSON.stringify({ email: userEmail })}
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

      {/* Estado de carga */}
      {loading && !error && (
        <div className="loading-message">
          {translations[currentLanguage].loading}
        </div>
      )}

      {/* Mensaje de error */}
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {/* Componente para desencriptar la respuesta */}
      {encryptedResponse && (
        <Decryptor
          password={encryptionPassword}
          encryptedMessage={encryptedResponse}
          onDecrypted={handleDecryptedData}
          onError={(errorMsg) => {
            setError(errorMsg);
            setLoading(false);
          }}
        />
      )}

      {/* Mostrar datos del usuario */}
      {userData && (
        <>
          <UserOpts 
            currentLanguage={currentLanguage}
            onListProps={() => onNavigation('list-props')}
            onViewMarketplace={() => onNavigation('Market')} 
          />        
          
          <div className="profile-data">
            <h3>{translations[currentLanguage].userData}</h3>
            
            <div className="data-row">
              <span className="data-label">ID:</span>
              <span className="data-value">{userData.id}</span>
            </div>
            
            <div className="data-row">
              <span className="data-label">{translations[currentLanguage].userLevel}:</span>
              <span className="data-value">{userData.nivel}</span>
            </div>
            
            <div className="data-row">
              <span className="data-label">{translations[currentLanguage].registrationDate}:</span>
              <span className="data-value">
                {new Date(userData.fecha_alta).toLocaleDateString()}
              </span>
            </div>
            
            <div className="data-row">
              <span className="data-label">Email:</span>
              <span className="data-value">{userData.email}</span>
            </div>
            
            <div className="data-row">
              <span className="data-label">{translations[currentLanguage].key}:</span>
              <span className="data-value">{userData.claveColab}</span>
            </div>
            
            <div className="data-row">
              <span className="data-label">{translations[currentLanguage].type}:</span>
              {renderUserType()}
            </div>                  
          </div>
        </>
      )}
    </div>
  );
};