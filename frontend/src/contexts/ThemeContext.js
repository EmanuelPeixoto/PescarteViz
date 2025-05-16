import React, { createContext } from 'react';

export const ThemeContext = createContext({
  darkMode: false,
  toggleDarkMode: () => {},
});

export const ThemeProvider = ({ children }) => {
  // Always use light theme
  const darkMode = false;
  const toggleDarkMode = () => {
    // Function does nothing now
    console.log('Theme switching is disabled. Using light theme only.');
  };

  // Set document theme to light
  document.documentElement.setAttribute('data-theme', 'light');

  return (
    <ThemeContext.Provider value={{ darkMode, toggleDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
};