import React from 'react';
import { useTheme } from '../hooks/useTheme';
import { getThemeClasses } from '../utils/themeUtils';

const MainLayout = ({ children }) => {
  const { isDark } = useTheme();
  
  return (
    <div className={`h-screen flex ${
      getThemeClasses(isDark, 'bg-gray-50', 'bg-gray-900')
    }`}>
      {children}
    </div>
  );
};

export default MainLayout;