import React, { useState } from 'react';
import { ThemeProvider } from '../context/ThemeContext';
import { SidebarProvider } from '../context/SidebarContext';
import MainLayout from './MainLayout';
import TopBar from './TopBar';
import Sidebar from './Sidebar';

const DashboardLayout = ({ 
  children, 
  navigationItems = [],
  bottomContent,
  title = 'Dashboard',
  user = { name: 'User' },
  notifications = 0,
  onNotificationClick,
  logo,
  defaultActiveItem
}) => {
  const [activeItem, setActiveItem] = useState(defaultActiveItem || navigationItems[0]?.id);

  const handleItemClick = (itemId) => {
    setActiveItem(itemId);
  };

  return (
    <ThemeProvider>
      <SidebarProvider>
        <MainLayout>
          <Sidebar
            navigationItems={navigationItems}
            activeItem={activeItem}
            onItemClick={handleItemClick}
            bottomContent={bottomContent}
            logo={logo}
            title={title}
          />
          
          <div className="flex-1 flex flex-col overflow-hidden">
            <TopBar 
              title={title} 
              user={user}
              notifications={notifications}
              onNotificationClick={onNotificationClick}
            />
            
            <main className="flex-1 overflow-auto p-6">
              {typeof children === 'function' ? children({ activeItem, navigationItems }) : children}
            </main>
          </div>
        </MainLayout>
      </SidebarProvider>
    </ThemeProvider>
  );
};

export default DashboardLayout;