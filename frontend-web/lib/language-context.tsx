'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import idTranslations from './translations/id.json';
import enTranslations from './translations/en.json';

type Language = 'id' | 'en';
type Translations = typeof idTranslations;

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  translations: Translations;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('id');
  const [translations, setTranslations] = useState<Translations>(idTranslations);

  useEffect(() => {
    // Load language from localStorage
    const savedLanguage = localStorage.getItem('language') as Language;
    if (savedLanguage && (savedLanguage === 'id' || savedLanguage === 'en')) {
      setLanguageState(savedLanguage);
      setTranslations(savedLanguage === 'id' ? idTranslations : enTranslations);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    setTranslations(lang === 'id' ? idTranslations : enTranslations);
    localStorage.setItem('language', lang);
  };

  // Helper function to get nested translation
  const getNestedTranslation = (obj: any, path: string): string => {
    const keys = path.split('.');
    let current = obj;
    
    for (const key of keys) {
      if (current && typeof current === 'object' && key in current) {
        current = current[key];
      } else {
        return path; // Return key if not found
      }
    }
    
    return typeof current === 'string' ? current : path;
  };

  const t = (key: string): string => {
    return getNestedTranslation(translations, key);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, translations }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
