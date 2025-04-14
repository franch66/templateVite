import React, { useState,useEffect } from 'react';
import Encryptor from './Encryptor';
import Decryptor from './Decryptor';
import '../styles/Sidebar.css';
const encryptionPassword = import.meta.env.VITE_ENCRYPTION_PASSWORD;
const translations = {
  en: {
    home: "Home",
    selCiaTel: "SelCiaTel",
    action1: "Action 1",
    cypher: "Cypher",
    profile: "Profile",
    settings: "Settings",
    users: "Users",
    logs: "Logs",
    transactions: "Transactions",
    reports: "Reports",
    logout: "Logout",
    analytics: "Analytics",
    marketplace: "MarketPlace",
    registro: "Register",
    mantenimiento: "Maintenance",
    market: "Market"    
  },
  es: {
    home: "Inicio",
    selCiaTel: "SelCiaTel", 
    action1: "Acción 1",
    cypher: "Cypher",
    profile: "Perfil",
    settings: "Configuración",
    users: "Usuarios",
    logs: "Registros",
    transactions: "Transacciones",
    reports: "Reportes",
    logout: "Cerrar Sesión",
    analytics: "Análiticos",
    marketplace: "MarketPlace",
    registro: "Registro",
    mantenimiento: "Mantenimiento", 
    market: "Market"    
  },
  fr: {
    home: "Accueil",
    selCiaTel: "SelCiaTel",
    action1: "Action 1",
    cypher: "Cypher",
    profile: "Profil",
    settings: "Paramètres",
    users: "Utilisateurs",
    logs: "Journaux",
    transactions: "Transactions",
    reports: "Rapports",
    logout: "Déconnexion",
    analytics: "Analytiques",
    marketplace: "MarketPlace",
    registro: "Enregistrement",
    mantenimiento: "Maintenance",
    market: "Marché"    
  },
  zh: {
    home: "首页",
    selCiaTel: "SelCiaTel",
    action1: "操作1",
    cypher: "加密",
    profile: "个人资料",
    settings: "设置",
    users: "用户",
    logs: "日志",
    transactions: "交易",
    reports: "报告",
    logout: "退出登录",
    analytics: "分析",
    marketplace: "市场平台",
    registro: "注册",
    mantenimiento: "维护",
    market: "市场"    
  }
};


export const Sidebar = ({ isAuthenticated, onAction, currentLanguage = 'es',userEmail }) => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [encrypting, setEncrypting] = useState(false);
  const [encryptedResponse, setEncryptedResponse] = useState(null);
  const [isSettingsExpanded, setSettingsExpanded] = useState(false);
  const [isMarketplaceExpanded, setMarketplaceExpanded] = useState(false);

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

  const handleEncryptedData = async (encryptedBody) => {
    try {
      const token = localStorage.getItem('authToken');
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
    }
    
  };
  const handleClick = (action) => {
    if (['SelCiaTel', 'Acción 1', 'Cypher','Configuración','MarketPlace'].includes(action) && !isAuthenticated) return;
    
    if (action === 'Configuración') {
      setSettingsExpanded(!isSettingsExpanded);
      setMarketplaceExpanded(false); // Cierra MarketPlace al abrir Configuración
    } else if (action === 'MarketPlace') {
      setMarketplaceExpanded(!isMarketplaceExpanded);
      setSettingsExpanded(false); // Cierra Configuración al abrir MarketPlace
    } else {
      onAction(action);
      setSettingsExpanded(false);
      setMarketplaceExpanded(false);
    }
  };

  return (
    <>
      <h2>{translations[currentLanguage].title}</h2>
  
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
  
      {loading && !error && (
        <div className="loading-message">
          {translations[currentLanguage].loading}
        </div>
      )}
  
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
  
      {encryptedResponse && (
        <Decryptor
          password={encryptionPassword}
          encryptedMessage={encryptedResponse}
          onDecrypted={(result) => {
            try {
              const parsedData = JSON.parse(result);
  
              if (Array.isArray(parsedData)) {
                setUserData(parsedData[0]);
                setError('');
              } else if (parsedData?.response) {
                setError(parsedData.response);
              }
  
              setLoading(false);
            } catch (err) {
              setError(translations[currentLanguage].error);
              setLoading(false);
            }
          }}
          onError={(errorMsg) => {
            setError(errorMsg);
            setLoading(false);
          }}
        />
      )}
  
      {/* Primera validación: userData y isAuthenticated */}
      {(!userData || !isAuthenticated) ? (
        <nav className="sidebar">
          <ul className="menu">
            <li onClick={() => handleClick('Inicio')}>
              🏠 {translations[currentLanguage].home}
            </li>
          </ul>
        </nav>
      ) : (
        <>
          {/* Segunda validación adicional: userData.nivel === 3 */}
          {userData.nivel === 3 ? (
            <nav className="sidebar">
              <ul className="menu">
                <li onClick={() => handleClick('Inicio')}>
                  🏠 {translations[currentLanguage].home}
                </li>
  
                <li
                  onClick={() => handleClick('SelCiaTel')}
                  // style={getActionStyle('SelCiaTel')}
                >
                  📊 {translations[currentLanguage].selCiaTel}
                  {!isAuthenticated && <span className="lock-icon"> 🔒</span>}
                </li>
  
                <li
                  onClick={() => handleClick('Acción 1')}
                  // style={getActionStyle('Acción 1')}
                >
                  ⚙️ {translations[currentLanguage].action1}
                  {!isAuthenticated && <span className="lock-icon"> 🔒</span>}
                </li>
  
                <li
                  onClick={() => handleClick('Cypher')}
                  // style={getActionStyle('Cypher')}
                >
                  📊 {translations[currentLanguage].cypher}
                  {!isAuthenticated && <span className="lock-icon"> 🔒</span>}
                </li>
  
                <li onClick={() => handleClick('Perfil')}>
                  👤 {translations[currentLanguage].profile}
                </li>
  
                <li
                  className={`parent-menu ${isSettingsExpanded ? 'expanded' : ''}`}
                  // style={getActionStyle('Configuración')}
                >
                  <div onClick={() => handleClick('Configuración')}>
                    ⚙️ {translations[currentLanguage].settings}
                    <span className="arrow">{isSettingsExpanded ? '▼' : '▶'}</span>
                    {!isAuthenticated && <span className="lock-icon"> 🔒</span>}
                  </div>
                  {isSettingsExpanded && (
                    <ul className="submenu">
                      <li onClick={() => handleClick('Configuración usuarios')}>
                        👥 {translations[currentLanguage].users}
                      </li>
                      <li onClick={() => handleClick('Configuración logs')}>
                        📝 {translations[currentLanguage].logs}
                      </li>
                      <li onClick={() => handleClick('Configuración transacciones')}>
                        💰 {translations[currentLanguage].transactions}
                      </li>
                      <li onClick={() => handleClick('Configuración analíticos')}>
                        📈 {translations[currentLanguage].analytics}
                      </li>
                    </ul>
                  )}
                </li>
  
                <li
                  className={`parent-menu ${isMarketplaceExpanded ? 'expanded' : ''}`}
                  // style={getActionStyle('MarketPlace')}
                >
                  <div onClick={() => handleClick('MarketPlace')}>
                    🛒 {translations[currentLanguage].marketplace}
                    <span className="arrow">{isMarketplaceExpanded ? '▼' : '▶'}</span>
                    {!isAuthenticated && <span className="lock-icon"> 🔒</span>}
                  </div>
                  {isMarketplaceExpanded && (
                    <ul className="submenu">

                      <li onClick={() => handleClick('Mantenimiento')}>
                        🔧 {translations[currentLanguage].mantenimiento}
                      </li>
                      <li onClick={() => handleClick('Market')}>
                        🏪 {translations[currentLanguage].market}
                      </li>
                    </ul>
                  )}
                </li>
  
                <li onClick={() => handleClick('Reportes')}>
                  📊 {translations[currentLanguage].reports}
                </li>
  
                <li onClick={() => handleClick('Cerrar Sesión')}>
                  🔒 {translations[currentLanguage].logout}
                </li>
              </ul>
            </nav>
          ) : (
            // Si userData.nivel !== 3, solo muestra el enlace de "Inicio"
            <nav className="sidebar">
              <ul className="menu">
                <li onClick={() => handleClick('Inicio')}>
                  🏠 {translations[currentLanguage].home}
                </li>
                <li onClick={() => handleClick('Perfil')}>
                  👤 {translations[currentLanguage].profile}
                </li>                

                <li
                  className={`parent-menu ${isMarketplaceExpanded ? 'expanded' : ''}`}
                  // style={getActionStyle('MarketPlace')}
                >
                  <div onClick={() => handleClick('MarketPlace')}>
                    🛒 {translations[currentLanguage].marketplace}
                    <span className="arrow">{isMarketplaceExpanded ? '▼' : '▶'}</span>
                    {!isAuthenticated && <span className="lock-icon"> 🔒</span>}
                  </div>
                  {isMarketplaceExpanded && (
                    <ul className="submenu">

                      <li onClick={() => handleClick('Market')}>
                        🏪 {translations[currentLanguage].market}
                      </li>
                    </ul>
                  )}
                </li>
                <li onClick={() => handleClick('Cerrar Sesión')}>
                  🔒 {translations[currentLanguage].logout}
                </li> 
              </ul>
            </nav>
          )}
        </>
      )}
    </>
  );
}  