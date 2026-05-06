'use client';

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';

type ThemeMode = 'light' | 'dark';
type ThemePreference = ThemeMode | 'system';

interface ThemeContextValue {
  theme: ThemeMode;
  isDarkMode: boolean;
  toggleTheme: () => void;
  setTheme: (theme: ThemeMode) => void;
  applySavedThemePreference: (preference: ThemePreference | null) => void;
  clearThemeOverride: () => void;
  performancePriority: boolean;
  setPerformancePriority: (priority: boolean) => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const THEME_STORAGE_KEY = 'syncmind-theme';
const THEME_OVERRIDE_STORAGE_KEY = 'syncmind-theme-override';
const PERFORMANCE_STORAGE_KEY = 'syncmind-performance';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeMode>('light');
  const [savedThemePreference, setSavedThemePreference] = useState<ThemePreference>('system');
  const [localThemeOverride, setLocalThemeOverride] = useState<ThemeMode | null>(null);
  const [systemTheme, setSystemTheme] = useState<ThemeMode>('light');
  const [performancePriority, setPerformancePriorityState] = useState<boolean>(false);

  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const resolvedSystemTheme: ThemeMode = media.matches ? 'dark' : 'light';
    setSystemTheme(resolvedSystemTheme);

    const storedOverride = localStorage.getItem(THEME_OVERRIDE_STORAGE_KEY);
    const legacyStoredTheme = localStorage.getItem(THEME_STORAGE_KEY);
    const initialOverride = (storedOverride === 'light' || storedOverride === 'dark')
      ? storedOverride
      : (legacyStoredTheme === 'light' || legacyStoredTheme === 'dark' ? legacyStoredTheme : null);

    setLocalThemeOverride(initialOverride);
    setThemeState(initialOverride ?? resolvedSystemTheme);

    const storedPerformance = localStorage.getItem(PERFORMANCE_STORAGE_KEY);
    const initialPerformance = storedPerformance
      ? storedPerformance === 'true'
      : (navigator.hardwareConcurrency !== undefined && navigator.hardwareConcurrency < 4);
    setPerformancePriorityState(initialPerformance);

    const onSystemThemeChange = (event: MediaQueryListEvent) => {
      setSystemTheme(event.matches ? 'dark' : 'light');
    };
    media.addEventListener('change', onSystemThemeChange);

    return () => {
      media.removeEventListener('change', onSystemThemeChange);
    };
  }, []);

  useEffect(() => {
    const resolvedTheme = localThemeOverride ?? (savedThemePreference === 'system' ? systemTheme : savedThemePreference);
    setThemeState((prev) => (prev === resolvedTheme ? prev : resolvedTheme));
  }, [localThemeOverride, savedThemePreference, systemTheme]);

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem(THEME_STORAGE_KEY, theme);
    if (localThemeOverride) {
      localStorage.setItem(THEME_OVERRIDE_STORAGE_KEY, localThemeOverride);
    } else {
      localStorage.removeItem(THEME_OVERRIDE_STORAGE_KEY);
    }
  }, [theme, localThemeOverride]);

  useEffect(() => {
    // Apply performance attribute to document
    const root = window.document.documentElement;
    root.setAttribute('data-performance', performancePriority ? 'low' : 'high');
    localStorage.setItem(PERFORMANCE_STORAGE_KEY, String(performancePriority));
  }, [performancePriority]);

  const toggleTheme = useCallback(() => {
    setLocalThemeOverride((prev) => {
      if (prev) {
        return prev === 'light' ? 'dark' : 'light';
      }
      return theme === 'light' ? 'dark' : 'light';
    });
  }, [theme]);

  const setTheme = useCallback((newTheme: ThemeMode) => {
    setLocalThemeOverride(newTheme);
  }, []);

  const applySavedThemePreference = useCallback((preference: ThemePreference | null) => {
    setSavedThemePreference(preference ?? 'system');
  }, []);

  const clearThemeOverride = useCallback(() => {
    setLocalThemeOverride(null);
  }, []);

  const setPerformancePriority = useCallback((priority: boolean) => {
    setPerformancePriorityState(priority);
  }, []);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        isDarkMode: theme === 'dark',
        toggleTheme,
        setTheme,
        applySavedThemePreference,
        clearThemeOverride,
        performancePriority,
        setPerformancePriority,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
