'use client';

import { createContext, useEffect, useState, useContext, type Dispatch, type SetStateAction, type ReactNode } from 'react';

export interface SettingsContextValue {
  soundEnabled: boolean | undefined;
  darkMode: boolean | undefined;
  bioLength: string | undefined;
  setDarkMode: Dispatch<SetStateAction<boolean | undefined>>;
  setSoundEnabled: Dispatch<SetStateAction<boolean | undefined>>;
  setBioLength: Dispatch<SetStateAction<string | undefined>>;
}

const SettingsContext = createContext<SettingsContextValue>({
  soundEnabled: undefined,
  darkMode: undefined,
  bioLength: undefined,
  setDarkMode: () => undefined,
  setSoundEnabled: () => undefined,
  setBioLength: () => undefined,
});

interface InitializeSettingParams<T> {
  localStorageKey: string;
  setValue: Dispatch<SetStateAction<T | undefined>>;
  value: T | undefined;
  fallbackValue: T;
}

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const [darkMode, setDarkMode] = useState<boolean | undefined>(undefined);
  const [soundEnabled, setSoundEnabled] = useState<boolean | undefined>(undefined);
  const [bioLength, setBioLength] = useState<string | undefined>(undefined);

  const initializeSetting = <T,>({
    localStorageKey,
    setValue,
    value,
    fallbackValue,
  }: InitializeSettingParams<T>) => {
    if (typeof value !== 'undefined') return;

    const userValue = localStorage.getItem(localStorageKey);
    if (userValue !== null) {
      /*
       * For boolean values, we need to run JSON.parse() or else they'll be
       * treated like strings. However, if we try to JSON.parse() a plain ol'
       * string, it borks. So this tries to parse first, then falls back to
       * using the string value if that doesn't work.
       */
      let newValue: T;
      try {
        newValue = JSON.parse(userValue) as T;
      } catch (_) {
        newValue = userValue as unknown as T;
      }

      setValue(newValue);
    } else {
      setValue(fallbackValue);
    }
  };

  useEffect(() => {
    initializeSetting({
      localStorageKey: 'khriztianmoreno.com:sound-enabled',
      setValue: setSoundEnabled,
      value: soundEnabled,
      fallbackValue: true,
    });

    initializeSetting({
      localStorageKey: 'khriztianmoreno.com:dark-mode',
      setValue: setDarkMode,
      value: darkMode,
      fallbackValue: window.matchMedia('(prefers-color-scheme: dark)').matches,
    });

    initializeSetting({
      localStorageKey: 'khriztianmoreno.com:bio-length',
      setValue: setBioLength,
      value: bioLength,
      fallbackValue: 'short',
    });
  }, [
    darkMode,
    setDarkMode,
    soundEnabled,
    setSoundEnabled,
    bioLength,
    setBioLength,
  ]);

  return (
    <SettingsContext.Provider
      value={{
        soundEnabled,
        darkMode,
        setDarkMode,
        setSoundEnabled,
        bioLength,
        setBioLength,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export type BioLength = 'shortest' | 'shorter' | 'short' | 'long' | 'longer' | 'longest';

export interface UseSettingsReturn {
  darkMode: boolean | undefined;
  toggleDarkMode: () => void;
  soundEnabled: boolean | undefined;
  toggleSound: () => void;
  bioLength: string | undefined;
  updateBioLength: (length: string) => void;
}

export const useSettings = (): UseSettingsReturn => {
  const {
    darkMode,
    setDarkMode,
    soundEnabled,
    setSoundEnabled,
    bioLength,
    setBioLength,
  } = useContext(SettingsContext);

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    localStorage.setItem('khriztianmoreno.com:dark-mode', String(newMode));
    setDarkMode(newMode);
  };

  const toggleSound = () => {
    const newSetting = !soundEnabled;
    localStorage.setItem('khriztianmoreno.com:sound-enabled', String(newSetting));
    setSoundEnabled(newSetting);
  };

  const updateBioLength = (length: string) => {
    const allowedLengths: BioLength[] = [
      'shortest',
      'shorter',
      'short',
      'long',
      'longer',
      'longest',
    ];

    if (allowedLengths.includes(length as BioLength)) {
      localStorage.setItem('khriztianmoreno.com:bio-length', length);
      setBioLength(length);
    }
  };

  return {
    darkMode,
    toggleDarkMode,
    soundEnabled,
    toggleSound,
    bioLength,
    updateBioLength,
  };
};
