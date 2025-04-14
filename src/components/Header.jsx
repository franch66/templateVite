import React, { useState } from 'react';
import Encryptor from './Encryptor';
import logo from '../Anexia_Logo.webp';
import '../styles/Header.css';

const encryptionPassword = import.meta.env.VITE_ENCRYPTION_PASSWORD;

const translations = {
  en: {
    emailPlaceholder: "Your email",
    passwordPlaceholder: "Your password",
    loginButton: "Sign In",
    welcomeMessage: "Welcome!!!",
    logoutButton: "Logout",
    validationError: "Please fill both fields",
    encryptionError: "Encryption error",
    loginError: "Invalid credentials",
    selectLanguage: "Select Language"
  },
  es: {
    emailPlaceholder: "tu correo",
    passwordPlaceholder: "tu password", 
    loginButton: "Ingresar",
    welcomeMessage: "Bienvenido!!!",
    logoutButton: "Cerrar sesión",
    validationError: "Por favor completa ambos campos",
    encryptionError: "Error en cifrado",
    loginError: "Credenciales inválidas",
    selectLanguage: "Seleccionar idioma"
  },
  fr: {
    emailPlaceholder: "votre email",
    passwordPlaceholder: "votre mot de passe",
    loginButton: "Se connecter",
    welcomeMessage: "Bienvenue!!!",
    logoutButton: "Déconnexion",
    validationError: "Veuillez remplir les deux champs",
    encryptionError: "Erreur de chiffrement",
    loginError: "Identifiants invalides",
    selectLanguage: "Choisir la langue"
  },
  zh: {
    emailPlaceholder: "您的电子邮件",
    passwordPlaceholder: "您的密码",
    loginButton: "登录",
    welcomeMessage: "欢迎!!!",
    logoutButton: "退出登录",
    validationError: "请填写所有字段",
    encryptionError: "加密错误",
    loginError: "无效的凭据",
    selectLanguage: "选择语言"
  }
};

export const Header = ({ onAuthChange, currentLanguage, onLanguageChange, setUserEmail }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [encrypting, setEncrypting] = useState(false);
  const [showLanguageModal, setShowLanguageModal] = useState(false);

  const handleEncryptedData = async (encryptedData) => {
    if (!encryptedData) return;
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/asplogin`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(encryptedData)
      });

      const { access_token } = await response.json();

      if (response.ok) {
        setIsLoggedIn(true);
        onAuthChange(true);
        setUserEmail(email); // Actualización crítica
        localStorage.setItem('authToken', access_token);
      } else {
        throw new Error(access_token?.message || translations[currentLanguage].loginError);
      }
    } catch (err) {
      setError(translations[currentLanguage].loginError);
      console.error('Login error:', err);
    } finally {
      setLoading(false);
      setEncrypting(false);
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!email || !password) {
      setError(translations[currentLanguage].validationError);
      setLoading(false);
      return;
    }

    setEncrypting(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    onAuthChange(false);
    setUserEmail(''); // Limpiar email al logout
    localStorage.removeItem('authToken');
  };

  const LanguageModal = () => (
    <div className="language-modal">
      <div className="modal-content">
        <h3>{translations[currentLanguage].selectLanguage}</h3>
        <button onClick={() => { onLanguageChange('es'); setShowLanguageModal(false); }}>
          🇪🇸 Español
        </button>
        <button onClick={() => { onLanguageChange('en'); setShowLanguageModal(false); }}>
          🇺🇸 English
        </button>
        <button onClick={() => { onLanguageChange('fr'); setShowLanguageModal(false); }}>
          🇫🇷 Français
        </button>
        <button onClick={() => { onLanguageChange('zh'); setShowLanguageModal(false); }}>
          🇨🇳 中文 (Chinese)
        </button>
      </div>
    </div>
  );

  return (
    <header className="header-container">
      <div className="logo-section">
        <img src={logo} className="App-logo" alt="logo" />
        <h1>RentEase</h1>
      </div>

      <div className="language-switcher">
        <button onClick={() => setShowLanguageModal(true)}>
          {{
            es: '🇪🇸',
            en: '🇺🇸',
            fr: '🇫🇷',
            zh: '🇨🇳'
          }[currentLanguage]}
        </button>
        {showLanguageModal && <LanguageModal />}
      </div>

      {!isLoggedIn ? (
        <>
          <form className="login-form" onSubmit={handleLogin}>
            <input
              type="email"
              placeholder={translations[currentLanguage].emailPlaceholder}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder={translations[currentLanguage].passwordPlaceholder}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button type="submit" disabled={loading}>
              {loading ? '...' : translations[currentLanguage].loginButton}
            </button>
            {error && <span className="error-message">{error}</span>}
          </form>

          {encrypting && (
            <Encryptor
              password={encryptionPassword}
              message={JSON.stringify({ email, password })}
              onEncrypted={handleEncryptedData}
              onError={() => {
                setError(translations[currentLanguage].encryptionError);
                setLoading(false);
                setEncrypting(false);
              }}
            />
          )}
        </>
      ) : (
        <div className="user-panel">
          <span>{translations[currentLanguage].welcomeMessage} {email}</span>
          <button onClick={handleLogout}>
            {translations[currentLanguage].logoutButton}
          </button>
        </div>
      )}
    </header>
  );
};