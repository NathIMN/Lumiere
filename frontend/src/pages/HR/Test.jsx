import React, { useState } from 'react';
import {
  Shield,
  Plus,
  Folder,
  MessageCircle,
  Bell,
  User,
  Sun,
  Moon,
  TrendingUp,
  TrendingDown,
  Users,
  FileText,
  Clock,
  MoreVertical,
  ChevronDown
} from 'lucide-react';

const drawerWidth = '280px';

const menuItems = [
  { text: 'Dashboard', icon: Shield, active: true },
  { text: 'Employee Registration', icon: Shield },
  { text: 'User Policies', icon: Shield },
  { text: 'Review Claims', icon: Shield },
  { text: 'Create Claims', icon: Plus },
  { text: 'Document Pool', icon: Folder },
  { text: 'Messaging', icon: MessageCircle },
];

const stats = [
  { title: 'Total Employees', value: '1,247', change: '+12%', trend: 'up', color: '#4f46e5' },
  { title: 'Pending Claims', value: '32', change: '-8%', trend: 'down', color: '#f59e0b' },
  { title: 'Active Policies', value: '89', change: '+5%', trend: 'up', color: '#10b981' },
  { title: 'This Month Reviews', value: '156', change: '+23%', trend: 'up', color: '#8b5cf6' },
];

const recentActivities = [
  { type: 'Employee Registration', name: 'John Smith', time: '2 hours ago', status: 'pending' },
  { type: 'Claim Review', name: 'Medical Claim #MC-001', time: '3 hours ago', status: 'approved' },
  { type: 'Policy Update', name: 'Health Insurance Policy', time: '5 hours ago', status: 'completed' },
  { type: 'Document Upload', name: 'Q3 Performance Reports', time: '1 day ago', status: 'completed' },
  { type: 'Claim Review', name: 'Travel Claim #TC-045', time: '2 days ago', status: 'rejected' },
];

const upcomingTasks = [
  { task: 'Review quarterly performance reports', deadline: 'Today, 5:00 PM', priority: 'high' },
  { task: 'Employee onboarding session', deadline: 'Tomorrow, 10:00 AM', priority: 'medium' },
  { task: 'Policy renewal notifications', deadline: 'Dec 15, 2024', priority: 'low' },
  { task: 'Compliance audit preparation', deadline: 'Dec 20, 2024', priority: 'high' },
];

export default function HRDashboard() {
  const [darkMode, setDarkMode] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleThemeToggle = () => {
    setDarkMode(!darkMode);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
      case 'completed':
        return '#10b981';
      case 'pending':
        return '#f59e0b';
      case 'rejected':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return '#ef4444';
      case 'medium':
        return '#f59e0b';
      case 'low':
        return '#3b82f6';
      default:
        return '#6b7280';
    }
  };

  const themeClasses = darkMode ? 'dark' : '';

  return (
    <div className={`${themeClasses} min-h-screen bg-gray-50 dark:bg-slate-900 flex`}>
      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-full w-70 bg-white dark:bg-slate-800 border-r border-gray-200 dark:border-slate-700 z-10">
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-gray-200 dark:border-slate-700">
          <h1 className="text-xl font-bold text-indigo-600 dark:text-indigo-400">Lumiere HR</h1>
        </div>

        {/* Navigation */}
        <nav className="p-4">
          <ul className="space-y-2">
            {menuItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <li key={index}>
                  <button
                    className={`w-full flex items-center px-4 py-3 text-left rounded-xl transition-all duration-200 ${
                      item.active
                        ? 'bg-indigo-600 text-white shadow-lg'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700'
                    }`}
                  >
                    <Icon className="w-5 h-5 mr-3" />
                    <span className="font-medium text-sm">{item.text}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 ml-70">
        {/* Top Bar */}
        <header className="h-16 bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 px-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">HR Dashboard</h2>
          
          <div className="flex items-center space-x-4">
            {/* Theme Toggle */}
            <button
              onClick={handleThemeToggle}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
            >
              {darkMode ? (
                <Sun className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              ) : (
                <Moon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              )}
            </button>

            {/* Notifications */}
            <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors relative">
              <Bell className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full text-xs flex items-center justify-center">
                <span className="w-2 h-2 bg-red-500 rounded-full"></span>
              </span>
            </button>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center space-x-2 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
              >
                <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">HR</span>
                </div>
                <ChevronDown className="w-4 h-4 text-gray-600 dark:text-gray-300" />
              </button>
              
              {userMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 py-2 z-20">
                  <button className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-slate-700 text-sm text-gray-700 dark:text-gray-300">
                    Profile
                  </button>
                  <button className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-slate-700 text-sm text-gray-700 dark:text-gray-300">
                    Settings
                  </button>
                  <button className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-slate-700 text-sm text-gray-700 dark:text-gray-300">
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="p-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => (
              <div key={index} className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-1">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-gray-600 dark:text-gray-400 font-medium text-sm">{stat.title}</p>
                  {stat.trend === 'up' ? (
                    <TrendingUp className="w-5 h-5 text-green-500" />
                  ) : (
                    <TrendingDown className="w-5 h-5 text-red-500" />
                  )}
                </div>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{stat.value}</p>
                <p className={`text-sm font-semibold ${stat.trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                  {stat.change} from last month
                </p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Activities */}
            <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Recent Activities</h3>
                <button className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg">
                  <MoreVertical className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              
              <div className="space-y-4">
                {recentActivities.map((activity, index) => (
                  <div key={index} className="flex items-center space-x-4 p-3 hover:bg-gray-50 dark:hover:bg-slate-700 rounded-xl transition-colors">
                    <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-medium">{activity.type.charAt(0)}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <p className="font-medium text-gray-900 dark:text-white text-sm">{activity.name}</p>
                        <span
                          className="px-2 py-1 rounded-full text-xs font-medium text-white"
                          style={{ backgroundColor: getStatusColor(activity.status) }}
                        >
                          {activity.status}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{activity.type} • {activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Upcoming Tasks */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Upcoming Tasks</h3>
              
              <div className="space-y-4">
                {upcomingTasks.map((task, index) => (
                  <div key={index} className="p-4 border border-gray-200 dark:border-slate-700 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium text-gray-900 dark:text-white text-sm">{task.task}</p>
                      <span
                        className="px-2 py-1 rounded-full text-xs font-medium text-white"
                        style={{ backgroundColor: getPriorityColor(task.priority) }}
                      >
                        {task.priority}
                      </span>
                    </div>
                    <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                      <Clock className="w-3 h-3 mr-1" />
                      {task.deadline}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Performance Overview */}
          <div className="mt-8 bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Department Performance Overview</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { dept: 'Engineering', progress: 85, employees: 45, color: '#4f46e5' },
                { dept: 'Marketing', progress: 72, employees: 23, color: '#f59e0b' },
                { dept: 'Sales', progress: 93, employees: 31, color: '#10b981' },
                { dept: 'Support', progress: 67, employees: 18, color: '#8b5cf6' },
              ].map((dept, index) => (
                <div key={index} className="text-center p-4">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">{dept.dept}</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{dept.employees} employees</p>
                  
                  {/* Circular Progress */}
                  <div className="relative inline-flex items-center justify-center mb-4">
                    <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 64 64">
                      <circle
                        cx="32"
                        cy="32"
                        r="28"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                        className="text-gray-200 dark:text-slate-700"
                      />
                      <circle
                        cx="32"
                        cy="32"
                        r="28"
                        stroke={dept.color}
                        strokeWidth="4"
                        fill="none"
                        strokeLinecap="round"
                        strokeDasharray={`${dept.progress * 1.759} 175.9`}
                        className="transition-all duration-300"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">{dept.progress}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Additional Dashboard Widgets */}
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Quick Actions */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-4">
                <button className="p-4 border-2 border-dashed border-gray-300 dark:border-slate-600 rounded-xl hover:border-indigo-400 hover:bg-indigo-50 dark:hover:bg-slate-700 transition-all duration-200 group">
                  <Shield className="w-8 h-8 text-gray-400 group-hover:text-indigo-600 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-indigo-600">Add Employee</p>
                </button>
                <button className="p-4 border-2 border-dashed border-gray-300 dark:border-slate-600 rounded-xl hover:border-indigo-400 hover:bg-indigo-50 dark:hover:bg-slate-700 transition-all duration-200 group">
                  <Plus className="w-8 h-8 text-gray-400 group-hover:text-indigo-600 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-indigo-600">Create Claim</p>
                </button>
                <button className="p-4 border-2 border-dashed border-gray-300 dark:border-slate-600 rounded-xl hover:border-indigo-400 hover:bg-indigo-50 dark:hover:bg-slate-700 transition-all duration-200 group">
                  <FileText className="w-8 h-8 text-gray-400 group-hover:text-indigo-600 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-indigo-600">Generate Report</p>
                </button>
                <button className="p-4 border-2 border-dashed border-gray-300 dark:border-slate-600 rounded-xl hover:border-indigo-400 hover:bg-indigo-50 dark:hover:bg-slate-700 transition-all duration-200 group">
                  <MessageCircle className="w-8 h-8 text-gray-400 group-hover:text-indigo-600 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-indigo-600">Send Message</p>
                </button>
              </div>
            </div>

            {/* System Status */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">System Status</h3>
              <div className="space-y-4">
                {[
                  { service: 'Employee Database', status: 'operational', uptime: '99.9%' },
                  { service: 'Claims Processing', status: 'operational', uptime: '99.7%' },
                  { service: 'Document Storage', status: 'maintenance', uptime: '98.2%' },
                  { service: 'Notification System', status: 'operational', uptime: '99.8%' },
                ].map((service, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-slate-700">
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-3 h-3 rounded-full ${
                          service.status === 'operational' ? 'bg-green-500' : 
                          service.status === 'maintenance' ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                      />
                      <span className="font-medium text-gray-900 dark:text-white text-sm">{service.service}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500 dark:text-gray-400">{service.uptime} uptime</p>
                      <p className={`text-xs font-medium capitalize ${
                        service.status === 'operational' ? 'text-green-600' : 
                        service.status === 'maintenance' ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {service.status}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>

      <style jsx>{`
        .ml-70 {
          margin-left: ${drawerWidth};
        }
        .w-70 {
          width: ${drawerWidth};
        }
        .dark {
          color-scheme: dark;
        }
      `}</style>
    </div>
  );
}