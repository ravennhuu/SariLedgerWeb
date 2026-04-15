import { useState, useEffect } from 'react';

export function useTheme() {
  const [theme, setTheme] = useState(() => {
    // Check local storage first
    const saved = localStorage.getItem('theme');
    if (saved) return saved;
    // Fall back to system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Optionally listen to system changes if the user hasn't explicitly set a theme,
  // but for simplicity, we just save their manual toggle choice.

  return { theme, setTheme };
}
