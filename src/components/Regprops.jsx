import React, { useState } from 'react';
import Encryptor from './Encryptor';
import '../styles/Regprops.css';

const encryptionPassword = import.meta.env.VITE_ENCRYPTION_PASSWORD;

const translations = {
    en: {
      addProperty: "Add New Property",
      propertyInfo: "Property Information",
      financialInfo: "Financial Information",
      contractInfo: "Contract Details",
      address: "Address",
      city: "City",
      state: "State",
      zipCode: "ZIP Code",
      rentAmount: "Rent Amount",
      amount: "Total Amount",
      serviceFee: "Service Fee",
      contractStartDate: "Contract Start Date",
      contractEndDate: "Contract End Date",
      contractPayDay: "Payment Day (1-31)",
      recurringPayment: "Recurring Payment",
      maxRetries: "Max Payment Retries",
      cashback: "Cashback Percentage",
      marketplace: "List in Marketplace",
      save: "Save Property",
      cancel: "Cancel",
      requiredField: "This field is required",
      invalidNumber: "Must be a valid number",
      invalidDate: "Invalid date format",
      registrationFailed: "Registration failed",
      fieldMissing: "Field missing: ",
      invalidResponseFormat: "Invalid server response format",
      serverError: "Server communication error",
      successMessage: "Property registered successfully"
    },
    es: {
      addProperty: "Agregar Nueva Propiedad",
      propertyInfo: "Información de Propiedad",
      financialInfo: "Información Financiera",
      contractInfo: "Detalles de Contrato",
      address: "Dirección",
      city: "Ciudad",
      state: "Estado",
      zipCode: "Código Postal",
      rentAmount: "Monto de Renta",
      amount: "Monto Total",
      serviceFee: "Tarifa de Servicio",
      contractStartDate: "Fecha Inicio Contrato",
      contractEndDate: "Fecha Fin Contrato",
      contractPayDay: "Día de Pago (1-31)",
      recurringPayment: "Pago Recurrente",
      maxRetries: "Intentos Máximos de Pago",
      cashback: "Porcentaje de Recompensa",
      marketplace: "Listar en Mercado",
      save: "Guardar Propiedad",
      cancel: "Cancelar",
      requiredField: "Este campo es requerido",
      invalidNumber: "Debe ser un número válido",
      invalidDate: "Formato de fecha inválido",
      registrationFailed: "Registro fallido",
      fieldMissing: "Campo faltante: ",
      invalidResponseFormat: "Formato de respuesta inválido del servidor",
      serverError: "Error en la comunicación con el servidor",
      successMessage: "Propiedad registrada exitosamente"
    },
    fr: {
      addProperty: "Ajouter une nouvelle propriété",
      propertyInfo: "Informations sur la propriété",
      financialInfo: "Informations financières",
      contractInfo: "Détails du contrat",
      address: "Adresse",
      city: "Ville",
      state: "État",
      zipCode: "Code postal",
      rentAmount: "Montant du loyer",
      amount: "Montant total",
      serviceFee: "Frais de service",
      contractStartDate: "Date de début du contrat",
      contractEndDate: "Date de fin du contrat",
      contractPayDay: "Jour de paiement (1-31)",
      recurringPayment: "Paiement récurrent",
      maxRetries: "Tentatives de paiement max",
      cashback: "Pourcentage de remise",
      marketplace: "Lister sur le marché",
      save: "Enregistrer la propriété",
      cancel: "Annuler",
      requiredField: "Ce champ est obligatoire",
      invalidNumber: "Doit être un nombre valide",
      invalidDate: "Format de date invalide",
      registrationFailed: "Échec de l'enregistrement",
      fieldMissing: "Champ manquant: ",
      invalidResponseFormat: "Format de réponse du serveur invalide",
      serverError: "Erreur de communication avec le serveur",
      successMessage: "Propriété enregistrée avec succès"
    },
    zh: {
      addProperty: "添加新物业",
      propertyInfo: "物业信息",
      financialInfo: "财务信息",
      contractInfo: "合同详情",
      address: "地址",
      city: "城市",
      state: "州",
      zipCode: "邮政编码",
      rentAmount: "租金金额",
      amount: "总金额",
      serviceFee: "服务费",
      contractStartDate: "合同开始日期",
      contractEndDate: "合同结束日期",
      contractPayDay: "付款日 (1-31)",
      recurringPayment: "定期付款",
      maxRetries: "最大付款重试次数",
      cashback: "返现百分比",
      marketplace: "在市场上列出",
      save: "保存物业",
      cancel: "取消",
      requiredField: "此字段为必填项",
      invalidNumber: "必须是有效的数字",
      invalidDate: "日期格式无效",
      registrationFailed: "注册失败",
      fieldMissing: "缺少字段: ",
      invalidResponseFormat: "服务器响应格式无效",
      serverError: "服务器通信错误",
      successMessage: "物业注册成功"
    }
  };

export const Regprops = ({ currentLanguage, claveColab, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    id_per: claveColab,
    rentAmount: '',
    address: '',
    city: '',
    zipCode: '',
    state: '',
    Amount: '',
    serviceFee: '',
    contractStartDate: '',
    contractEndDate: '',
    contractPayDay: 0,
    recurringPaymentIsActive: 0,
    recurringPaymentMaxRetries: 0,
    cashback: '',
    marketplace: 0
  });
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (checked ? 1 : 0) : value
    }));
  };

  const handleNumberChange = (e) => {
    const { name, value } = e.target;
    if (value === '' || !isNaN(value)) {
      setFormData(prev => ({
        ...prev,
        [name]: value === '' ? '' : Number(value)
      }));
    }
  };

  const validateForm = () => {
    const requiredFields = ['address', 'rentAmount', 'city', 'state', 'zipCode'];
    for (const field of requiredFields) {
      if (!formData[field]) {
        setError(`${translations[currentLanguage].fieldMissing}${translations[currentLanguage][field]}`);
        return false;
      }
    }
    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    
    if (!validateForm()) return;

    setLoading(true);
    
    // Preparar datos numéricos
    const submissionData = {
      ...formData,
      rentAmount: Number(formData.rentAmount),
      Amount: Number(formData.Amount || formData.rentAmount * 1.1), // Cálculo automático si no se especifica
      serviceFee: Number(formData.serviceFee),
      cashback: Number(formData.cashback),
      contractPayDay: Number(formData.contractPayDay),
      recurringPaymentIsActive: formData.recurringPaymentIsActive ? 1 : 0,
      recurringPaymentMaxRetries: Number(formData.recurringPaymentMaxRetries),
      marketplace: formData.marketplace ? 1 : 0
    };
  };

  const handleEncryptedSubmit = async (encryptedData) => {
    const token = localStorage.getItem('authToken');
    setLoading(true);
    setError('');
  
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/regprops`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token
        },
        body: JSON.stringify(encryptedData)
      });
  
      let responseData;
      try {
        responseData = await response.json();
      } catch (jsonError) {
        throw new Error(translations[currentLanguage].invalidResponseFormat);
      }
  
      if (!response.ok) {
        let errorMessage = translations[currentLanguage].registrationFailed;
        
        // Manejo específico para 400 y 401
        if (response.status === 400 || response.status === 401) {
          errorMessage = Array.isArray(responseData) 
            ? responseData[0]?.response 
            : responseData?.response || errorMessage;
        }
        
        throw new Error(errorMessage);
      }
  
      // Éxito - refrescar lista
      onSuccess();
    } catch (err) {
      setError(err.message || translations[currentLanguage].serverError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="regprops-container">
      <h2>{translations[currentLanguage].addProperty}</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="form-section">
          <h3>{translations[currentLanguage].propertyInfo}</h3>
          
          <div className="form-group">
            <label>{translations[currentLanguage].address}*</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>{translations[currentLanguage].city}*</label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>{translations[currentLanguage].state}*</label>
              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>{translations[currentLanguage].zipCode}*</label>
              <input
                type="text"
                name="zipCode"
                value={formData.zipCode}
                onChange={handleChange}
                required
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>{translations[currentLanguage].financialInfo}</h3>
          
          <div className="form-row">
            <div className="form-group">
              <label>{translations[currentLanguage].rentAmount}*</label>
              <input
                type="number"
                name="rentAmount"
                value={formData.rentAmount}
                onChange={handleNumberChange}
                min="0"
                step="0.01"
                required
              />
            </div>

            <div className="form-group">
              <label>{translations[currentLanguage].amount}</label>
              <input
                type="number"
                name="Amount"
                value={formData.Amount}
                onChange={handleNumberChange}
                min="0"
                step="0.01"
              />
            </div>

            <div className="form-group">
              <label>{translations[currentLanguage].serviceFee}</label>
              <input
                type="number"
                name="serviceFee"
                value={formData.serviceFee}
                onChange={handleNumberChange}
                min="0"
                step="0.01"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>{translations[currentLanguage].cashback} (%)</label>
              <input
                type="number"
                name="cashback"
                value={formData.cashback}
                onChange={handleNumberChange}
                min="0"
                max="100"
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>{translations[currentLanguage].contractInfo}</h3>
          
          <div className="form-row">
            <div className="form-group">
              <label>{translations[currentLanguage].contractStartDate}*</label>
              <input
                type="date"
                name="contractStartDate"
                value={formData.contractStartDate}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>{translations[currentLanguage].contractEndDate}*</label>
              <input
                type="date"
                name="contractEndDate"
                value={formData.contractEndDate}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>{translations[currentLanguage].contractPayDay}</label>
              <input
                type="number"
                name="contractPayDay"
                value={formData.contractPayDay}
                onChange={handleNumberChange}
                min="1"
                max="31"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group checkbox-group">
              <input
                type="checkbox"
                id="recurringPayment"
                name="recurringPaymentIsActive"
                checked={formData.recurringPaymentIsActive}
                onChange={handleChange}
              />
              <label htmlFor="recurringPayment">
                {translations[currentLanguage].recurringPayment}
              </label>
            </div>

            <div className="form-group">
              <label>{translations[currentLanguage].maxRetries}</label>
              <input
                type="number"
                name="recurringPaymentMaxRetries"
                value={formData.recurringPaymentMaxRetries}
                onChange={handleNumberChange}
                min="0"
                max="10"
              />
            </div>
          </div>

          <div className="form-group checkbox-group">
            <input
              type="checkbox"
              id="marketplace"
              name="marketplace"
              checked={formData.marketplace}
              onChange={handleChange}
            />
            <label htmlFor="marketplace">
              {translations[currentLanguage].marketplace}
            </label>
          </div>
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <div className="form-actions">
          <button type="button" className="cancel-btn" onClick={onCancel}>
            {translations[currentLanguage].cancel}
          </button>
          <button type="submit" className="save-btn" disabled={loading}>
            {loading ? '...' : translations[currentLanguage].save}
          </button>
        </div>
      </form>

      {loading && (
        <Encryptor
          password={encryptionPassword}
          message={JSON.stringify(formData)}
          onEncrypted={handleEncryptedSubmit}
          onError={(errorMsg) => {
            setError(errorMsg);
            setLoading(false);
          }}
        />
      )}
    </div>
  );
};