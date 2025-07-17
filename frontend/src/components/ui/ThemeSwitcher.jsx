import React from 'react';
import { useTheme } from '../ThemeProvider';
import Icon from '../AppIcon';

/**
 * ThemeSwitcher - Toggle between light and dark mode
 */
const ThemeSwitcher = () => {
  const { theme, toggleTheme } = useTheme();
  const isDarkMode = theme === 'dark';

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none"
      title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDarkMode ? (
        <Icon name="Sun" size={20} className="text-yellow-500" />
      ) : (
        <Icon name="Moon" size={20} className="text-gray-600" />
      )}
      <span className="sr-only">
        {isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
      </span>
    </button>
  );
};

export default ThemeSwitcher;
