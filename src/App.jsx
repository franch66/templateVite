//https://es.react.dev/learn
import { useState } from 'react';
import './App.css';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { Registro } from './components/Registro';
import { Selper } from './components/Selper';
import { ListProps } from './components/ListProps';
import { Regprops } from './components/Regprops';
import { PrimerComponente } from './components/PrimerComponente';
import { Cypher } from './components/Cypher';
import { ListUser } from './components/ListUser';
import { Reguser } from './components/Reguser';
import { Delusr } from './components/Delusr';
import { Updusr } from './components/Updusr';
import { ListLogs } from './components/ListLogs';
import { Chatbot } from './components/Chatbot';
import { Listnivtran } from './components/Listnivtran';
import { Delnivtran } from './components/Delnivtran';
import { Regnivtran } from './components/Regnivtran';
import { Updnivtran } from './components/Updnivtran';

import { Analytics } from './components/Analytics';
import {MarketView} from './components/MarketView';
import { SelCiaTel } from './components/SelCiaTel';

import { Footer } from './components/Footer';

const homeContent = {
  es: {
    mainHeading: "Optimiza y Automatiza la Gestión de Pagos Inmobiliarios",
    mainText: "Una plataforma integral diseñada para propietarios y administradores que facilita el cobro de rentas, automatiza los pagos, ofrece incentivos a los inquilinos y simplifica la administración de inmuebles.",
    integrationHeading: "Integra Pagos y Recompensas en tu Portal del Inquilino",
    integrationText: "Configura múltiples métodos de pago, automatiza el cobro de rentas y ofrece incentivos a tus inquilinos en solo minutos. Transforma tu plataforma y mejora la experiencia de gestión hoy mismo."
  },
  en: {
    mainHeading: "Optimize and Automate Real Estate Payment Management",
    mainText: "A comprehensive platform designed for owners and managers that facilitates rent collection, automates payments, provides tenant incentives, and simplifies property management.",
    integrationHeading: "Integrate Payments and Rewards into Your Tenant Portal",
    integrationText: "Set up multiple payment methods, automate rent collection and offer tenant incentives in minutes. Transform your platform and improve the management experience today."
  },
  fr: {
    mainHeading: "Optimisez et Automatisez la Gestion des Paiements Immobiliers",
    mainText: "Une plateforme complète conçue pour les propriétaires et gestionnaires qui facilite la collecte des loyers, automatise les paiements, offre des incitations aux locataires et simplifie la gestion immobilière.",
    integrationHeading: "Intégrez Paiements et Récompenses dans votre Portail Locataire",
    integrationText: "Configurez plusieurs méthodes de paiement, automatisez la collecte des loyers et offrez des incitations aux locataires en quelques minutes. Transformez votre plateforme et améliorez l'expérience de gestion dès aujourd'hui."
  },
  zh: {
    mainHeading: "优化和自动化房地产支付管理",
    mainText: "一个为业主和管理者设计的综合平台，便于收取租金，自动化支付，提供租户激励并简化物业管理。",
    integrationHeading: "将支付和奖励集成到您的租户门户",
    integrationText: "在几分钟内设置多种支付方式，自动化租金收取并提供租户激励。立即改造您的平台并改善管理体验。"
  }
};


function App() {
  const [selectedComponent, setSelectedComponent] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState('es');
  const [userEmail, setUserEmail] = useState('');
  const [userClave, setUserClave] = useState('');

  const handleLanguageChange = (lang) => {
    setCurrentLanguage(lang);
  };

  const handleSidebarAction = (action) => {
    if (action === 'Inicio') { // Agregar manejo de acción Inicio
      setSelectedComponent(null);
      return;
    }    
    if (['SelCiaTel','Acción 1', 'Cypher'].includes(action) && !isAuthenticated) {
      const messages = {
        es: 'Debes iniciar sesión para acceder a esta función',
        en: 'You must login to access this feature',
        fr: 'Vous devez vous connecter pour accéder à cette fonctionnalité',
        zh: '您必须登录才能访问此功能'
      };
      alert(messages[currentLanguage]);
      return;
    }

    switch(action) {
      case 'registro':
        setSelectedComponent('registro');
        break;      
      case 'Perfil':
        setSelectedComponent('perfil');
        break;        
      case 'SelCiaTel':
        setSelectedComponent('SelCiaTel');
        break;      
      case 'Acción 1':
        setSelectedComponent('primer');
        break;
      case 'Cypher':
        setSelectedComponent('segundo');
        break;
      case 'Configuración usuarios':
        setSelectedComponent('config-usuarios');
        break;
      case 'Reguser':
        setSelectedComponent('reg-user');
        break; 
      case 'Configuración logs':
          setSelectedComponent('config-logs');
          break;               
      case 'Configuración transacciones':
        setSelectedComponent('config-transacciones');
        break; 
      case 'Regnivtran':
          setSelectedComponent('reg-nivtran');
          break;    
      case 'Configuración analíticos': 
          setSelectedComponent('analiticos');
          break;                     
      case 'MarketPlace':
        setSelectedComponent('marketplace-main');
        break;
      case 'Mantenimiento':
        setSelectedComponent('market-mantenimiento');
        break;
      case 'Market':
        setSelectedComponent('market-view');
        break;  
      case 'list-props': 
        setSelectedComponent('list-props');
        break;             
      case 'Cerrar Sesión':
        setIsAuthenticated(false);
        setSelectedComponent(null);
        break;
      default:
        setSelectedComponent(null);
    }
  };

  return (
    <div className="App">
      <Header 
        onAuthChange={(isAuth) => {
          setIsAuthenticated(isAuth);
          if (!isAuth) setUserEmail('');
        }}
        currentLanguage={currentLanguage}
        onLanguageChange={handleLanguageChange}
        setUserEmail={setUserEmail}
      />
      
      <div className="app-body">
        <Sidebar 
          onAction={handleSidebarAction}
          isAuthenticated={isAuthenticated}
          currentLanguage={currentLanguage}
          userEmail={userEmail} 
        />
        
        <div className="main-content">
          {selectedComponent === 'registro' && <Registro currentLanguage={currentLanguage} />}
          {selectedComponent === 'perfil' && <Selper userEmail={userEmail} currentLanguage={currentLanguage} onClaveObtenida={setUserClave} onNavigation={handleSidebarAction}/>}
          {selectedComponent === 'list-props' && 
            <ListProps 
              currentLanguage={currentLanguage}
              claveColab={userClave}
              onBack={() => setSelectedComponent('perfil')}
              onAddProperty={() => setSelectedComponent('reg-props')}
            />
          }
          {selectedComponent === 'reg-props' && 
            <Regprops
              currentLanguage={currentLanguage}
              claveColab={userClave}
              onSuccess={() => setSelectedComponent('list-props')}
              onCancel={() => setSelectedComponent('list-props')}
            />
          }  
                   
          {selectedComponent === 'SelCiaTel' && <SelCiaTel />}
          {selectedComponent === 'primer' && <PrimerComponente />}
          {selectedComponent === 'segundo' && <Cypher />}
          {selectedComponent === 'config-usuarios' && <ListUser onAction={handleSidebarAction} />}
          {selectedComponent === 'reg-user' && <Reguser />}
          {selectedComponent === 'delete-user' && <Updusr />}
          {selectedComponent === 'delete-user' && <Delusr />}
          {selectedComponent === 'config-logs' && <ListLogs />}
          {selectedComponent === 'reg-nivtran' && <Regnivtran />}
          {selectedComponent === 'delete-nivtran' && <Delnivtran />}
          {selectedComponent === 'delete-nivtran' && <Updnivtran />}
          {selectedComponent === 'config-transacciones' && <Listnivtran onAction={handleSidebarAction} />}
          {selectedComponent === 'market-view' && <MarketView currentLanguage={currentLanguage} userClave={userClave} />}
          {selectedComponent === 'analiticos' && <Analytics />}
          
          {!selectedComponent && (
            <div className="home-content">
              {/* Botón de registro */}
              <div className="main-register-button">
                <button 
                  className="big-register-btn"
                  onClick={() => setSelectedComponent('registro')}
                >
                  {currentLanguage === 'es' && 'Registro'}
                  {currentLanguage === 'en' && 'Register'}
                  {currentLanguage === 'fr' && 'Inscription'}
                  {currentLanguage === 'zh' && '注册'}
                </button>
              </div>              
              {/* Primera sección */}
              <div className="home-section">
                <div className="text-content">
                  <h1>{homeContent[currentLanguage].mainHeading}</h1>
                  <p>{homeContent[currentLanguage].mainText}</p>
                </div>
                <div className="image-content">
                  <img 
                    src="src/assets/imagen1.png" 
                    alt="Gestión de pagos" 
                  />
                </div>
              </div>
  
              {/* Segunda sección */}
              <div className="home-section reverse">
                <div className="image-content">
                  <img
                    src="src/assets/imagen2.png"
                    alt="Portal del inquilino"
                  />
                </div>
                <div className="text-content">
                  <h1>{homeContent[currentLanguage].integrationHeading}</h1>
                  <p>{homeContent[currentLanguage].integrationText}</p>
                </div>
              </div>
            </div>
          )}
        </div>
        <Chatbot currentLanguage={currentLanguage} />
      </div>
      <Footer currentLanguage={currentLanguage} />
    </div>
  );
}

export default App;