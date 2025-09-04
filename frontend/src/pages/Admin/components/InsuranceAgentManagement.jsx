import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Eye, UserCheck, UserX, Shield, Phone, Building } from 'lucide-react';
import ContentCard from '../../../components/dashboard/ui/ContentCard';
import ThemeIndicator from '../../../components/dashboard/ui/ThemeIndicator';
import ContextMenu from '../../../components/dashboard/ui/ContextMenu';
import LoadingSpinner from '../../../components/dashboard/ui/LoadingSpinner';
import { useTheme } from '../../../components/dashboard/hooks/useTheme';
import ApiService from '../../../services/api';

const InsuranceAgentManagement = () => {
  const { isDark } = useTheme();
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchAgents();
  }, [searchTerm, statusFilter]);

  const fetchAgents = async () => {
    try {
      setLoading(true);
      const params = { role: 'insurance_agent' };
      if (searchTerm) params.search = searchTerm;
      if (statusFilter) params.status = statusFilter;

      const response = await ApiService.getUsers(params);
      setAgents(response.users);
      setError(null);
    } catch (error) {
      console.error('Error fetching insurance agents:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAgent = async (agentId) => {
    if (window.confirm('Are you sure you want to delete this insurance agent?')) {
      try {
        await ApiService.deleteUser(agentId);
        fetchAgents(); // Refresh the list
      } catch (error) {
        console.error('Error deleting agent:', error);
        alert('Error deleting agent: ' + error.message);
      }
    }
  };

  const handleStatusChange = async (agentId, newStatus) => {
    try {
      await ApiService.updateUserStatus(agentId, newStatus);
      fetchAgents(); // Refresh the list
    } catch (error) {
      console.error('Error updating agent status:', error);
      alert('Error updating agent status: ' + error.message);
    }
  };

  const getContextMenuItems = (agent) => [
    {
      label: 'View Details',
      icon: Eye,
      onClick: () => console.log('View agent:', agent._id)
    },
    {
      label: 'View Policies',
      icon: Shield,
      onClick: () => console.log('View agent policies:', agent._id)
    },
    {
      label: 'Edit Agent',
      icon: Edit,
      onClick: () => console.log('Edit agent:', agent._id)
    },
    {
      label: 'Call Agent',
      icon: Phone,
      onClick: () => console.log('Call agent:', agent.profile?.phone),
      disabled: !agent.profile?.phone
    },
    {
      label: 'View Company',
      icon: Building,
      onClick: () => console.log('View company:', agent.insuranceProvider?.companyName),
      disabled: !agent.insuranceProvider?.companyName
    },
    {
      label: agent.status === 'active' ? 'Deactivate' : 'Activate',
      icon: agent.status === 'active' ? UserX : UserCheck,
      onClick: () => handleStatusChange(agent._id, agent.status === 'active' ? 'inactive' : 'active')
    },
    {
      label: 'Delete Agent',
      icon: Trash2,
      onClick: () => handleDeleteAgent(agent._id),
      destructive: true
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'suspended': return 'bg-yellow-100 text-yellow-800';
      case 'terminated': return 'bg-red-100 text-red-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  return (
    <div className="space-y-6">
      <ThemeIndicator />
      
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Insurance Agent Management</h1>
        <button
          onClick={() => console.log('Create insurance agent')}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Agent
        </button>
      </div>

      <ContentCard title="Insurance Agents">
        {error && (
          <div className="text-red-600 p-4 bg-red-50 rounded-lg mb-4">
            Error: {error}
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex-1 min-w-64">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search insurance agents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="suspended">Suspended</option>
            <option value="terminated">Terminated</option>
          </select>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" text="Loading insurance agents..." />
          </div>
        )}

        {/* Insurance Agents Table */}
        {!loading && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Phone
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Company
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    License
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {agents.map((agent) => (
                  <tr key={agent._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {agent.firstName} {agent.lastName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {agent.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {agent.profile?.phone || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(agent.status)}`}>
                        {agent.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {agent.insuranceProvider?.companyName || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {agent.insuranceProvider?.licenseNumber || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <ContextMenu items={getContextMenuItems(agent)} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && agents.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No insurance agents found.
          </div>
        )}
      </ContentCard>
    </div>
  );
};

export default InsuranceAgentManagement;