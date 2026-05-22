import { useEffect, useState, useCallback } from 'react';

const KEY = 'fc-sechura-theme';

const getInitial = () => {
  if (typeof window === 'undefined') return 'light';
  const saved = localStorage.getItem(KEY);
  if (saved === 'light' || saved === 'dark') return saved;
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

const apply = (theme) => {
  document.documentElement.dataset.theme = theme === 'dark' ? 'dark' : '';
};

export const useTheme = () => {
  const [theme, setTheme] = useState(getInitial);

  useEffect(() => { apply(theme); }, [theme]);

  const toggle = useCallback(() => {
    setTheme((t) => {
      const next = t === 'dark' ? 'light' : 'dark';
      localStorage.setItem(KEY, next);
      return next;
    });
  }, []);

  return { theme, toggle };
};

// Apply tema antes de React render para evitar flash
if (typeof window !== 'undefined') {
  apply(getInitial());
}
