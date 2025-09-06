import React from 'react';
import { useTheme } from '../hooks/useTheme';
import { themeClasses } from '../utils/themeUtils';

const ContentCard = ({ title, children, className = '' }) => {
  const { isDark } = useTheme();

  return (
    <div className={`p-6 rounded-lg shadow-sm border ${themeClasses.background.card(isDark)} ${className}`}>
      {title && (
        <h2 className={`text-xl font-semibold mb-4 ${themeClasses.text.primary(isDark)}`}>
          {title}
        </h2>
      )}
      {children}
    </div>
  );
};

export default ContentCard;