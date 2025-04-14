import React, { useState, useEffect } from 'react';
import Encryptor from './Encryptor';
import Decryptor from './Decryptor';
import { Regimage } from './Regimage';
import '../styles/ListProps.css';
import { Updprops } from './Updprops';

const encryptionPassword = import.meta.env.VITE_ENCRYPTION_PASSWORD;

const translations = {
  en: {
    loading: "Loading properties...",
    error: "Error retrieving properties",
    id: "ID",
    idPer: "User ID",
    idProp: "Property ID",
    address: "Address",
    city: "City",
    zipCode: "ZIP Code",
    state: "State",
    rent: "Rent",
    amount: "Amount",
    serviceFee: "Service Fee",
    contractStart: "Contract Start",
    contractEnd: "Contract End",
    contractPayDay: "Payment Day",
    recurringPayment: "Recurring",
    maxRetries: "Max Retries",
    cashback: "Cashback",
    marketplace: "Marketplace",
    yes: "Yes",
    no: "No",
    imagen: "Image",
    update: "Update"
  },
  es: {
    loading: "Cargando propiedades...",
    error: "Error al obtener propiedades",
    id: "ID",
    idPer: "ID Usuario",
    idProp: "ID Propiedad",
    address: "Dirección",
    city: "Ciudad",
    zipCode: "Código Postal",
    state: "Estado",
    rent: "Renta",
    amount: "Monto Total",
    serviceFee: "Tarifa de servicio",
    contractStart: "Inicio de contrato",
    contractEnd: "Fin de contrato",
    contractPayDay: "Día de pago",
    recurringPayment: "Recurrente",
    maxRetries: "Intentos máx.",
    cashback: "Recompensa",
    marketplace: "Mercado",
    yes: "Sí",
    no: "No",
    imagen: "Imagen",
    update: "Actualizar"
  },
  fr: {
    loading: "Chargement des propriétés...",
    error: "Erreur lors de la récupération des propriétés",
    id: "ID",
    idPer: "ID Utilisateur",
    idProp: "ID Propriété",
    address: "Adresse",
    city: "Ville",
    zipCode: "Code Postal",
    state: "État",
    rent: "Loyer",
    amount: "Montant Total",
    serviceFee: "Frais de service",
    contractStart: "Début du contrat",
    contractEnd: "Fin du contrat",
    contractPayDay: "Jour de paiement",
    recurringPayment: "Paiement récurrent",
    maxRetries: "Essais max",
    cashback: "Remboursement",
    marketplace: "Place de marché",
    yes: "Oui",
    no: "Non",
    imagen: "Image",
    update: "Mettre à jour"
  },
  zh: {
    loading: "正在加载房产信息...",
    error: "获取房产信息时出错",
    id: "编号",
    idPer: "用户编号",
    idProp: "房产编号",
    address: "地址",
    city: "城市",
    zipCode: "邮政编码",
    state: "州/省",
    rent: "租金",
    amount: "总金额",
    serviceFee: "服务费",
    contractStart: "合同开始日期",
    contractEnd: "合同结束日期",
    contractPayDay: "付款日",
    recurringPayment: "定期付款",
    maxRetries: "最大重试次数",
    cashback: "返现",
    marketplace: "市场",
    yes: "是",
    no: "否",
    imagen: "图片",
    update: "更新"
  }
};


export const ListProps = ({ currentLanguage, claveColab, onBack, onAddProperty }) => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [encrypting, setEncrypting] = useState(false);
  const [encryptedResponse, setEncryptedResponse] = useState(null);

  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedProp, setSelectedProp] = useState({id_per: '', id_prop: ''});

  const [updateModal, setUpdateModal] = useState({
    show: false,
    property: null
  });
  

  const formatBoolean = (value) => {
    return value ? translations[currentLanguage].yes : translations[currentLanguage].no;
  };

  const formatCurrency = (value) => {
    return value?.toLocaleString(currentLanguage, {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 2
    });
  };

  const fetchProperties = () => {
    if (!claveColab) {
      setError(translations[currentLanguage].error);
      setLoading(false);
      return;
    }
    setEncrypting(true);
  };

  useEffect(() => {
    fetchProperties();
  }, [claveColab, currentLanguage]);

  const openImageModal = (id_per, id_prop) => {
    setSelectedProp({id_per, id_prop});
    setShowImageModal(true);
  };

  const openUpdateModal = (property) => {
    setUpdateModal({ show: true, property });
    setError('');
  };

  const closeUpdateModal = () => {
    setUpdateModal({ show: false, property: null });
  };


  const handleEncryptedData = async (encryptedBody) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/selprops`, {
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
        // Manejo directo de errores 400/401 sin desencriptar
        const errorMsg = responseData?.response || translations[currentLanguage].error;
        throw new Error(errorMsg);
      }
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    
    // Manejar tanto "YYYY-MM-DD" como "YYYY-MM-DD HH:mm:ss"
    const datePart = dateString.split(' ')[0];
    const date = new Date(datePart);
    
    // Verificar si la fecha es válida
    if (isNaN(date.getTime())) return dateString;
    
    return date.toLocaleDateString(currentLanguage);
  };

  const handleRefresh = () => {
    setError('');
    setLoading(true);
    setProperties([]);
    setEncryptedResponse(null);
    fetchProperties();
  };


  return (
    <div className="list-props-container">
      <div className="action-buttons">
        <button className="cancel-button" onClick={onBack}>
          {translations[currentLanguage].cancel || 'Cancel'}
        </button>
        <button className="add-button" onClick={onAddProperty}>
          {translations[currentLanguage].add || 'Add Property'}
        </button>
      </div>

      {encrypting && (
        <Encryptor
          password={encryptionPassword}
          message={JSON.stringify({ id_per: claveColab })}
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
          <span>{error}</span>
          <button onClick={handleRefresh} className="refresh-button">
            {translations[currentLanguage].refresh || 'Refresh'}
          </button>
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
                setProperties(parsedData);
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

      {properties.length > 0 && (
        <div className="properties-table">
          <table>
            <thead>
              <tr>
                <th>{translations[currentLanguage].id}</th>
                <th>{translations[currentLanguage].idPer}</th>
                <th>{translations[currentLanguage].idProp}</th>
                <th>{translations[currentLanguage].address}</th>
                <th>{translations[currentLanguage].city}</th>
                <th>{translations[currentLanguage].state}</th>
                <th>{translations[currentLanguage].zipCode}</th>
                <th>{translations[currentLanguage].rent}</th>
                <th>{translations[currentLanguage].amount}</th>
                <th>{translations[currentLanguage].serviceFee}</th>
                <th>{translations[currentLanguage].contractStart}</th>
                <th>{translations[currentLanguage].contractEnd}</th>
                <th>{translations[currentLanguage].contractPayDay}</th>
                <th>{translations[currentLanguage].recurringPayment}</th>
                <th>{translations[currentLanguage].maxRetries}</th>
                <th>{translations[currentLanguage].cashback}</th>
                <th>{translations[currentLanguage].marketplace}</th>
                <th>{translations[currentLanguage].imagen}</th>
                <th>{translations[currentLanguage].update}</th>
              </tr>
            </thead>
            <tbody>
              {properties.map(prop => (
                <tr key={prop.id}>
                  <td>{prop.id}</td>
                  <td>{prop.id_per}</td>
                  <td>{prop.id_prop}</td>
                  <td>{prop["address:"]}</td>
                  <td>{prop.city}</td>
                  <td>{prop.state}</td>
                  <td>{prop.zipCode}</td>
                  <td>{formatCurrency(prop.rentAmount)}</td>
                  <td>{formatCurrency(prop.Amount)}</td>
                  <td>{formatCurrency(prop.serviceFee)}</td>
                  <td>{formatDate(prop.contractStartDate)}</td>
                  <td>{formatDate(prop.contractEndDate)}</td>
                  <td>{prop.contractPayDay}</td>
                  <td>{formatBoolean(prop.recurringPaymentIsActive)}</td>
                  <td>{prop.recurringPaymentMaxRetries}</td>
                  <td>{prop.cashback}%</td>
                  <td>{formatBoolean(prop.marketplace)}</td>
                  <td>
                    <button 
                      className="image-button"
                      onClick={() => openImageModal(prop.id_per, prop.id_prop)}
                      title={translations[currentLanguage].addImage}
                    >
                      <i className="fas fa-image"></i>
                    </button>
                  </td>
                  <td> 
                  <button 
                    className="image-button"
                    onClick={() => openUpdateModal(prop)}
                    title={translations[currentLanguage].update || 'Update'}
                  >
                    <i className="fas fa-edit"></i>
                  </button>                    
                  </td>                  
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
        {showImageModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <Regimage 
                id_per={selectedProp.id_per}
                id_prop={selectedProp.id_prop}
                onClose={() => setShowImageModal(false)}
                onSuccess={() => {
                  setShowImageModal(false);
                  handleRefresh();
                }}
                currentLanguage={currentLanguage}
              />
            </div>
          </div>
        )}   
{updateModal.show && (
  <div className="modal-overlay">
    <div className="modal-content">
      <Updprops 
        propertyData={updateModal.property}
        onClose={closeUpdateModal}
        onSuccess={() => {
          closeUpdateModal();
          handleRefresh();
        }}
        currentLanguage={currentLanguage}
      />
    </div>
  </div>
)}  
    </div>
  );
};