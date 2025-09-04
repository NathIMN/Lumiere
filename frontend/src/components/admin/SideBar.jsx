import React from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Box,
  Typography,
  Avatar,
  Chip,
  Divider,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Dashboard,
  People,
  Assessment,
  Settings,
  Help,
  ChevronLeft,
  ChevronRight,
} from '@mui/icons-material';

const drawerWidth = 280;

const SideBar = ({ mobileOpen, onDrawerToggle, onDrawerClose, collapsed, onToggleCollapse }) => {
  const menuItems = [
    { text: 'Dashboard', icon: <Dashboard />, path: '/dashboard' },
    { text: 'Users', icon: <People />, path: '/users' },
    { text: 'Analytics', icon: <Assessment />, path: '/analytics' },
    { text: 'Settings', icon: <Settings />, path: '/settings' },
    { text: 'Help', icon: <Help />, path: '/help' },
  ];

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Toolbar sx={{ px: 2, justifyContent: 'space-between' }}>
        {!collapsed && (
          <Typography variant="h6" noWrap component="div" color="primary">
            Dashboard
          </Typography>
        )}
        <Tooltip title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}>
          <IconButton onClick={onToggleCollapse} size="small">
            {collapsed ? <ChevronRight /> : <ChevronLeft />}
          </IconButton>
        </Tooltip>
      </Toolbar>

      <Divider />

      {/* Navigation Menu */}
      <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
        <List>
          {menuItems.map((item) => (
            <ListItem key={item.text} disablePadding>
              <ListItemButton
                sx={{
                  minHeight: 48,
                  justifyContent: collapsed ? 'center' : 'initial',
                  px: 2.5,
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    mr: collapsed ? 'auto' : 3,
                    justifyContent: 'center',
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                {!collapsed && (
                  <ListItemText primary={item.text} />
                )}
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>

      {/* Bottom Section */}
      <Box sx={{ p: 2, mt: 'auto' }}>
        <Divider sx={{ mb: 2 }} />
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            flexDirection: collapsed ? 'column' : 'row',
            gap: 1,
          }}
        >
          <Avatar
            sx={{
              width: collapsed ? 32 : 40,
              height: collapsed ? 32 : 40,
              bgcolor: 'primary.main',
            }}
          >
            JD
          </Avatar>
          {!collapsed && (
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="subtitle2" noWrap>
                John Doe
              </Typography>
              <Chip
                label="Admin"
                size="small"
                color="primary"
                variant="outlined"
                sx={{ fontSize: '0.75rem', height: 20 }}
              />
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );

  return (
    <Box
      component="nav"
      sx={{ width: { sm: collapsed ? 64 : drawerWidth }, flexShrink: { sm: 0 } }}
    >
      {/* Mobile drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better mobile performance
        }}
        sx={{
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: drawerWidth,
          },
        }}
      >
        {drawer}
      </Drawer>

      {/* Desktop drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', sm: 'block' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: collapsed ? 64 : drawerWidth,
            transition: 'width 0.3s ease',
          },
        }}
        open
      >
        {drawer}
      </Drawer>
    </Box>
  );
};

export default SideBar;