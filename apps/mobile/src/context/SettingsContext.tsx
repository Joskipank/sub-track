import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { settingsStorage } from "../storage/settingsStorage";
import type { AppLanguage } from "../types/settings";
import { t, type TranslationKey } from "../i18n/translations";

type SettingsContextValue = {
  language: AppLanguage;
  setLanguage: (language: AppLanguage) => Promise<void>;
  tr: (key: TranslationKey) => string;
};

const SettingsContext = createContext<SettingsContextValue | undefined>(undefined);

export const SettingsProvider = ({ children }: { children: React.ReactNode }) => {
  const [language, setLanguageState] = useState<AppLanguage>("en");

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      const settings = await settingsStorage.getSettings();
      if (isMounted) {
        setLanguageState(settings.language);
      }
    };
    void load();
    return () => {
      isMounted = false;
    };
  }, []);

  const setLanguage = async (nextLanguage: AppLanguage) => {
    await settingsStorage.setLanguage(nextLanguage);
    setLanguageState(nextLanguage);
  };

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      tr: (key: TranslationKey) => t(language, key)
    }),
    [language]
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
};

export const useI18n = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error("useI18n must be used within SettingsProvider");
  }
  return context;
};
