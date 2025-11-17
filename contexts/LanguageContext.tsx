
import React, { createContext, useState, useContext, ReactNode, useMemo, useEffect } from 'react';
import { ScamPattern } from '../types';

type Translations = { [key: string]: any };
type Language = 'en' | 'es' | 'hi';
type OfflineRule = {
    keywords?: string[];
    regex?: RegExp;
    score: number;
    reason: string;
    scamPattern: ScamPattern;
    matchLogic?: 'AND' | 'OR';
}

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string, options?: { [key: string]: string | number }) => string;
  getOfflineRules: () => OfflineRule[];
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');
  const [translations, setTranslations] = useState<Record<Language, Translations> | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTranslations = async () => {
      try {
        const [enRes, esRes, hiRes] = await Promise.all([
          fetch('./i18n/locales/en.json'),
          fetch('./i18n/locales/es.json'),
          fetch('./i18n/locales/hi.json')
        ]);
        if (!enRes.ok || !esRes.ok || !hiRes.ok) {
            throw new Error(`Failed to fetch translation files: ${enRes.status}, ${esRes.status}, ${hiRes.status}`);
        }
        const enData = await enRes.json();
        const esData = await esRes.json();
        const hiData = await hiRes.json();
        setTranslations({ en: enData, es: esData, hi: hiData });
      } catch (error) {
        console.error("Failed to load translations:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTranslations();
  }, []);

  const t = (key: string, options?: { [key: string]: string | number }): string => {
    if (isLoading || !translations) {
        return key; 
    }

    const keys = key.split('.');
    let result: any = translations[language];
    for (const k of keys) {
      result = result?.[k];
      if (result === undefined) {
        let fallbackResult: any = translations.en;
        for (const fk of keys) {
            fallbackResult = fallbackResult?.[fk];
            if(fallbackResult === undefined) return key;
        }
        result = fallbackResult;
        break;
      }
    }

    if (typeof result === 'string' && options) {
      return result.replace(/\{\{(\w+)\}\}/g, (_, varName) => {
        return options[varName] !== undefined ? String(options[varName]) : `{{${varName}}}`;
      });
    }

    return typeof result === 'string' ? result : key;
  };

  const getOfflineRules = useMemo((): () => OfflineRule[] => () => {
     if (isLoading || !translations) return [];
     const rules: (Omit<OfflineRule, 'reason'> & { reasonKey: string })[] = [
        { keywords: ['police', 'arrest', 'legal', 'warrant', 'cbi', 'cyber crime', 'court', 'fir'], score: 10, reasonKey: "offline.rules.digitalArrest", scamPattern: 'digital_arrest' },
        { regex: /\.apk(\s|$)|\.apk\?/i, score: 10, reasonKey: "offline.rules.apkFile", scamPattern: 'unknown' },
        { keywords: ['urgent', 'immediate', 'final warning', 'action required', 'account suspended', 'account blocked'], score: 5, reasonKey: "offline.rules.urgentLanguage", scamPattern: 'unknown' },
        { keywords: ['easy money', 'transfer funds', 'commission'], score: 5, reasonKey: "offline.rules.moneyMule", scamPattern: 'unknown' },
        { keywords: ['parcel', 'package', 'customs', 'illegal items', 'delivery failed', 'shipment hold'], score: 3, reasonKey: "offline.rules.parcelScam", scamPattern: 'unknown' },
        { keywords: ['job offer', 'guaranteed job', 'registration fee', 'salary advance'], score: 3, reasonKey: "offline.rules.jobOffer", scamPattern: 'unknown' },
        { keywords: ['esim', 'upgrade sim', 'activate esim', 'sim block'], score: 3, reasonKey: "offline.rules.esim", scamPattern: 'unknown' },
        { keywords: ['congratulations', 'you have won', 'lottery', 'prize money', 'claim your prize'], score: 3, reasonKey: "offline.rules.lottery", scamPattern: 'unknown' },
        { keywords: ['otp', 'one time password', 'verification code'], regex: /\b\d{4,8}\b/, score: 3, reasonKey: "offline.rules.otpLike", scamPattern: 'otp', matchLogic: 'AND' },
        { keywords: ['biometric', 'face id', 'fingerprint access', 'verify your identity'], score: 3, reasonKey: "offline.rules.biometric", scamPattern: 'unknown' },
        { keywords: ['mfa', 'multi-factor', '2fa', 'two-factor authentication'], score: 3, reasonKey: "offline.rules.mfa", scamPattern: 'unknown' },
        { keywords: ['hardware key', 'security token', 'yubikey'], score: 3, reasonKey: "offline.rules.hardwareKey", scamPattern: 'unknown' },
        { regex: /https?:\/\/[^\s]+/i, score: 1, reasonKey: "offline.rules.containsLink", scamPattern: 'unknown' },
    ];
    
    return rules.map(({reasonKey, ...rest}) => ({
        ...rest,
        reason: t(reasonKey)
    }));
  }, [language, t, isLoading, translations]);
  
  const value = useMemo(() => ({ language, setLanguage, t, getOfflineRules }), [language, t, getOfflineRules]);

  if (isLoading) {
    return <div className="bg-slate-900 min-h-screen text-slate-100 font-sans p-8 text-center flex items-center justify-center">Loading languages...</div>;
  }

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useTranslation = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
};