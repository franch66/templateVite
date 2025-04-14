import { useState, useEffect } from 'react';

const Encryptor = ({ password, message, onEncrypted, onError }) => {
  const [isEncrypting, setIsEncrypting] = useState(true);
  console.log ('Va a encriptar')

  useEffect(() => {
    const encryptData = async () => {
      try {
        // Generar salt (16 bytes) y IV (12 bytes para AES-GCM)
        const salt = crypto.getRandomValues(new Uint8Array(16));
        const iv = crypto.getRandomValues(new Uint8Array(12));

        // Derivar clave
        const baseKey = await crypto.subtle.importKey(
          "raw",
          new TextEncoder().encode(password),
          { name: "PBKDF2" },
          false,
          ["deriveKey"]
        );

        const key = await crypto.subtle.deriveKey(
          {
            name: "PBKDF2",
            salt: salt,
            iterations: 100000,
            hash: "SHA-256",
          },
          baseKey,
          { name: "AES-GCM", length: 256 },
          false,
          ["encrypt"]
        );

        // Cifrar
        const encrypted = await crypto.subtle.encrypt(
          { name: "AES-GCM", iv: iv, tagLength: 128 },
          key,
          new TextEncoder().encode(message)
        );

        // Formatear resultado
        const combined = new Uint8Array([...salt, ...iv, ...new Uint8Array(encrypted)]);
        const result = btoa(String.fromCharCode(...combined))
          .replace(/\+/g, '-')
          .replace(/\//g, '_')
          .replace(/=+$/, '');

        onEncrypted(result);
      } catch (error) {
        onError(error.message);
      } finally {
        setIsEncrypting(false);
      }
    };

    encryptData();
  }, [password, message, onEncrypted, onError]);

  return null; // No renderiza nada
};

export default Encryptor;