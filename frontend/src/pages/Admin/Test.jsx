import React, { useState } from 'react';
import { Sidebar, Menu, MenuItem } from 'react-pro-sidebar';
import { 
  Users, 
  UserPlus, 
  FileText, 
  ClipboardCheck, 
  Plus, 
  FolderOpen, 
  MessageCircle, 
  BarChart3,
  Moon,
  Sun,
  Bell,
  Search,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  Activity,
  MenuIcon
} from 'lucide-react';

const HRDashboard = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const toggleTheme = () => {
    setDarkMode(!darkMode);
  };

  // Mock data
  const stats = {
    totalEmployees: 247,
    newHires: 12,
    pendingClaims: 8,
    activePolicies: 15,
    recentEmployees: [
      { id: 1, name: 'Sarah Johnson', department: 'Marketing', joinDate: '2024-01-15', status: 'active' },
      { id: 2, name: 'Mike Chen', department: 'Engineering', joinDate: '2024-01-10', status: 'active' },
      { id: 3, name: 'Emily Davis', department: 'Finance', joinDate: '2024-01-08', status: 'pending' }
    ],
    recentClaims: [
      { id: 1, employee: 'John Smith', type: 'Medical', amount: '$1,200', status: 'approved', date: '2024-01-20' },
      { id: 2, employee: 'Lisa Brown', type: 'Dental', amount: '$450', status: 'pending', date: '2024-01-19' },
      { id: 3, employee: 'David Wilson', type: 'Vision', amount: '$300', status: 'processing', date: '2024-01-18' }
    ]
  };

  const getStatusColor = (status, isDark) => {
    const colors = {
      active: isDark ? 'text-green-400 bg-green-900/20' : 'text-green-800 bg-green-100',
      pending: isDark ? 'text-yellow-400 bg-yellow-900/20' : 'text-yellow-800 bg-yellow-100',
      approved: isDark ? 'text-green-400 bg-green-900/20' : 'text-green-800 bg-green-100',
      processing: isDark ? 'text-orange-400 bg-orange-900/20' : 'text-orange-800 bg-orange-100'
    };
    return colors[status] || (isDark ? 'text-gray-400 bg-gray-800' : 'text-gray-800 bg-gray-100');
  };

  return (
    <div className={`min-h-screen flex transition-colors duration-300 ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* React Pro Sidebar */}
      <div style={{ display: 'flex', height: '100vh' }}>
        <Sidebar 
          collapsed={collapsed}
          backgroundColor={darkMode ? '#1f2937' : '#ffffff'}
          rootStyles={{
            border: 'none',
            boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
          }}
        >
          {/* Sidebar Header */}
          <div className={`flex items-center justify-between p-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            {!collapsed && (
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-orange-400 to-pink-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">HR</span>
                </div>
                <span className={`font-bold text-lg ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  HR Portal
                </span>
              </div>
            )}
            <button
              onClick={() => setCollapsed(!collapsed)}
              className={`p-1.5 rounded-lg transition-colors ${
                darkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-600'
              }`}
            >
              <MenuIcon className="h-5 w-5" />
            </button>
          </div>

          {/* Pro Sidebar Menu */}
          <Menu
            menuItemStyles={{
              button: ({ active }) => ({
                backgroundColor: active 
                  ? (darkMode ? 'rgba(251, 146, 60, 0.1)' : 'rgba(251, 146, 60, 0.1)')
                  : 'transparent',
                color: active 
                  ? (darkMode ? '#fb923c' : '#ea580c')
                  : (darkMode ? '#d1d5db' : '#374151'),
                borderRadius: '8px',
                margin: '4px 8px',
                padding: '10px 16px',
                '&:hover': {
                  backgroundColor: darkMode ? 'rgba(55, 65, 81, 0.7)' : 'rgba(243, 244, 246, 1)',
                  color: darkMode ? '#ffffff' : '#111827',
                },
              }),
              icon: ({ active }) => ({
                color: active 
                  ? (darkMode ? '#fb923c' : '#ea580c')
                  : (darkMode ? '#9ca3af' : '#6b7280'),
              }),
            }}
          >
            <MenuItem 
              icon={<BarChart3 />} 
              active={true}
            >
              Dashboard
            </MenuItem>
            <MenuItem icon={<UserPlus />}>
              Employee Registration
            </MenuItem>
            <MenuItem icon={<FileText />}>
              User Policies
            </MenuItem>
            <MenuItem icon={<ClipboardCheck />}>
              Review Claims
            </MenuItem>
            <MenuItem icon={<Plus />}>
              Create Claims
            </MenuItem>
            <MenuItem icon={<FolderOpen />}>
              Document Pool
            </MenuItem>
            <MenuItem icon={<MessageCircle />}>
              Messaging
            </MenuItem>
          </Menu>
        </Sidebar>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b px-6 py-4`}>
          <div className="flex items-center justify-between">
            <div>
              <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                HR Dashboard
              </h1>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Welcome back! Here's what's happening today.
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Search */}
              <div className="relative">
                <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                <input
                  type="text"
                  placeholder="Search..."
                  className={`pl-10 pr-4 py-2 rounded-lg border transition-colors ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-orange-500' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-orange-500'
                  } focus:ring-2 focus:ring-orange-500/20`}
                />
              </div>

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className={`p-2 rounded-lg transition-colors ${
                  darkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-600'
                }`}
              >
                {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>

              {/* Notifications */}
              <button className={`p-2 rounded-lg transition-colors relative ${
                darkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-600'
              }`}>
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full"></span>
              </button>

              {/* Profile */}
              <div className="w-8 h-8 bg-gradient-to-r from-orange-400 to-pink-500 rounded-full flex items-center justify-center cursor-pointer">
                <span className="text-white font-semibold text-sm">HR</span>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="flex-1 p-6 space-y-6 overflow-y-auto">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Total Employees */}
            <div className={`rounded-xl p-6 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border shadow-sm`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Total Employees
                  </p>
                  <p className={`text-3xl font-bold mt-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {stats.totalEmployees}
                  </p>
                  <div className="flex items-center mt-2">
                    <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                    <span className="text-sm text-green-500">+5.2%</span>
                  </div>
                </div>
                <div className="bg-gradient-to-r from-orange-400 to-pink-500 p-3 rounded-xl">
                  <Users className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>

            {/* New Hires */}
            <div className={`rounded-xl p-6 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border shadow-sm`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    New Hires (This Month)
                  </p>
                  <p className={`text-3xl font-bold mt-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {stats.newHires}
                  </p>
                  <div className="flex items-center mt-2">
                    <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                    <span className="text-sm text-green-500">+12.1%</span>
                  </div>
                </div>
                <div className="bg-gradient-to-r from-green-500 to-green-600 p-3 rounded-xl">
                  <UserPlus className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>

            {/* Pending Claims */}
            <div className={`rounded-xl p-6 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border shadow-sm`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Pending Claims
                  </p>
                  <p className={`text-3xl font-bold mt-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {stats.pendingClaims}
                  </p>
                  <div className="flex items-center mt-2">
                    <Clock className="h-4 w-4 text-yellow-500 mr-1" />
                    <span className="text-sm text-yellow-500">Requires attention</span>
                  </div>
                </div>
                <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 p-3 rounded-xl">
                  <ClipboardCheck className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>

            {/* Active Policies */}
            <div className={`rounded-xl p-6 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border shadow-sm`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Active Policies
                  </p>
                  <p className={`text-3xl font-bold mt-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {stats.activePolicies}
                  </p>
                  <div className="flex items-center mt-2">
                    <Activity className="h-4 w-4 text-orange-500 mr-1" />
                    <span className="text-sm text-orange-500">All active</span>
                  </div>
                </div>
                <div className="bg-gradient-to-r from-orange-400 to-pink-500 p-3 rounded-xl">
                  <FileText className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Employees */}
            <div className={`rounded-xl ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border shadow-sm`}>
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Recent Employees
                </h3>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Latest employee registrations
                </p>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {stats.recentEmployees.map((employee) => (
                    <div key={employee.id} className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-gradient-to-r from-orange-400 to-pink-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold text-sm">
                          {employee.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div className="flex-1">
                        <h4 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {employee.name}
                        </h4>
                        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          {employee.department} • {employee.joinDate}
                        </p>
                      </div>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(employee.status, darkMode)}`}>
                        {employee.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Recent Claims */}
            <div className={`rounded-xl ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border shadow-sm`}>
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Recent Claims
                </h3>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Latest claim submissions
                </p>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {stats.recentClaims.map((claim) => (
                    <div key={claim.id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${
                          claim.status === 'approved' 
                            ? 'bg-green-100 dark:bg-green-900/20' 
                            : claim.status === 'pending'
                            ? 'bg-yellow-100 dark:bg-yellow-900/20'
                            : 'bg-orange-100 dark:bg-orange-900/20'
                        }`}>
                          {claim.status === 'approved' ? (
                            <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                          ) : claim.status === 'pending' ? (
                            <Clock className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                          ) : (
                            <AlertCircle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                          )}
                        </div>
                        <div>
                          <h4 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            {claim.employee}
                          </h4>
                          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {claim.type} • {claim.date}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {claim.amount}
                        </p>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(claim.status, darkMode)}`}>
                          {claim.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className={`rounded-xl ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border shadow-sm p-6`}>
            <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Quick Actions
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {[
                { label: 'Add Employee', icon: UserPlus, color: 'from-green-500 to-green-600' },
                { label: 'Review Claims', icon: ClipboardCheck, color: 'from-orange-400 to-pink-500' },
                { label: 'Create Policy', icon: FileText, color: 'from-orange-400 to-pink-500' },
                { label: 'Send Message', icon: MessageCircle, color: 'from-pink-500 to-pink-600' },
                { label: 'View Documents', icon: FolderOpen, color: 'from-orange-500 to-orange-600' },
                { label: 'Generate Report', icon: BarChart3, color: 'from-orange-400 to-pink-500' }
              ].map((action, index) => (
                <button
                  key={index}
                  className={`p-4 rounded-lg border transition-all hover:scale-105 ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 hover:bg-gray-600' 
                      : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  <div className={`bg-gradient-to-r ${action.color} p-3 rounded-lg mx-auto mb-3 w-fit`}>
                    <action.icon className="h-6 w-6 text-white" />
                  </div>
                  <p className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {action.label}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default HRDashboard;