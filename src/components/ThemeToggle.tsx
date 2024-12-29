import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../lib/theme/ThemeContext';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-dark-400 transition-colors"
      aria-label="Toggle theme"
    >
      {theme === 'light' ? (
        <Moon className="w-5 h-5 text-gray-600 dark:text-grey-400" />
      ) : (
        <Sun className="w-5 h-5 text-gray-400 dark:text-dark-600" />
      )}
    </button>
  );
}