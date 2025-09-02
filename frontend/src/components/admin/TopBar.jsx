import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Avatar,
  Badge,
  Menu,
  MenuItem,
  Box,
  Tooltip,
  Divider,
  Switch,
  FormControlLabel,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Notifications as NotificationsIcon,
  AccountCircle,
  Settings,
  Logout,
  DarkMode,
  LightMode,
} from '@mui/icons-material';
import { useTheme } from '../../theme/ThemeProvider';

const TopBar = ({ title, onMenuClick, drawerWidth, mobileOpen }) => {
  const { darkMode, toggleTheme } = useTheme();
  const [anchorEl, setAnchorEl] = useState(null);
  const [notificationAnchor, setNotificationAnchor] = useState(null);

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationOpen = (event) => {
    setNotificationAnchor(event.currentTarget);
  };

  const handleNotificationClose = () => {
    setNotificationAnchor(null);
  };

  return (
    <AppBar
      position="fixed"
      sx={{
        width: { sm: `calc(100% - ${mobileOpen ? 0 : drawerWidth}px)` },
        ml: { sm: mobileOpen ? 0 : `${drawerWidth}px` },
        transition: 'width 0.3s ease, margin 0.3s ease',
      }}
    >
      <Toolbar>
        {/* Menu button for mobile */}
        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="start"
          onClick={onMenuClick}
          sx={{ mr: 2, display: { sm: 'none' } }}
        >
          <MenuIcon />
        </IconButton>

        {/* Title */}
        <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
          {title}
        </Typography>

        {/* Right side controls */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {/* Theme toggle */}
          <Tooltip title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}>
            <IconButton color="inherit" onClick={toggleTheme}>
              {darkMode ? <LightMode /> : <DarkMode />}
            </IconButton>
          </Tooltip>

          {/* Notifications */}
          <Tooltip title="Notifications">
            <IconButton color="inherit" onClick={handleNotificationOpen}>
              <Badge badgeContent={3} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>
          </Tooltip>

          {/* Profile Avatar */}
          <Tooltip title="Account">
            <IconButton onClick={handleProfileMenuOpen} sx={{ p: 0 }}>
              <Avatar
                alt="User Avatar"
                src="/static/images/avatar/1.jpg"
                sx={{ width: 32, height: 32 }}
              >
                U
              </Avatar>
            </IconButton>
          </Tooltip>
        </Box>

        {/* Profile Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleProfileMenuClose}
          onClick={handleProfileMenuClose}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
          <MenuItem onClick={handleProfileMenuClose}>
            <AccountCircle sx={{ mr: 2 }} />
            Profile
          </MenuItem>
          <MenuItem onClick={handleProfileMenuClose}>
            <Settings sx={{ mr: 2 }} />
            Settings
          </MenuItem>
          <Divider />
          <MenuItem>
            <FormControlLabel
              control={<Switch checked={darkMode} onChange={toggleTheme} />}
              label={darkMode ? 'Dark Mode' : 'Light Mode'}
              sx={{ m: 0 }}
            />
          </MenuItem>
          <Divider />
          <MenuItem onClick={handleProfileMenuClose}>
            <Logout sx={{ mr: 2 }} />
            Logout
          </MenuItem>
        </Menu>

        {/* Notifications Menu */}
        <Menu
          anchorEl={notificationAnchor}
          open={Boolean(notificationAnchor)}
          onClose={handleNotificationClose}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
          <MenuItem onClick={handleNotificationClose}>
            <Typography variant="body2">New message received</Typography>
          </MenuItem>
          <MenuItem onClick={handleNotificationClose}>
            <Typography variant="body2">System update available</Typography>
          </MenuItem>
          <MenuItem onClick={handleNotificationClose}>
            <Typography variant="body2">Task completed successfully</Typography>
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default TopBar;