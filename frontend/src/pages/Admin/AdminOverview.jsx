import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Users,
  Shield,
  FileText,
  TrendingUp,
  AlertTriangle,
  Clock,
  CheckCircle,
  XCircle,
  Coins,
  Activity,
  Calendar,
  RefreshCw
} from 'lucide-react';

export const AdminOverview = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    users: {
      total: 0,
      hrOfficers: 0,
      insuranceAgents: 0,
      employees: 0,
      active: 0,
      inactive: 0
    },
    policies: {
      total: 0,
      active: 0,
      expired: 0,
      pending: 0,
      totalPremium: 0,
      lifeInsurance: 0,
      vehicleInsurance: 0
    },
    claims: {
      total: 0,
      pending: 0,
      approved: 0,
      rejected: 0,
      totalAmount: 0,
      avgProcessingTime: 0
    },
    documents: {
      total: 0,
      pending: 0,
      approved: 0,
      rejected: 0
    },
    recentActivity: []
  });

  const [error, setError] = useState(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('authToken');
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      };

      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';

      // Fetch all data in parallel
      const [usersRes, policiesRes, claimsRes, documentsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/users`, { headers }),
        fetch(`${API_BASE_URL}/policies`, { headers }),
        fetch(`${API_BASE_URL}/claims`, { headers }),
        fetch(`${API_BASE_URL}/documents`, { headers })
      ]);

      const [usersData, policiesData, claimsData, documentsData] = await Promise.all([
        usersRes.ok ? usersRes.json() : { users: [] },
        policiesRes.ok ? policiesRes.json() : { policies: [] },
        claimsRes.ok ? claimsRes.json() : { claims: [] },
        documentsRes.ok ? documentsRes.json() : { documents: [] }
      ]);

      // Process users data
      const users = usersData.users || [];
      const usersStats = {
        total: users.length,
        hrOfficers: users.filter(u => u.role === 'hr_officer').length,
        insuranceAgents: users.filter(u => u.role === 'insurance_agent').length,
        employees: users.filter(u => u.role === 'employee').length,
        active: users.filter(u => u.status === 'active').length,
        inactive: users.filter(u => u.status === 'inactive').length
      };

      // Process policies data
      const policies = policiesData.policies || [];
      const policiesStats = {
        total: policies.length,
        active: policies.filter(p => p.status === 'active').length,
        expired: policies.filter(p => p.status === 'expired').length,
        pending: policies.filter(p => p.status === 'pending').length,
        totalPremium: policies.reduce((sum, p) => sum + (p.premium?.amount || 0), 0),
        lifeInsurance: policies.filter(p => p.policyType === 'life').length,
        vehicleInsurance: policies.filter(p => p.policyType === 'vehicle').length
      };

      // Process claims data
      const claims = claimsData.claims || [];
      const claimsStats = {
        total: claims.length,
        pending: claims.filter(c => ['draft', 'employee', 'hr', 'insurer'].includes(c.claimStatus)).length,
        approved: claims.filter(c => c.claimStatus === 'approved').length,
        rejected: claims.filter(c => c.claimStatus === 'rejected').length,
        totalAmount: claims.reduce((sum, c) => sum + (c.claimAmount?.requested || 0), 0),
        avgProcessingTime: 5 // placeholder - would need actual calculation
      };

      // Process documents data
      const documents = documentsData.documents || [];
      const documentsStats = {
        total: documents.length,
        pending: documents.filter(d => d.status === 'pending').length,
        approved: documents.filter(d => d.status === 'approved').length,
        rejected: documents.filter(d => d.status === 'rejected').length
      };

      // Generate recent activity (placeholder)
      const recentActivity = [
        { type: 'claim', message: 'New claim submitted for review', time: '2 minutes ago' },
        { type: 'policy', message: 'Policy renewal completed', time: '15 minutes ago' },
        { type: 'user', message: 'New HR officer added to system', time: '1 hour ago' },
        { type: 'document', message: 'Document verification completed', time: '2 hours ago' }
      ];

      setDashboardData({
        users: usersStats,
        policies: policiesStats,
        claims: claimsStats,
        documents: documentsStats,
        recentActivity
      });

    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon: Icon, change, color = "red" }) => (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-2 border-red-900/10 hover:border-red-900/20 transition-all duration-200 hover:shadow-xl">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
          <p className="text-2xl font-bold text-[#151E3D] dark:text-white">{value}</p>
          {change && (
            <p className={`text-sm ${change.type === 'increase' ? 'text-green-600' : 'text-red-600'}`}>
              {change.type === 'increase' ? '↗' : '↘'} {change.value}% from last month
            </p>
          )}
        </div>
        <div className="p-3 rounded-full bg-gradient-to-br from-red-900 to-[#151E3D]">
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );

  const QuickActionCard = ({ title, description, icon: Icon, action, color = "red" }) => (
    <div 
      onClick={action}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-2 border-red-900/10 hover:border-red-900/20 cursor-pointer hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]"
    >
      <div className="flex items-center space-x-4">
        <div className="p-3 rounded-full bg-gradient-to-br from-red-900 to-[#151E3D]">
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-[#151E3D] dark:text-white">{title}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2">
          <RefreshCw className="w-6 h-6 animate-spin text-red-900" />
          <span className="text-gray-600 dark:text-gray-400">Loading dashboard...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
          <button 
            onClick={loadDashboardData}
            className="px-4 py-2 bg-gradient-to-r from-red-900 to-[#151E3D] text-white rounded-lg hover:from-red-800 hover:to-[#1a2332] transition-all duration-200 shadow-lg"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 rounded-xl shadow-xl border-2 border-red-900/10">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-red-900 to-[#151E3D] rounded-full flex items-center justify-center">
              <Users className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-[#151E3D] dark:text-white">
              Admin Dashboard
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Welcome back, {user?.profile?.firstName || 'Admin'}! Here's your system overview.
          </p>
        </div>
        <button 
          onClick={loadDashboardData}
          className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-red-900 to-[#151E3D] text-white rounded-lg hover:from-red-800 hover:to-[#1a2332] transition-all duration-200 shadow-lg transform hover:scale-105"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Users" 
          value={dashboardData.users.total}
          icon={Users}
          change={{ type: 'increase', value: 12 }}
        />
        <StatCard 
          title="Active Policies" 
          value={dashboardData.policies.active}
          icon={Shield}
          change={{ type: 'increase', value: 8 }}
        />
        <StatCard 
          title="Pending Claims" 
          value={dashboardData.claims.pending}
          icon={Clock}
          change={{ type: 'decrease', value: 5 }}
        />
        <StatCard 
          title="Total Premium" 
          value={`LKR ${dashboardData.policies.totalPremium.toLocaleString()}`}
          icon={Coins}
          change={{ type: 'increase', value: 15 }}
        />
      </div><br />

      {/* Detailed Breakdowns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Users Breakdown */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-2 border-red-900/10 hover:border-red-900/20 transition-all duration-200">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-8 h-8 bg-gradient-to-br from-red-900 to-[#151E3D] rounded-full flex items-center justify-center">
              <Users className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-xl font-semibold text-[#151E3D] dark:text-white">Users Overview</h2>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">HR Officers</span>
              <span className="font-semibold text-gray-900 dark:text-white">{dashboardData.users.hrOfficers}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Insurance Agents</span>
              <span className="font-semibold text-gray-900 dark:text-white">{dashboardData.users.insuranceAgents}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Employees</span>
              <span className="font-semibold text-gray-900 dark:text-white">{dashboardData.users.employees}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Active Users</span>
              <span className="font-semibold text-green-600">{dashboardData.users.active}</span>
            </div>
          </div>
        </div>

        {/* Claims Breakdown */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-2 border-red-900/10 hover:border-red-900/20 transition-all duration-200">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-8 h-8 bg-gradient-to-br from-red-900 to-[#151E3D] rounded-full flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-xl font-semibold text-[#151E3D] dark:text-white">Claims Overview</h2>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Total Claims</span>
              <span className="font-semibold text-gray-900 dark:text-white">{dashboardData.claims.total}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Pending Review</span>
              <span className="font-semibold text-yellow-600">{dashboardData.claims.pending}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Approved</span>
              <span className="font-semibold text-green-600">{dashboardData.claims.approved}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Total Amount</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                LKR {dashboardData.claims.totalAmount.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <QuickActionCard 
            title="Generate Reports"
            description="Create comprehensive system reports"
            icon={FileText}
            action={() => window.location.href = '/admin/reports'}
            color="blue"
          />
          <QuickActionCard 
            title="Manage Users"
            description="Add or modify user accounts"
            icon={Users}
            action={() => window.location.href = '/admin/hr-officers'}
            color="green"
          />
          <QuickActionCard 
            title="Review Policies"
            description="Manage insurance policies"
            icon={Shield}
            action={() => window.location.href = '/admin/manage-policies'}
            color="purple"
          />
          <QuickActionCard 
            title="System Messages"
            description="View and send messages"
            icon={Activity}
            action={() => window.location.href = '/admin/messaging'}
            color="orange"
          />
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Recent Activity</h2>
        <div className="space-y-3">
          {dashboardData.recentActivity.map((activity, index) => (
            <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className={`p-2 rounded-full ${
                activity.type === 'claim' ? 'bg-yellow-100 text-yellow-600' :
                activity.type === 'policy' ? 'bg-green-100 text-green-600' :
                activity.type === 'user' ? 'bg-blue-100 text-blue-600' :
                'bg-purple-100 text-purple-600'
              }`}>
                {activity.type === 'claim' && <Clock className="w-4 h-4" />}
                {activity.type === 'policy' && <Shield className="w-4 h-4" />}
                {activity.type === 'user' && <Users className="w-4 h-4" />}
                {activity.type === 'document' && <FileText className="w-4 h-4" />}
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-900 dark:text-white">{activity.message}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};