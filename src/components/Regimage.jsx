import React, { useState, useEffect } from 'react';
import Encryptor from './Encryptor';
import Decryptor from './Decryptor';
import '../styles/Regimage.css';

const encryptionPassword = import.meta.env.VITE_ENCRYPTION_PASSWORD;

const translations = {
  en: {
    addImage: "Add Image",
    selectImage: "Select Image",
    uploadImage: "Upload Image",
    fileTypes: "Allowed formats: PNG, JPEG, JPG, GIF",
    success: "Image uploaded successfully",
    close: "Close",
    cancel: "Cancel"
  },
  es: {
    addImage: "Agregar Imagen",
    selectImage: "Seleccionar Imagen",
    uploadImage: "Subir Imagen",
    fileTypes: "Formatos permitidos: PNG, JPEG, JPG, GIF",
    success: "Imagen subida exitosamente",
    close: "Cerrar",
    cancel: "Cancelar"
  },
  fr: {
    addImage: "Ajouter une image",
    selectImage: "Sélectionner une image",
    uploadImage: "Télécharger l'image",
    fileTypes: "Formats autorisés: PNG, JPEG, JPG, GIF",
    success: "Image téléchargée avec succès",
    close: "Fermer",
    cancel: "Annuler"
  },
  zh: {
    addImage: "添加图片",
    selectImage: "选择图片",
    uploadImage: "上传图片",
    fileTypes: "允许的格式: PNG, JPEG, JPG, GIF",
    success: "图片上传成功",
    close: "关闭",
    cancel: "取消"
  }
};

export const Regimage = ({ id_per, id_prop, onClose, onSuccess, currentLanguage }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [encrypting, setEncrypting] = useState(false);
  const [encryptedResponse, setEncryptedResponse] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.match(/image\/(png|jpeg|jpg|gif)/)) {
      setError(translations[currentLanguage].fileTypes);
      return;
    }

    setSelectedFile(file);
    setError('');

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (!selectedFile) {
      setError(translations[currentLanguage].selectImage);
      setLoading(false);
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(selectedFile);
    reader.onloadend = () => {
      const base64Data = reader.result.split(',')[1];
      const payload = {
        id_per,
        id_prop,
        filename: selectedFile.name,
        image: base64Data
      };
      setEncrypting(true);
    };
  };

  const handleEncryptedData = async (encryptedBody) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/saveimag`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token
        },
        body: JSON.stringify(encryptedBody)
      });

      let responseData;
      try {
        responseData = await response.json();
      } catch (jsonError) {
        throw new Error('Invalid server response format');
      }

      if (!response.ok) {
        const errorMsg = responseData?.response || translations[currentLanguage].uploadFailed;
        throw new Error(errorMsg);
      }

      setEncryptedResponse(responseData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (encryptedResponse) {
      setSuccess(translations[currentLanguage].success);
      setTimeout(() => {
        onSuccess();
      }, 1500);
    }
  }, [encryptedResponse]);

  return (
    <div className="regimage-container">
      <div className="modal-header">
        <h3>{translations[currentLanguage].addImage}</h3>
        <button onClick={onClose} className="close-button">
          &times;
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>{translations[currentLanguage].selectImage}</label>
          <input
            type="file"
            accept="image/png, image/jpeg, image/jpg, image/gif"
            onChange={handleFileChange}
            required
          />
          <small>{translations[currentLanguage].fileTypes}</small>
        </div>

        {preview && (
          <div className="image-preview">
            <img src={preview} alt="Preview" />
            <p>{selectedFile?.name}</p>
          </div>
        )}

        <div className="form-actions">
          <button type="button" onClick={onClose}>
            {translations[currentLanguage].cancel}
          </button>
          <button type="submit" disabled={loading}>
            {loading ? '...' : translations[currentLanguage].uploadImage}
          </button>
        </div>
      </form>

      {encrypting && (
        <Encryptor
          password={encryptionPassword}
          message={JSON.stringify({
            id_per,
            id_prop,
            filename: selectedFile?.name || "",
            image: preview.split(',')[1] || ""
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

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}
    </div>
  );
};