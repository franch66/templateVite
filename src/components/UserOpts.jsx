import React, { useState } from 'react';
import '../styles/UserOpts.css';

const translations = {
  en: {
    properties: "Properties",
    listProperties: "List Properties",
    viewProperties: "View Properties",
    wallet: "Wallet",
    listAccounts: "List Accounts",
    viewTransactions: "View Transactions",
    marketplace: "Marketplace",
    viewMarketplace: "View Marketplace"
  },
  es: {
    properties: "Propiedades",
    listProperties: "Listar Propiedades",
    viewProperties: "Ver Propiedades",
    wallet: "Billetera",
    listAccounts: "Listar Cuentas",
    viewTransactions: "Ver Movimientos",
    marketplace: "Marketplace",
    viewMarketplace: "Ver Marketplace"
  },
  fr: {
    properties: "Propriétés",
    listProperties: "Lister les propriétés",
    viewProperties: "Voir les propriétés",
    wallet: "Portefeuille",
    listAccounts: "Liste des comptes",
    viewTransactions: "Voir les transactions",
    marketplace: "Marketplace",
    viewMarketplace: "Voir le Marketplace"
  },
  zh: {
    properties: "属性",
    listProperties: "列出属性",
    viewProperties: "查看属性",
    wallet: "钱包",
    listAccounts: "列出账户",
    viewTransactions: "查看交易",
    marketplace: "市场",
    viewMarketplace: "查看市场"
  }
};

export const UserOpts = ({ 
  currentLanguage = 'es', 
  claveColab, 
  onListProps,
  onViewMarketplace = () => console.warn('onViewMarketplace not provided') // Valor por defecto
}) => {
  const [activeTab, setActiveTab] = useState('properties');

  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };

  const renderSubmenu = () => {
    switch(activeTab) {
      case 'properties':
        return (
          <button 
            className="submenu-btn"
            onClick={onListProps}
          >
            {translations[currentLanguage].listProperties}
          </button>
        );
      case 'wallet':
        return (
          <>
            <button className="submenu-btn">
              {translations[currentLanguage].listAccounts}
            </button>
            <button className="submenu-btn">
              {translations[currentLanguage].viewTransactions}
            </button>
          </>
        );
      case 'marketplace':
          return (
            <button 
              className="submenu-btn"
              onClick={() => {
                if (typeof onViewMarketplace === 'function') {
                  onViewMarketplace();
                }
              }}
            >
              {translations[currentLanguage].viewMarketplace}
            </button>
          );
      default:
        return null;
    }
  };

  return (
    <div className="user-opts-container">
      <div className="main-tabs">
        <button 
          className={`main-tab ${activeTab === 'properties' ? 'active' : ''}`}
          onClick={() => handleTabClick('properties')}
        >
          {translations[currentLanguage].properties}
        </button>
        <button 
          className={`main-tab ${activeTab === 'wallet' ? 'active' : ''}`}
          onClick={() => handleTabClick('wallet')}
        >
          {translations[currentLanguage].wallet}
        </button>
        <button 
          className={`main-tab ${activeTab === 'marketplace' ? 'active' : ''}`}
          onClick={() => handleTabClick('marketplace')}
        >
          {translations[currentLanguage].marketplace}
        </button>
      </div>

      <div className="submenu-container">
        {renderSubmenu()}
      </div>
    </div>
  );
};