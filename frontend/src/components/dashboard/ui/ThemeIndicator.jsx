import React from 'react';
import { useTheme } from '../hooks/useTheme';
import { getThemeClasses } from '../utils/themeUtils';

const ThemeIndicator = () => {
  const { isDark } = useTheme();

  return (
    <div className={`p-4 rounded-lg ${
      getThemeClasses(isDark, 'bg-blue-100 text-blue-800', 'bg-blue-900 text-blue-200')
    }`}>
      <p className="text-sm">
        Current theme: <strong>{isDark ? 'Dark' : 'Light'} Mode</strong>
        {isDark ? ' 🌙' : ' ☀️'}
      </p>
    </div>
  );
};

export default ThemeIndicator;