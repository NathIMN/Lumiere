import React from 'react';
import {
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  CardHeader,
  Avatar,
  LinearProgress,
  Box,
  Chip,
} from '@mui/material';
import {
  TrendingUp,
  People,
  AttachMoney,
  ShoppingCart,
} from '@mui/icons-material';

const DashboardContent = () => {
  const stats = [
    {
      title: 'Total Revenue',
      value: '$54,239',
      change: '+12.5%',
      icon: <AttachMoney />,
      color: 'primary',
    },
    {
      title: 'Total Users',
      value: '1,429',
      change: '+5.2%',
      icon: <People />,
      color: 'secondary',
    },
    {
      title: 'Orders',
      value: '856',
      change: '+18.1%',
      icon: <ShoppingCart />,
      color: 'info',
    },
    {
      title: 'Growth',
      value: '89.3%',
      change: '+2.1%',
      icon: <TrendingUp />,
      color: 'success',
    },
  ];

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Welcome back!
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Here's what's happening with your business today.
      </Typography>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar
                    sx={{
                      bgcolor: `${stat.color}.main`,
                      mr: 2,
                      width: 48,
                      height: 48,
                    }}
                  >
                    {stat.icon}
                  </Avatar>
                  <Box>
                    <Typography color="text.secondary" gutterBottom>
                      {stat.title}
                    </Typography>
                    <Typography variant="h5">
                      {stat.value}
                    </Typography>
                  </Box>
                </Box>
                <Chip
                  label={stat.change}
                  color="success"
                  size="small"
                  variant="outlined"
                />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Additional Content */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Recent Activity
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Your recent dashboard activity will appear here.
            </Typography>
            <Box sx={{ mt: 2 }}>
              <LinearProgress variant="determinate" value={65} sx={{ mb: 1 }} />
              <Typography variant="body2" color="text.secondary">
                Project Progress: 65%
              </Typography>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Quick Actions
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Common actions and shortcuts will be displayed here.
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardContent;