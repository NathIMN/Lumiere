import React from 'react';
import DashboardLayout from './DashboardLayout';
import DashboardContent from './DashboardContent';
import CustomThemeProvider from '../../theme/ThemeProvider';

const Dashboard = ({ title = "Admin Dashboard" }) => {
  return (
    <CustomThemeProvider>
      <DashboardLayout title={title}>
        <DashboardContent />
      </DashboardLayout>
    </CustomThemeProvider>
  );
};

export default Dashboard;