import React, { useState, useEffect } from 'react';
import Encryptor from './Encryptor';
import Decryptor from './Decryptor';
import '../styles/MarketView.css';

const encryptionPassword = import.meta.env.VITE_ENCRYPTION_PASSWORD;

const translations = {
  en: {
    title: "Marketplace Viewer",
    searchButton: "Search",
    searching: "Searching...",
    noImages: "No images found",
    initialMessage: "Press Search to view properties",
    address: "Address",
    state: "State",
    price: "Price",
    invalidToken: "Invalid authentication token",
    serverError: "Server communication error",
    invalidFormat: "Invalid response format",
    noImageText: "No image available",
    contactOwner: "Contact Owner",
    sendMessage: "Send",
    typeMessage: "Type your message...",
    closeChat: "Close",
    messageSent: "Message sent successfully",
    messageFailed: "Failed to send message",
    sendingMessage: "Sending message...",
    loadingConversation: "Loading conversation...",
    conversationError: "Error loading conversation"    
  },
  es: {
    title: "Visualizador de Marketplace",
    searchButton: "Buscar",
    searching: "Buscando...",
    noImages: "No se encontraron imágenes",
    initialMessage: "Presione Buscar para ver propiedades",
    address: "Dirección",
    state: "Estado",
    price: "Precio",
    invalidToken: "Token de autenticación inválido",
    serverError: "Error en la comunicación con el servidor",
    invalidFormat: "Formato de respuesta inválido",
    noImageText: "Imagen no disponible",
    contactOwner: "Contactar al Propietario",
    sendMessage: "Enviar",
    typeMessage: "Escribe tu mensaje...",
    closeChat: "Cerrar",
    messageSent: "Mensaje enviado con éxito",
    messageFailed: "Error al enviar el mensaje",
    sendingMessage: "Enviando mensaje...",
    loadingConversation: "Cargando conversación...",
    conversationError: "Error al cargar la conversación"    
  },
  fr: {
    title: "Visionneuse du Marketplace",
    searchButton: "Rechercher",
    searching: "Recherche en cours...",
    noImages: "Aucune image trouvée",
    initialMessage: "Appuyez sur Rechercher pour voir les propriétés",
    address: "Adresse",
    state: "État",
    price: "Prix",
    invalidToken: "Jeton d'authentification invalide",
    serverError: "Erreur de communication avec le serveur",
    invalidFormat: "Format de réponse invalide",
    noImageText: "Aucune image disponible",
    contactOwner: "Contacter le Propriétaire",
    sendMessage: "Envoyer",
    typeMessage: "Tapez votre message...",
    closeChat: "Fermer",
    messageSent: "Message envoyé avec succès",
    messageFailed: "Échec de l'envoi du message",
    sendingMessage: "Envoi du message...",
    loadingConversation: "Chargement de la conversation...",
    conversationError: "Erreur lors du chargement de la conversation"
  },
  zh: {
    title: "市场查看器",
    searchButton: "搜索",
    searching: "搜索中...",
    noImages: "未找到图片",
    initialMessage: "点击搜索查看房产",
    address: "地址",
    state: "州/省",
    price: "价格",
    invalidToken: "无效的身份验证令牌",
    serverError: "服务器通信错误",
    invalidFormat: "无效的响应格式",
    noImageText: "无可用图片",
    contactOwner: "联系业主",
    sendMessage: "发送",
    typeMessage: "输入您的消息...",
    closeChat: "关闭",
    messageSent: "消息发送成功",
    messageFailed: "消息发送失败",
    sendingMessage: "正在发送消息...",
    loadingConversation: "正在加载对话...",
    conversationError: "加载对话时出错"
  }
};
const ChatModal = ({ 
  property, 
  currentLanguage, 
  onClose, 
  userClaveColab,
  onSendMessage,
  initialConversation = null,
  loadingConversation = false,
  conversationError = null
}) => {
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [conversation, setConversation] = useState([]);
  const [statusMessage, setStatusMessage] = useState('');

  // Efecto para cargar la conversación inicial
  useEffect(() => {
    if (initialConversation) {
      const formattedConversation = initialConversation.map(msg => ({
        text: msg.texto_orig || msg.texto_dest,
        sender: msg.texto_orig ? 'me' : 'them',
        timestamp: formatDate(msg.fecha_alta)
      }));
      setConversation(formattedConversation);
    }
  }, [initialConversation]);

  function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleTimeString();
  }

  const handleSend = async () => {
    if (!message.trim() || isSending) return;
    
    setIsSending(true);
    setStatusMessage(translations[currentLanguage].sendingMessage);
    
    const messageData = {
      id_prop: property.prop,
      id_per_orig: property.per,
      id_per_dest: userClaveColab,
      texto_orig: message,
      texto_dest: ""
    };
    
    try {
      await onSendMessage(messageData);
      setConversation(prev => [...prev, { 
        text: message, 
        sender: 'me', 
        timestamp: new Date().toLocaleTimeString() 
      }]);
      setMessage('');
      setStatusMessage(translations[currentLanguage].messageSent);
    } catch (error) {
      setStatusMessage(`${translations[currentLanguage].messageFailed}: ${error.message}`);
    } finally {
      setIsSending(false);
    }
  };


  return (
    <div className="chat-modal-overlay">
      <div className="chat-modal">
        <div className="chat-header">
          <h4>{translations[currentLanguage].contactOwner}</h4>
          <button onClick={onClose} className="close-chat">
            {translations[currentLanguage].closeChat}
          </button>
        </div>
        
        <div className="chat-messages">
          {loadingConversation ? (
            <div className="loading-conversation">
              {translations[currentLanguage].loadingConversation}
            </div>
          ) : conversationError ? (
            <div className="conversation-error">
              {translations[currentLanguage].conversationError}
            </div>
          ) : conversation.length === 0 ? (
            <div className="empty-chat">
              {translations[currentLanguage].typeMessage}
            </div>
          ) : (
            conversation.map((msg, index) => (
              <div key={index} className={`message ${msg.sender}`}>
                <p>{msg.text}</p>
                <span className="timestamp">{msg.timestamp}</span>
              </div>
            ))
          )}
        </div>
        
        <div className="chat-input">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={translations[currentLanguage].typeMessage}
            onKeyPress={(e) => e.key === 'Enter' && !isSending && handleSend()}
            disabled={isSending || loadingConversation}
          />
          <button 
            onClick={handleSend} 
            disabled={isSending || !message.trim() || loadingConversation}
          >
            {isSending ? '...' : translations[currentLanguage].sendMessage}
          </button>
        </div>
        
        {statusMessage && (
          <div className="chat-status">
            {statusMessage}
          </div>
        )}
      </div>
    </div>
  );
};


export const MarketView = ({ currentLanguage = 'es', userClave }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [encrypting, setEncrypting] = useState(false);
  const [decrypting, setDecrypting] = useState(false);
  const [encryptedResponse, setEncryptedResponse] = useState(null);
  const [properties, setProperties] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [contactEncrypting, setContactEncrypting] = useState(false);
  const [contactEncryptorVisible, setContactEncryptorVisible] = useState(false);
  const [messageToEncrypt, setMessageToEncrypt] = useState(null);

  const [conversationEncrypting, setConversationEncrypting] = useState(false);
  const [conversationDecrypting, setConversationDecrypting] = useState(false);
  const [encryptedConversationResponse, setEncryptedConversationResponse] = useState(null);
  const [initialConversation, setInitialConversation] = useState(null);
  const [loadingConversation, setLoadingConversation] = useState(false);
  const [conversationError, setConversationError] = useState(null);  

  useEffect(() => {
    if (encryptedResponse) {
      setDecrypting(true);
    }
  }, [encryptedResponse]);

  useEffect(() => {
    if (encryptedConversationResponse) {
      setConversationDecrypting(true);
    }
  }, [encryptedConversationResponse])
  
  
  const handleEncryptedData = async (encryptedBody) => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      setError(translations[currentLanguage].invalidToken);
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/selimage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token
        },
        body: JSON.stringify(encryptedBody)
      });

      const responseData = await response.json();
      
      if (!response.ok) {
        throw new Error(responseData?.response || translations[currentLanguage].serverError);
      }

      setEncryptedResponse(responseData);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleSendMessage = async (messageData) => {
    setContactEncrypting(true);
    setError('');
    setMessageToEncrypt(messageData);
    setContactEncryptorVisible(true);
  };


  const loadInitialConversation = async (property) => {
    setLoadingConversation(true);
    setConversationError(null);
    setConversationEncrypting(true);
  };
  
  
  // Función para manejar el resultado de la encriptación del mensaje
  const handleContactEncrypted = async (encryptedResult) => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error(translations[currentLanguage].invalidToken);
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token
        },
        body: JSON.stringify(encryptedResult)
      });

      const responseData = await response.json();
      
      if (!response.ok) {
        throw new Error(responseData?.response || translations[currentLanguage].serverError);
      }

      return responseData;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setContactEncrypting(false);
      setContactEncryptorVisible(false);
      setMessageToEncrypt(null);
    }
  };

  const handleConversationEncrypted = async (encryptedBody) => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      setConversationError(translations[currentLanguage].invalidToken);
      setLoadingConversation(false);
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/selcon`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token
        },
        body: JSON.stringify(encryptedBody)
      });

      const responseData = await response.json();
      
      if (!response.ok) {
        throw new Error(responseData?.response || translations[currentLanguage].serverError);
      }

      setEncryptedConversationResponse(responseData);
    } catch (err) {
      setConversationError(err.message);
      setLoadingConversation(false);
    }
  };

  // Función para procesar la conversación desencriptada
  const processDecryptedConversation = (data) => {
    try {
      const parsedData = JSON.parse(data);
      
      if (!Array.isArray(parsedData)) {
        throw new Error(translations[currentLanguage].invalidFormat);
      }

      setInitialConversation(parsedData);
    } catch (err) {
      setConversationError(err.message);
    } finally {
      setLoadingConversation(false);
    }
  };
  
  

  const processDecryptedData = (data) => {
    try {
      const parsedData = JSON.parse(data);
      
      if (!Array.isArray(parsedData)) {
        throw new Error(translations[currentLanguage].invalidFormat);
      }

      const processedProperties = parsedData.map(prop => ({
        ...prop,
        imageUrl: prop.image ? `data:image/png;base64,${prop.image}` : null
      }));

      setProperties(processedProperties);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setHasSearched(true);
    setEncrypting(true);
  };

  const handleRefresh = () => {
    setError('');
    setLoading(true);
    setEncrypting(true);
  };

  const handlePropertyClick = async (property) => {
    if (!userClave) {
      const messages = {
        es: 'Debes iniciar sesión para contactar al propietario',
        en: 'You must log in to contact the owner',
        fr: 'Vous devez vous connecter pour contacter le propriétaire',
        zh: '您必须登录才能联系所有者'
      };
      alert(messages[currentLanguage] || 'Authentication required');
      return;
    }
    setSelectedProperty(property);
    await loadInitialConversation(property);
  };

  return (
    <div className="market-view-container">
      {contactEncrypting && (
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
          <p>{translations[currentLanguage].sendingMessage}</p>
        </div>
      )}

      {contactEncryptorVisible && messageToEncrypt && (
        <Encryptor
          password={encryptionPassword}
          message={JSON.stringify(messageToEncrypt)}
          onEncrypted={(result) => {
            handleContactEncrypted(result);
          }}
          onError={(errorMsg) => {
            setError(errorMsg);
            setContactEncrypting(false);
            setContactEncryptorVisible(false);
          }}
        />
      )}  

      {conversationEncrypting && selectedProperty && (
        <Encryptor
          key="conversation-encryptor"
          password={encryptionPassword}
          message={JSON.stringify({
            id_prop: selectedProperty.prop,
            id_per_orig: selectedProperty.per,
            id_per_dest: userClave
          })}
          onEncrypted={(result) => {
            setConversationEncrypting(false);
            handleConversationEncrypted(result);
          }}
          onError={(errorMsg) => {
            setConversationError(errorMsg);
            setConversationEncrypting(false);
            setLoadingConversation(false);
          }}
        />
      )}     

      {conversationDecrypting && encryptedConversationResponse && (
        <Decryptor
          password={encryptionPassword}
          encryptedMessage={encryptedConversationResponse}
          onDecrypted={(result) => {
            setConversationDecrypting(false);
            processDecryptedConversation(result);
          }}
          onError={(errorMsg) => {
            setConversationError(errorMsg);
            setConversationDecrypting(false);
            setLoadingConversation(false);
          }}
        />
      )}

      <form className="search-form" onSubmit={handleSearch}>
        <h3>{translations[currentLanguage].title}</h3>
        <button type="submit" disabled={loading}>
          {loading ? translations[currentLanguage].searching : translations[currentLanguage].searchButton}
        </button>
      </form>

      {encrypting && (
        <Encryptor
          password={encryptionPassword}
          message={JSON.stringify({
            fecini: "0001-01-01",
            fecfin: "9999-12-31"
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
            processDecryptedData(result);
          }}
          onError={(errorMsg) => {
            setError(errorMsg);
            setDecrypting(false);
            setLoading(false);
          }}
        />
      )}

      {error && (
        <div className="error-message">
          <span>{error}</span>
          <button onClick={handleRefresh} className="refresh-button">
            {translations[currentLanguage].searchButton}
          </button>
        </div>
      )}

      <div className="properties-grid">
        {properties === null ? (
          !hasSearched && (
            <div className="initial-message">
              {translations[currentLanguage].initialMessage}
            </div>
          )
        ) : properties.length > 0 ? (
          properties.map((property, index) => (
            <div 
              key={index} 
              className="property-card"
              onClick={() => handlePropertyClick(property)}
            >
              <div className="property-image-container">
                {property.imageUrl ? (
                  <img 
                    src={property.imageUrl} 
                    alt={`Property ${index}`}
                    className="property-image"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = '';
                      e.target.parentNode.innerHTML = `
                        <div class="no-image-placeholder">
                          ${translations[currentLanguage].noImageText}
                        </div>`;
                    }}
                  />
                ) : (
                  <div className="no-image-placeholder">
                    {translations[currentLanguage].noImageText}
                  </div>
                )}
              </div>
              <div className="property-details">
                <p><strong>ID:</strong> {property.prop}</p>
                <p><strong>Owner ID:</strong> {property.per}</p>
                <p><strong>{translations[currentLanguage].address}:</strong> {property.dir}</p>
                <p><strong>{translations[currentLanguage].state}:</strong> {property.state}</p>
                <p><strong>{translations[currentLanguage].price}:</strong> {property.amount?.toLocaleString(currentLanguage, {
                  style: 'currency',
                  currency: 'MXN'
                })}</p>
                <button 
                  className="contact-button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePropertyClick(property);
                  }}
                >
                  {translations[currentLanguage].contactOwner}
                </button>
              </div>
            </div>
          ))
        ) : (
          hasSearched && <div className="no-results">{translations[currentLanguage].noImages}</div>
        )}
      </div>

      {selectedProperty && userClave && (
        <ChatModal
          property={selectedProperty}
          currentLanguage={currentLanguage}
          onClose={() => setSelectedProperty(null)}
          userClaveColab={userClave}
          onSendMessage={handleSendMessage}
          initialConversation={initialConversation}
          loadingConversation={loadingConversation}
          conversationError={conversationError}
        />
      )}
    </div>
  );
};