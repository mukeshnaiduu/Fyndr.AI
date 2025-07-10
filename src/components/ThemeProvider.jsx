import React, { createContext, useState, useContext, useEffect } from 'react';

// Create context for theme
const ThemeContext = createContext();

// Theme options
const themes = {
  light: 'light',
  dark: 'dark'
};

export const ThemeProvider = ({ children }) => {
  // Check for user's preferred theme or saved preference
  const getInitialTheme = () => {
    // Check if we're in the browser
    if (typeof window !== 'undefined' && window.localStorage) {
      const storedTheme = window.localStorage.getItem('hirehub-theme');
      if (storedTheme) {
        return storedTheme;
      }

      // Check system preference
      const userMedia = window.matchMedia('(prefers-color-scheme: dark)');
      if (userMedia.matches) {
        return themes.dark;
      }
    }

    // Default to light theme
    return themes.light;
  };

  const [theme, setTheme] = useState(getInitialTheme);

  // Toggle between light and dark mode
  const toggleTheme = () => {
    setTheme(theme === themes.light ? themes.dark : themes.light);
  };

  // Update document with theme class and save to localStorage
  useEffect(() => {
    const root = window.document.documentElement;
    
    // Remove old theme class and add new one
    root.classList.remove(themes.light, themes.dark);
    root.classList.add(theme);
    
    // Save to localStorage
    localStorage.setItem('hirehub-theme', theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook for using theme
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
