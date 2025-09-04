import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Eye, RefreshCw, Download } from 'lucide-react';
import ContentCard from '../../../components/dashboard/ui/ContentCard';
import ThemeIndicator from '../../../components/dashboard/ui/ThemeIndicator';
import ContextMenu from '../../../components/dashboard/ui/ContextMenu';
import LoadingSpinner from '../../../components/dashboard/ui/LoadingSpinner';
import { useTheme } from '../../../components/dashboard/hooks/useTheme';
import ApiService from '../../../services/api';

const PolicyManagement = () => {
  const { isDark } = useTheme();
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    fetchPolicies();
  }, [searchTerm, statusFilter, typeFilter]);

  const fetchPolicies = async () => {
    try {
      setLoading(true);
      const params = {};
      if (searchTerm) params.search = searchTerm;
      if (statusFilter) params.status = statusFilter;
      if (typeFilter) params.policyType = typeFilter;

      const response = await ApiService.getPolicies(params);
      setPolicies(response.policies);
      setError(null);
    } catch (error) {
      console.error('Error fetching policies:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePolicy = async (policyId) => {
    if (window.confirm('Are you sure you want to delete this policy?')) {
      try {
        await ApiService.deletePolicy(policyId);
        fetchPolicies(); // Refresh the list
      } catch (error) {
        console.error('Error deleting policy:', error);
        alert('Error deleting policy: ' + error.message);
      }
    }
  };

  const getContextMenuItems = (policy) => [
    {
      label: 'View Details',
      icon: Eye,
      onClick: () => console.log('View policy:', policy._id)
    },
    {
      label: 'Edit Policy',
      icon: Edit,
      onClick: () => console.log('Edit policy:', policy._id)
    },
    {
      label: 'Download',
      icon: Download,
      onClick: () => console.log('Download policy:', policy._id)
    },
    {
      label: 'Refresh Status',
      icon: RefreshCw,
      onClick: () => console.log('Refresh policy status:', policy._id)
    },
    {
      label: 'Delete Policy',
      icon: Trash2,
      onClick: () => handleDeletePolicy(policy._id),
      destructive: true
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'expired': return 'bg-red-100 text-red-800';
      case 'suspended': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  return (
    <div className="space-y-6">
      <ThemeIndicator />
      
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Policy Management</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Create Policy
        </button>
      </div>

      <ContentCard title="Policies">
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
                placeholder="Search policies..."
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
            <option value="expired">Expired</option>
            <option value="suspended">Suspended</option>
            <option value="cancelled">Cancelled</option>
            <option value="pending">Pending</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Types</option>
            <option value="life">Life Insurance</option>
            <option value="vehicle">Vehicle Insurance</option>
          </select>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" text="Loading policies..." />
          </div>
        )}

        {/* Policies Table */}
        {!loading && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Policy ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Coverage
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Premium
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Agent
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {policies.map((policy) => (
                  <tr key={policy._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {policy.policyId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                      {policy.policyType}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(policy.status)}`}>
                        {policy.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ${policy.coverage?.coverageAmount?.toLocaleString() || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ${policy.premium?.amount?.toLocaleString() || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {policy.insuranceAgent ? 
                        `${policy.insuranceAgent.firstName} ${policy.insuranceAgent.lastName}` : 
                        'N/A'
                      }
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <ContextMenu items={getContextMenuItems(policy)} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && policies.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No policies found.
          </div>
        )}
      </ContentCard>
    </div>
  );
};

export default PolicyManagement;