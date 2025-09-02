import React, { useState } from 'react';
import { Box, Toolbar } from '@mui/material';
import TopBar from './TopBar';
import SideBar from './SideBar';

const DashboardLayout = ({ title = "Dashboard", children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const drawerWidth = collapsed ? 64 : 280;

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleDrawerClose = () => {
    setMobileOpen(false);
  };

  const handleToggleCollapse = () => {
    setCollapsed(!collapsed);
  };

  return (
    <Box sx={{ display: 'flex' }}>
      {/* Top Navigation Bar */}
      <TopBar
        title={title}
        onMenuClick={handleDrawerToggle}
        drawerWidth={drawerWidth}
        mobileOpen={mobileOpen}
      />

      {/* Sidebar */}
      <SideBar
        mobileOpen={mobileOpen}
        onDrawerToggle={handleDrawerToggle}
        onDrawerClose={handleDrawerClose}
        collapsed={collapsed}
        onToggleCollapse={handleToggleCollapse}
      />

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          transition: 'width 0.3s ease',
          minHeight: '100vh',
          bgcolor: 'background.default',
        }}
      >
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
};

export default DashboardLayout;