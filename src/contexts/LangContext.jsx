import { createContext, useContext, useState } from 'react';
import { translations } from '../i18n/translations';

const LangContext = createContext(null);

export const LangProvider = ({ children }) => {
  const [lang, setLang] = useState(localStorage.getItem('admin_lang') || 'en');

  const toggle = () => {
    const next = lang === 'en' ? 'ar' : 'en';
    setLang(next);
    localStorage.setItem('admin_lang', next);
    document.documentElement.dir = next === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = next;
  };

  const t = (key) => translations[lang][key] || translations['en'][key] || key;
  const isRtl = lang === 'ar';

  return (
    <LangContext.Provider value={{ lang, toggle, t, isRtl }}>
      {children}
    </LangContext.Provider>
  );
};

export const useLang = () => useContext(LangContext);
