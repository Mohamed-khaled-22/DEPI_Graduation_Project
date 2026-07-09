import React, { createContext, useState, useContext, useEffect } from 'react';
import { translations } from '../translations';

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [locale, setLocale] = useState(() => {
    return localStorage.getItem('locale') || 'ar';
  });

  useEffect(() => {
    localStorage.setItem('locale', locale);
    // Update document language and direction
    document.documentElement.lang = locale;
    document.documentElement.dir = locale === 'ar' ? 'rtl' : 'ltr';
  }, [locale]);

  const toggleLanguage = () => {
    setLocale((prev) => (prev === 'ar' ? 'en' : 'ar'));
  };

  const t = (path) => {
    const keys = path.split('.');
    let current = translations[locale];
    for (const key of keys) {
      if (current[key] === undefined) {
        return path; // Fallback to path if not found
      }
      current = current[key];
    }
    return current;
  };

  return (
    <LanguageContext.Provider value={{ locale, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
