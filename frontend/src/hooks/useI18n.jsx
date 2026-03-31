import { createContext, useContext, useState } from 'react';
import { translations } from '../i18n/translations';

const I18nContext = createContext(null);

export function I18nProvider({ children }) {
  const [lang, setLang] = useState(() => {
    try { return localStorage.getItem('casino_lang') || 'es'; } catch { return 'es'; }
  });

  const t = (key) => translations[lang]?.[key] || translations.en?.[key] || key;

  const toggleLang = () => {
    const next = lang === 'en' ? 'es' : 'en';
    setLang(next);
    try { localStorage.setItem('casino_lang', next); } catch {}
  };

  return (
    <I18nContext.Provider value={{ lang, t, toggleLang }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within I18nProvider');
  return ctx;
}
