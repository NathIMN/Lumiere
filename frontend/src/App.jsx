import { useState, useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import { AllRoutes } from './routes/AllRoutes';

function App() {
  const [isDark, setIsDark] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleTheme = () => setIsDark(!isDark);
  const toggleSidebar = () => setIsCollapsed(!isCollapsed);

  return (
    <AuthProvider>
      <div className={isDark ? 'dark' : ''}>
        <AllRoutes 
          isDark={isDark}
          isCollapsed={isCollapsed}
          scrolled={scrolled}
          onToggleTheme={toggleTheme}
          onToggleSidebar={toggleSidebar}
        />
      </div>
    </AuthProvider>
  );
}

export default App;
