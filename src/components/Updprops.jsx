import React, { useState , useEffect} from 'react';
import Encryptor from './Encryptor';
import '../styles/Updprops.css';

const encryptionPassword = import.meta.env.VITE_ENCRYPTION_PASSWORD;

const translations = {
  en: {
    title: "Update Property",
    address: "Address",
    city: "City",
    state: "State",
    zipCode: "ZIP Code",
    rentAmount: "Rent Amount",
    totalAmount: "Total Amount",
    serviceFee: "Service Fee",
    contractStart: "Contract Start Date",
    contractEnd: "Contract End Date",
    payDay: "Payment Day",
    recurring: "Recurring Payment",
    maxRetries: "Max Retries",
    cashback: "Cashback %",
    marketplace: "Marketplace Enabled",
    update: "Update",
    cancel: "Cancel",
    success: "Property updated successfully",
    error: "Error updating property",
    required: "This field is required",
    invalidNumber: "Must be a valid number",
    invalidDate: "End date must be after start date"
  },
  es: {
    title: "Actualizar Propiedad",
    address: "Dirección",
    city: "Ciudad",
    state: "Estado",
    zipCode: "Código Postal",
    rentAmount: "Monto de Renta",
    totalAmount: "Monto Total",
    serviceFee: "Tarifa de Servicio",
    contractStart: "Fecha Inicio Contrato",
    contractEnd: "Fecha Fin Contrato",
    payDay: "Día de Pago",
    recurring: "Pago Recurrente",
    maxRetries: "Intentos Máximos",
    cashback: "Cashback %",
    marketplace: "Marketplace Habilitado",
    update: "Actualizar",
    cancel: "Cancelar",
    success: "Propiedad actualizada correctamente",
    error: "Error al actualizar propiedad",
    required: "Este campo es requerido",
    invalidNumber: "Debe ser un número válido",
    invalidDate: "La fecha fin debe ser posterior a la fecha inicio"
  },
  fr: {
    title: "Mettre à jour la propriété",
    address: "Adresse",
    city: "Ville",
    state: "État",
    zipCode: "Code postal",
    rentAmount: "Montant du loyer",
    totalAmount: "Montant total",
    serviceFee: "Frais de service",
    contractStart: "Date de début du contrat",
    contractEnd: "Date de fin du contrat",
    payDay: "Jour de paiement",
    recurring: "Paiement récurrent",
    maxRetries: "Tentatives max",
    cashback: "Cashback %",
    marketplace: "Marketplace activé",
    update: "Mettre à jour",
    cancel: "Annuler",
    success: "Propriété mise à jour avec succès",
    error: "Erreur lors de la mise à jour",
    required: "Ce champ est obligatoire",
    invalidNumber: "Doit être un nombre valide",
    invalidDate: "La date de fin doit être postérieure à la date de début"
  },
  zh: {
    title: "更新属性",
    address: "地址",
    city: "城市",
    state: "州",
    zipCode: "邮政编码",
    rentAmount: "租金金额",
    totalAmount: "总金额",
    serviceFee: "服务费",
    contractStart: "合同开始日期",
    contractEnd: "合同结束日期",
    payDay: "付款日",
    recurring: "定期付款",
    maxRetries: "最大重试次数",
    cashback: "返现 %",
    marketplace: "启用市场",
    update: "更新",
    cancel: "取消",
    success: "属性更新成功",
    error: "更新属性时出错",
    required: "此字段是必需的",
    invalidNumber: "必须是有效数字",
    invalidDate: "结束日期必须在开始日期之后"
  }
};

export const Updprops = ({ 
  propertyData, 
  onClose, 
  onSuccess,
  currentLanguage 
}) => {
    const [formData, setFormData] = useState({
        id: propertyData.id || '',
        rentAmount: propertyData.rentAmount || '',
        address: propertyData["address:"] || '',
        city: propertyData.city || '',
        zipCode: propertyData.zipCode || '',
        state: propertyData.state || '',
        Amount: propertyData.Amount || '',
        serviceFee: propertyData.serviceFee || '',
        contractStartDate: propertyData.contractStartDate ? 
          propertyData.contractStartDate.split(' ')[0] : '',
        contractEndDate: propertyData.contractEndDate ? 
          propertyData.contractEndDate.split(' ')[0] : '',
        contractPayDay: propertyData.contractPayDay || 0,
        recurringPaymentIsActive: propertyData.recurringPaymentIsActive || 0,
        recurringPaymentMaxRetries: propertyData.recurringPaymentMaxRetries || 0,
        cashback: propertyData.cashback || 0,
        marketplace: propertyData.marketplace || 0
      });
  
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [encrypting, setEncrypting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState({
    isSubmitting: false,
    hasSubmitted: false,
    error: null
  });

  useEffect(() => {
    return () => {
      // Limpia el estado cuando el componente se desmonta
      setSubmitStatus({ isSubmitting: false, hasSubmitted: false, error: null });
      setEncrypting(false);
    };
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (checked ? 1 : 0) : value
    }));
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    
    // Required fields
    const requiredFields = ['address', 'city', 'state', 'zipCode', 'rentAmount'];
    requiredFields.forEach(field => {
      if (!formData[field]) {
        newErrors[field] = translations[currentLanguage].required;
      }
    });
    
    // Numeric fields
    const numericFields = ['rentAmount', 'Amount', 'serviceFee', 'cashback'];
    numericFields.forEach(field => {
      if (formData[field] && isNaN(formData[field])) {
        newErrors[field] = translations[currentLanguage].invalidNumber;
      }
    });
    
    // Date validation
    if (formData.contractStartDate && formData.contractEndDate) {
      const startDate = new Date(formData.contractStartDate);
      const endDate = new Date(formData.contractEndDate);
      if (endDate <= startDate) {
        newErrors.contractEndDate = translations[currentLanguage].invalidDate;
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validate() || submitStatus.isSubmitting || submitStatus.hasSubmitted) return;
    
    setSubmitStatus({ isSubmitting: true, hasSubmitted: false, error: null });
    setEncrypting(true);
  };

  const handleEncryptedData = async (encryptedData) => {
    // Verificación adicional de estado
    if (!submitStatus.isSubmitting || submitStatus.hasSubmitted) return;
  
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/updprops`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token
        },
        body: JSON.stringify(encryptedData)
      });
      
      const responseData = await response.json();
      
      if (response.ok) {
        setSubmitStatus({ isSubmitting: false, hasSubmitted: true, error: null });
        onSuccess();
        onClose();
      } else {
        const errorMsg = responseData?.response || translations[currentLanguage].error;
        setSubmitStatus({ isSubmitting: false, hasSubmitted: false, error: errorMsg });
        setError(errorMsg);
      }
    } catch (err) {
      const errorMsg = translations[currentLanguage].error;
      setSubmitStatus({ isSubmitting: false, hasSubmitted: false, error: errorMsg });
      setError(errorMsg);
      console.error('Update error:', err);
    } finally {
      setEncrypting(false);
    }
  };
  

  return (
    <div className="updprops-modal-overlay">
      <div className="updprops-modal-content">
        <h2>{translations[currentLanguage].title}</h2>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>{translations[currentLanguage].address}</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              required
            />
            {errors.address && <span className="error">{errors.address}</span>}
          </div>
          
          <div className="form-group">
            <label>{translations[currentLanguage].city}</label>
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleChange}
              required
            />
            {errors.city && <span className="error">{errors.city}</span>}
          </div>
          
          <div className="form-group">
            <label>{translations[currentLanguage].state}</label>
            <input
              type="text"
              name="state"
              value={formData.state}
              onChange={handleChange}
              required
            />
            {errors.state && <span className="error">{errors.state}</span>}
          </div>
          
          <div className="form-group">
            <label>{translations[currentLanguage].zipCode}</label>
            <input
              type="text"
              name="zipCode"
              value={formData.zipCode}
              onChange={handleChange}
              required
            />
            {errors.zipCode && <span className="error">{errors.zipCode}</span>}
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>{translations[currentLanguage].rentAmount}</label>
              <input
                type="number"
                name="rentAmount"
                value={formData.rentAmount}
                onChange={handleChange}
                step="0.01"
                required
              />
              {errors.rentAmount && <span className="error">{errors.rentAmount}</span>}
            </div>
            
            <div className="form-group">
              <label>{translations[currentLanguage].totalAmount}</label>
              <input
                type="number"
                name="Amount"
                value={formData.Amount}
                onChange={handleChange}
                step="0.01"
              />
              {errors.Amount && <span className="error">{errors.Amount}</span>}
            </div>
          </div>
          
          <div className="form-group">
            <label>{translations[currentLanguage].serviceFee}</label>
            <input
              type="number"
              name="serviceFee"
              value={formData.serviceFee}
              onChange={handleChange}
              step="0.01"
            />
            {errors.serviceFee && <span className="error">{errors.serviceFee}</span>}
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>{translations[currentLanguage].contractStart}</label>
              <input
                type="date"
                name="contractStartDate"
                value={formData.contractStartDate}
                onChange={handleChange}
              />
            </div>
            
            <div className="form-group">
              <label>{translations[currentLanguage].contractEnd}</label>
              <input
                type="date"
                name="contractEndDate"
                value={formData.contractEndDate}
                onChange={handleChange}
              />
              {errors.contractEndDate && <span className="error">{errors.contractEndDate}</span>}
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>{translations[currentLanguage].payDay}</label>
              <input
                type="number"
                name="contractPayDay"
                value={formData.contractPayDay}
                onChange={handleChange}
                min="1"
                max="31"
              />
            </div>
            
            <div className="form-group">
              <label>{translations[currentLanguage].maxRetries}</label>
              <input
                type="number"
                name="recurringPaymentMaxRetries"
                value={formData.recurringPaymentMaxRetries}
                onChange={handleChange}
                min="0"
                max="10"
              />
            </div>
          </div>
          
          <div className="form-group">
            <label>{translations[currentLanguage].cashback}</label>
            <input
              type="number"
              name="cashback"
              value={formData.cashback}
              onChange={handleChange}
              min="0"
              max="100"
              step="1"
            />
            {errors.cashback && <span className="error">{errors.cashback}</span>}
          </div>
          
          <div className="form-checkbox">
            <label>
              <input
                type="checkbox"
                name="recurringPaymentIsActive"
                checked={!!formData.recurringPaymentIsActive}
                onChange={handleChange}
              />
              {translations[currentLanguage].recurring}
            </label>
          </div>
          
          <div className="form-checkbox">
            <label>
              <input
                type="checkbox"
                name="marketplace"
                checked={!!formData.marketplace}
                onChange={handleChange}
              />
              {translations[currentLanguage].marketplace}
            </label>
          </div>
          
          <div className="form-actions">
            <button 
                type="button" 
                onClick={() => {
                if (!submitStatus.isSubmitting) onClose();
                }}
                disabled={submitStatus.isSubmitting}
            >
                {translations[currentLanguage].cancel}
            </button>
            <button 
                type="submit" 
                disabled={submitStatus.isSubmitting || submitStatus.hasSubmitted}
            >
                {submitStatus.isSubmitting ? '...' : translations[currentLanguage].update}
            </button>
            </div>
        </form>
        
        {encrypting && submitStatus.isSubmitting && !submitStatus.hasSubmitted && (
        <Encryptor
            password={encryptionPassword}
            message={JSON.stringify(formData)}
            onEncrypted={handleEncryptedData}
            onError={(errorMsg) => {
            setSubmitStatus({ isSubmitting: false, hasSubmitted: false, error: errorMsg });
            setError(errorMsg);
            setEncrypting(false);
            }}
        />
        )}
      </div>
    </div>
  );
};