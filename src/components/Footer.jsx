import React from 'react';
import '../styles/Footer.css';

const translations = {
  en: {
    message: "This site is under construction. We are working to provide you with the best experience. Come back soon!",
  },
  es: {
    message: "Este sitio se encuentra en construcción. Estamos trabajando para brindarte la mejor experiencia. ¡Vuelve pronto!",
  },
  fr: {
    message: "Ce site est en construction. Nous travaillons pour vous offrir la meilleure expérience. Revenez bientôt!",
  },
  zh: {
    message: "本网站正在建设中。我们正在努力为您提供最佳体验。稍后再回来！",
  },
};

export const Footer = ({ currentLanguage }) => {
  return (
    <footer className="app-footer">
      <p>{translations[currentLanguage].message}</p>
    </footer>
  );
};