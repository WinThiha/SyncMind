'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

interface ThemeContextValue {
  theme: 'light' | 'dark';
  isDarkMode: boolean;
  toggleTheme: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
  performancePriority: boolean;
  setPerformancePriority: (priority: boolean) => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const THEME_STORAGE_KEY = 'syncmind-theme';
const PERFORMANCE_STORAGE_KEY = 'syncmind-performance';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<'light' | 'dark'>('light');
  const [performancePriority, setPerformancePriorityState] = useState<boolean>(false);

  useEffect(() => {
    // Initial sync from localStorage and system preference
    const storedTheme = localStorage.getItem(THEME_STORAGE_KEY) as 'light' | 'dark' | null;
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    const initialTheme = storedTheme || (systemPrefersDark ? 'dark' : 'light');
    setThemeState(initialTheme);

    const storedPerformance = localStorage.getItem(PERFORMANCE_STORAGE_KEY);
    // Auto-detect performance if not stored (e.g., low hardware concurrency)
    const initialPerformance = storedPerformance 
      ? storedPerformance === 'true' 
      : (navigator.hardwareConcurrency !== undefined && navigator.hardwareConcurrency < 4);
    
    setPerformancePriorityState(initialPerformance);
  }, []);

  useEffect(() => {
    // Apply theme to document
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  useEffect(() => {
    // Apply performance attribute to document
    const root = window.document.documentElement;
    root.setAttribute('data-performance', performancePriority ? 'low' : 'high');
    localStorage.setItem(PERFORMANCE_STORAGE_KEY, String(performancePriority));
  }, [performancePriority]);

  const toggleTheme = () => {
    setThemeState((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const setTheme = (newTheme: 'light' | 'dark') => {
    setThemeState(newTheme);
  };

  const setPerformancePriority = (priority: boolean) => {
    setPerformancePriorityState(priority);
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        isDarkMode: theme === 'dark',
        toggleTheme,
        setTheme,
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
