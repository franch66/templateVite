import React, { useState, useEffect ,useRef } from 'react';
import Encryptor from './Encryptor';
import Decryptor from './Decryptor';
import '../styles/Chatbot.css';

const encryptionPassword = import.meta.env.VITE_ENCRYPTION_PASSWORD;

export const Chatbot  = ({ currentLanguage }) => {
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [encrypting, setEncrypting] = useState(false);
  const [decrypting, setDecrypting] = useState(false);
  const [encryptedResponse, setEncryptedResponse] = useState(null);
  const [isOpen, setIsOpen] = useState(false);

  const questionRef = useRef('');

  useEffect(() => {
    if (encryptedResponse) {
      setDecrypting(true);
    }
  }, [encryptedResponse]);

  const handleEncryptedData = async (encryptedBody) => {
    const token = localStorage.getItem('authToken');
//    if (!token) {
//      setError('Debes iniciar sesión para usar el chatbot');
//      setLoading(false);
//      return;
//    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/chatbot`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token
        },
        body: JSON.stringify(encryptedBody)
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.message || 'Error en la respuesta del chatbot');
      }

      setEncryptedResponse(responseData);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const currentQuestion = question.trim();
    if (!currentQuestion) return;

    setLoading(true);
    setError('');
    setMessages(prev => [...prev, { type: 'user', content: currentQuestion }]);
    questionRef.current = currentQuestion;
    setQuestion('');
    setEncrypting(true);
  };

  return (
    <div className={`chatbot-container ${isOpen ? 'open' : ''}`}>
      <button 
        className="chatbot-toggle"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? '×' : '🤖'}
      </button>

      {isOpen && (
        <div className="chatbot-content">
          <div className="chatbot-header">
            <h3>Asistente AI</h3>
          </div>
          
          <div className="chatbot-messages">
            {messages.map((msg, index) => (
              <div key={index} className={`message ${msg.type}`}>
                {msg.content}
              </div>
            ))}
            {loading && <div className="message bot">Procesando...</div>}
            {error && <div className="message error">{error}</div>}
          </div>

          <form className="chatbot-input" onSubmit={handleSubmit}>
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Escribe tu pregunta..."
              disabled={loading}
            />
            <button type="submit" disabled={loading}>
              {loading ? '...' : 'Enviar'}
            </button>
          </form>

          {encrypting && (
            <Encryptor
              password={encryptionPassword}
              message={JSON.stringify({ 
                question: questionRef.current,
                lang: currentLanguage.toUpperCase() // 2. Agregar campo lang
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
                  const parsedData = JSON.parse(result);
                  if (Array.isArray(parsedData) && parsedData[0]?.response) {
                    setMessages(prev => [...prev, {
                      type: 'bot', 
                      content: parsedData[0].response
                    }]);
                  }
                } catch (err) {
                  setError('Error al interpretar la respuesta');
                }
                setLoading(false);
              }}
              onError={(errorMsg) => {
                setError(errorMsg);
                setDecrypting(false);
                setLoading(false);
              }}
            />
          )}
        </div>
      )}
    </div>
  );
};