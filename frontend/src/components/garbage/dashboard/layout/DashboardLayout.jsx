import React from 'react';
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
  activeItem,
  onItemClick
}) => {

  return (
    <ThemeProvider>
      <SidebarProvider>
        <MainLayout>
          <Sidebar
            navigationItems={navigationItems}
            activeItem={activeItem}
            onItemClick={onItemClick}
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
              {children}
            </main>
          </div>
        </MainLayout>
      </SidebarProvider>
    </ThemeProvider>
  );
};

export default DashboardLayout;