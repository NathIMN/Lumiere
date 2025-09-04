import React, { createContext, useContext, useState, useMemo } from 'react';
import { createTheme, ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

const CustomThemeProvider = ({ children }) => {
  const [darkMode, setDarkMode] = useState(false);

  const theme = useMemo(() => {
    const customColors = {
      coral: '#ff8372',
      pink: '#e092b5',
      cyan: '#0ac8e8',
    };

    return createTheme({
      palette: {
        mode: darkMode ? 'dark' : 'light',
        primary: {
          main: customColors.coral,
          light: '#ff9b8c',
          dark: '#e5735f',
        },
        secondary: {
          main: customColors.pink,
          light: '#e5a5c2',
          dark: '#c7829f',
        },
        info: {
          main: customColors.cyan,
          light: '#3dd4ed',
          dark: '#09b3d1',
        },
        background: {
          default: darkMode ? '#0a0a0a' : '#fafafa',
          paper: darkMode ? '#1e1e1e' : '#ffffff',
        },
        text: {
          primary: darkMode ? '#ffffff' : '#333333',
          secondary: darkMode ? '#b3b3b3' : '#666666',
        },
      },
      typography: {
        fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
        h4: {
          fontWeight: 600,
        },
        h6: {
          fontWeight: 500,
        },
      },
      components: {
        MuiDrawer: {
          styleOverrides: {
            paper: {
              borderRight: 'none',
              boxShadow: darkMode 
                ? '4px 0 8px rgba(0, 0, 0, 0.3)' 
                : '4px 0 8px rgba(0, 0, 0, 0.1)',
            },
          },
        },
        MuiAppBar: {
          styleOverrides: {
            root: {
              boxShadow: darkMode 
                ? '0 2px 8px rgba(0, 0, 0, 0.3)' 
                : '0 2px 8px rgba(0, 0, 0, 0.1)',
            },
          },
        },
      },
    });
  }, [darkMode]);

  const toggleTheme = () => setDarkMode(!darkMode);

  const value = {
    darkMode,
    toggleTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};

export default CustomThemeProvider;