import React, { useState, useEffect } from 'react';
import Encryptor from './Encryptor';
import Decryptor from './Decryptor';
import '../styles/Reguser.css';

const encryptionPassword = import.meta.env.VITE_ENCRYPTION_PASSWORD;

const translations = {
    es: {
      title: 'Registro de Usuario',
      nombre: 'Nombre (máx. 60 caracteres)',
      ap_paterno: 'Apellido Paterno (máx. 30)',
      ap_materno: 'Apellido Materno (máx. 30)',
      sexo: 'Sexo',
      fecha_nac: 'Fecha de Nacimiento',
      email: 'Correo Electrónico',
      num_tel: 'Teléfono (10 dígitos)',
      tippers: 'Tipo de Usuario',
      arrendador: 'Arrendador',
      arrendatario: 'Arrendatario',
      password: 'Contraseña',
      submit: 'Registrarse',
      submitting: 'Registrando...',
      required: 'Campo obligatorio',
      emailInvalid: 'Email inválido',
      phoneInvalid: 'Teléfono debe tener 10 dígitos',
      success: '¡Registro exitoso!',
      errorGeneral: 'Error en el registro'
    },
    en: {
      title: 'User Registration',
      nombre: 'Name (max 60 characters)',
      ap_paterno: 'Last Name (max 30)',
      ap_materno: "Mother's Maiden Name (max 30)",
      sexo: 'Gender',
      fecha_nac: 'Birth Date',
      email: 'Email',
      num_tel: 'Phone (10 digits)',
      tippers: 'User Type',
      arrendador: 'Landlord',
      arrendatario: 'Tenant',
      password: 'Password',
      submit: 'Register',
      submitting: 'Registering...',
      required: 'Required field',
      emailInvalid: 'Invalid email',
      phoneInvalid: 'Phone must have 10 digits',
      success: 'Registration successful!',
      errorGeneral: 'Registration error'
    },
    fr: {
      title: "Inscription de l'utilisateur",
      nombre: 'Nom (max 60 caractères)',
      ap_paterno: 'Nom de famille (max 30)',
      ap_materno: 'Nom de jeune fille de la mère (max 30)',
      sexo: 'Sexe',
      fecha_nac: 'Date de naissance',
      email: 'E-mail',
      num_tel: 'Téléphone (10 chiffres)',
      tippers: "Type d'utilisateur",
      arrendador: 'Propriétaire',
      arrendatario: 'Locataire',
      password: 'Mot de passe',
      submit: "S'inscrire",
      submitting: 'Enregistrement...',
      required: 'Champ obligatoire',
      emailInvalid: 'E-mail invalide',
      phoneInvalid: 'Le téléphone doit avoir 10 chiffres',
      success: 'Inscription réussie !',
      errorGeneral: "Erreur d'inscription"
    },
    zh: {
      title: '用户注册',
      nombre: '姓名（最多60个字符）',
      ap_paterno: '姓氏（最多30个字符）',
      ap_materno: '母亲娘家姓（最多30个字符）',
      sexo: '性别',
      fecha_nac: '出生日期',
      email: '电子邮件',
      num_tel: '电话（10位数字）',
      tippers: '用户类型',
      arrendador: '房东',
      arrendatario: '租户',
      password: '密码',
      submit: '注册',
      submitting: '注册中...',
      required: '必填字段',
      emailInvalid: '电子邮件无效',
      phoneInvalid: '电话必须为10位数字',
      success: '注册成功！',
      errorGeneral: '注册错误'
    }
  };
  

export const Registro = ({ currentLanguage }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    ap_paterno: '',
    ap_materno: '',
    sexo: 'H',
    fecha_nac: '',
    email: '',
    num_tel: '',
    lang: currentLanguage.toUpperCase(),
    tippers: [],
    password: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [encrypting, setEncrypting] = useState(false);
  const [decrypting, setDecrypting] = useState(false);
  const [encryptedResponse, setEncryptedResponse] = useState(null);

  useEffect(() => {
    if (encryptedResponse) {
      setDecrypting(true);
    }
  }, [encryptedResponse]);

  const handleEncryptedData = async (encryptedBody) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/regper`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(encryptedBody)
      });

      const responseData = await response.json();
      
      if (response.ok) {
        setEncryptedResponse(responseData);
      } else {
        throw new Error(responseData?.message || 'Error en registro');
      }
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const validateForm = () => {
    if (!formData.nombre || !formData.ap_paterno || !formData.sexo || 
        !formData.fecha_nac || !formData.email || !formData.num_tel || 
        formData.tippers.length === 0 || !formData.password) {
      setError('Todos los campos requeridos deben ser llenados');
      return false;
    }
    
    if (!/^\d{10}$/.test(formData.num_tel)) {
      setError('Teléfono debe tener 10 dígitos');
      return false;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('Formato de email inválido');
      return false;
    }

    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setLoading(true);
    setError('');
    setSuccess('');
    setEncrypting(true);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        tippers: checked 
          ? [...prev.tippers, value]
          : prev.tippers.filter(v => v !== value)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  return (
    <div className="registro-container">
      <h2>{translations[currentLanguage].title}</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>{translations[currentLanguage].nombre}</label>
          <input
            type="text"
            name="nombre"
            maxLength="60"
            value={formData.nombre}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>{translations[currentLanguage].ap_paterno}</label>
          <input
            type="text"
            name="ap_paterno"
            maxLength="30"
            value={formData.ap_paterno}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>{translations[currentLanguage].ap_materno}</label>
          <input
            type="text"
            name="ap_materno"
            maxLength="30"
            value={formData.ap_materno}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>{translations[currentLanguage].sexo}</label>
          <select
            name="sexo"
            value={formData.sexo}
            onChange={handleChange}
            required
          >
            <option value="H">{currentLanguage === 'en' ? 'Male' : 
              currentLanguage === 'fr' ? 'Homme' : 
              currentLanguage === 'zh' ? '男' : 'Hombre'}</option>
            <option value="M">{currentLanguage === 'en' ? 'Female' : 
              currentLanguage === 'fr' ? 'Femme' : 
              currentLanguage === 'zh' ? '女' : 'Mujer'}</option>
          </select>
        </div>

        <div className="form-group">
          <label>{translations[currentLanguage].fecha_nac}</label>
          <input
            type="date"
            name="fecha_nac"
            value={formData.fecha_nac}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>{translations[currentLanguage].email}</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>{translations[currentLanguage].num_tel}</label>
          <input
            type="tel"
            name="num_tel"
            pattern="\d{10}"
            value={formData.num_tel}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>{translations[currentLanguage].tippers}</label>
          <div className="checkbox-group">
            <label>
              <input
                type="checkbox"
                name="tippers"
                value="1"
                checked={formData.tippers.includes('1')}
                onChange={handleChange}
              />
              {translations[currentLanguage].arrendador}
            </label>
            <label>
              <input
                type="checkbox"
                name="tippers"
                value="2"
                checked={formData.tippers.includes('2')}
                onChange={handleChange}
              />
              {translations[currentLanguage].arrendatario}
            </label>
          </div>
        </div>

        <div className="form-group">
          <label>{translations[currentLanguage].password}</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? translations[currentLanguage].submitting : translations[currentLanguage].submit}
        </button>
      </form>
      

      {encrypting && (
        <Encryptor
          password={encryptionPassword}
          message={JSON.stringify({
            ...formData,
            tippers: formData.tippers.join(','),
            lang: currentLanguage.toUpperCase()
          })}
          onEncrypted={(result) => {
            setEncrypting(false);
            handleEncryptedData(result);
          }}
          onError={(errorMsg) => {
            setError(errorMsg);
            setEncrypting(false);
          }}
        />
      )}

      {decrypting && encryptedResponse && (
        <Decryptor
          password={encryptionPassword}
          encryptedMessage={encryptedResponse}
          onDecrypted={(result) => {
            setDecrypting(false);
            setSuccess('Registro exitoso!');
            setFormData({
              nombre: '',
              ap_paterno: '',
              ap_materno: '',
              sexo: 'H',
              fecha_nac: '',
              email: '',
              num_tel: '',
              lang: currentLanguage.toUpperCase(),
              tippers: [],
              password: ''
            });
          }}
          onError={(errorMsg) => {
            setError(errorMsg);
            setDecrypting(false);
          }}
        />
      )}

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}
    </div>
  );
};