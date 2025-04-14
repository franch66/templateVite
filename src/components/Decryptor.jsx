import { useState, useEffect } from 'react';
console.log('entra a dercriptar')

const Decryptor = ({ password, encryptedMessage, onDecrypted, onError }) => {
  const [isDecrypting, setIsDecrypting] = useState(true);

  useEffect(() => {
    const decryptData = async () => {
      try {
        // Convertir Base64 URL-safe a formato estándar
        let base64 = encryptedMessage
          .replace(/-/g, '+')
          .replace(/_/g, '/');

        // Añadir padding si es necesario
        const pad = base64.length % 4;
        if (pad) base64 += '==='.slice(0, 4 - pad);

        // Decodificar a ArrayBuffer
        const rawData = Uint8Array.from(atob(base64), c => c.charCodeAt(0));

        // Extraer componentes
        const salt = rawData.slice(0, 16);
        const iv = rawData.slice(16, 28);
        const ciphertextWithTag = rawData.slice(28);

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
          ["decrypt"]
        );

        // Descifrar
        const decrypted = await crypto.subtle.decrypt(
          {
            name: "AES-GCM",
            iv: iv,
            tagLength: 128,
          },
          key,
          ciphertextWithTag
        );

        // Convertir a string
        const decoded = new TextDecoder().decode(decrypted);
        onDecrypted(decoded);

      } catch (error) {
        onError(error.message || 'Error en el descifrado');
      } finally {
        setIsDecrypting(false);
      }
    };

    decryptData();
  }, [password, encryptedMessage, onDecrypted, onError]);

  return null; // No renderiza nada
};

export default Decryptor;