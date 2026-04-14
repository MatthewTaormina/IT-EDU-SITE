'use client';

import { createContext, useContext, useEffect, useState } from 'react';

export type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextValue {
  mode: ThemeMode;
  setMode: (m: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  mode: 'system',
  setMode: () => {},
});

export function useTheme() {
  return useContext(ThemeContext);
}

function applyTheme(mode: ThemeMode) {
  const html = document.documentElement;
  if (mode === 'dark') {
    html.dataset.theme = 'dark';
  } else if (mode === 'light') {
    html.dataset.theme = 'light';
  } else {
    html.dataset.theme = window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  }
}

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>('system');

  // Hydrate from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('theme') as ThemeMode | null;
    if (saved === 'light' || saved === 'dark' || saved === 'system') {
      setModeState(saved);
    }
  }, []);

  // Apply theme and persist whenever mode changes
  useEffect(() => {
    applyTheme(mode);

    if (mode === 'system') {
      localStorage.removeItem('theme');
    } else {
      localStorage.setItem('theme', mode);
    }

    // Listen for system preference changes when in system mode
    if (mode !== 'system') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => {
      document.documentElement.dataset.theme = e.matches ? 'dark' : 'light';
    };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [mode]);

  function setMode(m: ThemeMode) {
    setModeState(m);
  }

  return (
    <ThemeContext.Provider value={{ mode, setMode }}>
      {children}
    </ThemeContext.Provider>
  );
}
