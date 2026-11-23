import { createContext, useContext, useState, type ReactNode } from 'react';
import { en } from './en';
import { ru } from './ru';

const dictionaries: Record<Lang, Record<string, string>> = { ru, en };

export type Lang = 'ru' | 'en';
export type Translate = (key: string) => string;

interface I18nContextValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: Translate;
}

const I18nContext = createContext<I18nContextValue | null>(null);

const LANG_KEY = 'jfb:lang';

const loadInitialLang = (): Lang => {
  const stored = localStorage.getItem(LANG_KEY);
  return stored === 'en' || stored === 'ru' ? stored : 'ru';
};

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(loadInitialLang);
  const setLang = (next: Lang) => {
    localStorage.setItem(LANG_KEY, next);
    setLangState(next);
  };
  const t: Translate = (key) => dictionaries[lang][key] ?? key;
  return (
    <I18nContext.Provider value={{ lang, setLang, t }}>{children}</I18nContext.Provider>
  );
}

export function useT(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useT must be used within I18nProvider');
  return ctx;
}
