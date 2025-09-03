// Theme-aware styling helper
export const getThemeClasses = (isDark, lightClasses, darkClasses) => {
  return isDark ? darkClasses : lightClasses;
};

// Common theme class combinations
export const themeClasses = {
  background: {
    primary: (isDark) => getThemeClasses(isDark, 'bg-white', 'bg-gray-800'),
    secondary: (isDark) => getThemeClasses(isDark, 'bg-gray-50', 'bg-gray-900'),
    card: (isDark) => getThemeClasses(isDark, 'bg-white border-gray-200', 'bg-gray-800 border-gray-700'),
  },
  text: {
    primary: (isDark) => getThemeClasses(isDark, 'text-gray-900', 'text-white'),
    secondary: (isDark) => getThemeClasses(isDark, 'text-gray-600', 'text-gray-400'),
    muted: (isDark) => getThemeClasses(isDark, 'text-gray-500', 'text-gray-400'),
  },
  border: {
    primary: (isDark) => getThemeClasses(isDark, 'border-gray-200', 'border-gray-700'),
  },
  hover: {
    background: (isDark) => getThemeClasses(isDark, 'hover:bg-gray-100', 'hover:bg-gray-700'),
  }
};