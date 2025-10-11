import React, { useState, useEffect } from 'react';
import {
  Shield,
  Plus,
  Search,
  Filter,
  Edit3,
  Trash2,
  Eye,
  Users,
  Calendar,
  Coins,
  AlertTriangle,
  X,
  Save,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  FileText
} from 'lucide-react';
import insuranceApiService from '../../services/insurance-api';
import userApiService from '../../services/user-api';
import reportsApiService from '../../services/reports-api';

export const AdminPolicies = () => {
  // State management
  const [policies, setPolicies] = useState([]);
  const [insuranceAgents, setInsuranceAgents] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // UI State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedPolicy, setSelectedPolicy] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({
    policyType: '',
    policyCategory: '',
    insuranceAgent: '',
    coverage: {
      coverageAmount: '',
      deductible: '',
      coverageDetails: []
    },
    validity: {
      startDate: '',
      endDate: ''
    },
    premium: {
      amount: '',
      frequency: 'monthly'
    },
    status: 'active',
    notes: ''
  });
  
  // Filter and pagination state
  const [filters, setFilters] = useState({
    search: '',
    policyType: '',
    policyCategory: '',
    status: '',
    insuranceAgent: ''
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });

  // Coverage type definitions
  const lifeCoverageTypes = [
    { type: 'life_cover', description: 'Life insurance and death benefits' },
    { type: 'hospitalization', description: 'Hospital stays and medical treatments' },
    { type: 'surgical_benefits', description: 'Surgical procedures and related costs' },
    { type: 'outpatient', description: 'Outpatient treatments and consultations' },
    { type: 'prescription_drugs', description: 'Prescription medications and pharmacy costs' }
  ];

  const vehicleCoverageTypes = [
    { type: 'collision', description: 'Collision damage and repairs' },
    { type: 'liability', description: 'Third-party liability coverage' },
    { type: 'comprehensive', description: 'Comprehensive vehicle protection' },
    { type: 'personal_accident', description: 'Personal accident and injury coverage' }
  ];

  // Load initial data
  useEffect(() => {
    loadData();
  }, [filters, pagination.page, pagination.limit]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load policies with current filters
      const policiesResponse = await insuranceApiService.getPolicies({
        ...filters,
        page: pagination.page,
        limit: pagination.limit
      });
      
      setPolicies(policiesResponse.policies);
      setPagination(prev => ({
        ...prev,
        total: policiesResponse.totalPolicies,
        pages: policiesResponse.totalPages
      }));
      
      // Load insurance agents if not already loaded
      if (insuranceAgents.length === 0) {
        const agentsResponse = await userApiService.getUsers({ role: 'insurance_agent' });
        setInsuranceAgents(agentsResponse.users || []);
      }
      
      // Load statistics
      const statsResponse = await insuranceApiService.getPolicyStatistics();
      setStats(statsResponse.stats);
      
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Failed to load policies. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      policyType: '',
      policyCategory: '',
      insuranceAgent: '',
      coverage: {
        coverageAmount: '',
        deductible: '',
        coverageDetails: []
      },
      validity: {
        startDate: '',
        endDate: ''
      },
      premium: {
        amount: '',
        frequency: 'monthly'
      },
      status: 'active',
      notes: ''
    });
  };

  // Initialize coverage details based on policy type
  const initializeCoverageDetails = (policyType) => {
    const coverageTypes = policyType === 'life' ? lifeCoverageTypes : vehicleCoverageTypes;
    return coverageTypes.map(ct => ({
      type: ct.type,
      description: ct.description,
      limit: ''
    }));
  };

  // Handle policy type change and initialize coverage
  const handlePolicyTypeChange = (type) => {
    const coverageDetails = initializeCoverageDetails(type);
    setFormData(prev => ({
      ...prev,
      policyType: type,
      coverage: {
        ...prev.coverage,
        coverageDetails
      }
    }));
  };

  // Calculate total coverage amount
  const calculateTotalCoverage = (coverageDetails) => {
    return coverageDetails.reduce((total, detail) => {
      const limit = detail.limit === '' || detail.limit === null || detail.limit === undefined ? 0 : parseInt(detail.limit, 10);
      return total + (isNaN(limit) ? 0 : limit);
    }, 0);
  };

  // Simple string-only conversion for form inputs - keep everything as strings until API submission
  const safeIntegerConversion = (value) => {
    if (value === '' || value === null || value === undefined) {
      return '';
    }
    // Remove any non-numeric characters except for the first negative sign
    const cleanValue = value.toString().replace(/[^0-9-]/g, '').replace(/(?!^)-/g, '');
    // If it's empty after cleaning, return empty string
    if (cleanValue === '' || cleanValue === '-') {
      return '';
    }
    // Return the cleaned numeric string (no conversion to number)
    return cleanValue;
  };

  // Convert form data to API format (convert empty strings to integers)
  const prepareFormDataForAPI = (data) => {
    const prepared = { ...data };
    
    console.log('BEFORE CONVERSION - Coverage Details:');
    data.coverage.coverageDetails.forEach((detail, i) => {
      console.log(`  ${i}: ${detail.type} = "${detail.limit}" (type: ${typeof detail.limit})`);
    });
    
    // Convert premium amount to integer
    prepared.premium = {
      ...prepared.premium,
      amount: prepared.premium.amount === '' ? 0 : parseInt(prepared.premium.amount, 10)
    };
    
    // Convert coverage amounts to integers
    prepared.coverage = {
      ...prepared.coverage,
      deductible: prepared.coverage.deductible === '' ? 0 : parseInt(prepared.coverage.deductible, 10),
      coverageDetails: prepared.coverage.coverageDetails.map(detail => ({
        ...detail,
        limit: detail.limit === '' ? 0 : parseInt(detail.limit, 10)
      }))
    };
    
    console.log('AFTER CONVERSION - Coverage Details:');
    prepared.coverage.coverageDetails.forEach((detail, i) => {
      console.log(`  ${i}: ${detail.type} = ${detail.limit} (type: ${typeof detail.limit})`);
    });
    
    // Recalculate total coverage amount
    prepared.coverage.coverageAmount = calculateTotalCoverage(prepared.coverage.coverageDetails);
    
    console.log('CALCULATED TOTAL COVERAGE:', prepared.coverage.coverageAmount);
    
    // Ensure validity is preserved (it should already be there from the spread operator)
    console.log('prepareFormDataForAPI - validity before return:', prepared.validity);
    
    return prepared;
  };

  const showMessage = (message, isError = false) => {
    if (isError) {
      setError(message);
      setSuccess('');
    } else {
      setSuccess(message);
      setError('');
    }
    
    setTimeout(() => {
      setError('');
      setSuccess('');
    }, 5000);
  };

  // Handle policy deletion
  const handleDeletePolicy = async (policy) => {
    // Check if policy has beneficiaries
    if (policy.beneficiaries && policy.beneficiaries.length > 0) {
      showMessage('Cannot delete policy with existing beneficiaries. Remove all beneficiaries first.', true);
      return;
    }
    
    if (window.confirm(`Are you sure you want to delete policy ${policy.policyId}? This action cannot be undone.`)) {
      try {
        await insuranceApiService.deletePolicy(policy._id);
        showMessage('Policy deleted successfully');
        loadData(); // Refresh the list
      } catch (err) {
        console.error('Error deleting policy:', err);
        showMessage('Failed to delete policy. Please try again.', true);
      }
    }
  };

  // Handle policies report generation
  const handleGeneratePoliciesReport = async () => {
    try {
      setLoading(true);
      
      // Prepare filters based on current page filters
      const reportFilters = {
        policyType: filters.policyType || undefined,
        status: filters.status || undefined,
        insuranceAgent: filters.insuranceAgent || undefined,
        format: 'pdf'
      };

      // Remove undefined values
      Object.keys(reportFilters).forEach(key => {
        if (reportFilters[key] === undefined) {
          delete reportFilters[key];
        }
      });

      // Get the report blob
      const blob = await reportsApiService.generatePoliciesReport(reportFilters);
      
      // Create download link and trigger download (same as AdminReports.jsx)
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `policies-report-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      showMessage('Policies report downloaded successfully');
    } catch (err) {
      console.error('Error generating policies report:', err);
      showMessage(err.message || 'Failed to generate policies report', true);
    } finally {
      setLoading(false);
    }
  };

  // Handle policy creation
  const handleCreatePolicy = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      // Validate required fields
      if (!formData.policyType || !formData.policyCategory || !formData.insuranceAgent) {
        showMessage('Please fill in all required fields.', true);
        return;
      }
      
      // Prepare data for API (convert empty strings to numbers)
      const apiData = prepareFormDataForAPI(formData);
      
      // Debug: Log the prepared data
      
      // Validate coverage details - only check filled limits
      const invalidLimits = apiData.coverage.coverageDetails.filter(detail => 
        detail.limit !== '' && detail.limit !== 0 && detail.limit <= 0
      );
      if (invalidLimits.length > 0) {
        showMessage('All non-empty coverage limits must be greater than 0.', true);
        return;
      }
      
      // Create policy using the enhanced API method
      let response;
      if (apiData.policyType === 'life') {
        response = await insuranceApiService.createLifePolicyWithAllCoverageTypes(apiData, apiData.coverage.coverageDetails);
      } else {
        response = await insuranceApiService.createVehiclePolicyWithAllCoverageTypes(apiData);
      }
      
      showMessage('Policy created successfully');
      setShowCreateModal(false);
      resetForm();
      loadData(); // Refresh the list
      
    } catch (err) {
      console.error('Error creating policy:', err);
      showMessage(err.message || 'Failed to create policy. Please try again.', true);
    } finally {
      setLoading(false);
    }
  };

  // Handle policy update
  const handleUpdatePolicy = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      // Validate required fields
      if (!formData.policyCategory || !formData.insuranceAgent) {
        showMessage('Please fill in all required fields.', true);
        return;
      }
      
      // Prepare data for API (convert empty strings to numbers)
      const apiData = prepareFormDataForAPI(formData);
      
      // Debug: Log the prepared data
      
      // Validate coverage details if they exist - only check filled limits
      const invalidLimits = apiData.coverage.coverageDetails ? 
        apiData.coverage.coverageDetails.filter(detail => 
          detail.limit !== '' && detail.limit !== 0 && detail.limit <= 0
        ) : [];
      if (invalidLimits.length > 0) {
        showMessage('All non-empty coverage limits must be greater than 0.', true);
        return;
      }
      
      console.log('UPDATE: Form Data validity:', formData.validity);
      console.log('UPDATE: API Data validity:', apiData.validity);
      console.log('UPDATE: Sending API Data:', JSON.stringify(apiData, null, 2));
      
      await insuranceApiService.updatePolicy(selectedPolicy._id, apiData);
      
      showMessage('Policy updated successfully');
      setShowEditModal(false);
      setSelectedPolicy(null);
      resetForm();
      loadData(); // Refresh the list
      
    } catch (err) {
      console.error('Error updating policy:', err);
      console.error('Error details:', err.details);
      console.error('Full error object:', JSON.stringify(err, null, 2));
      showMessage(err.message || 'Failed to update policy. Please try again.', true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-2 border-red-900/10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="flex items-center mb-4 md:mb-0">
              <div className="w-12 h-12 bg-gradient-to-br from-red-900 to-[#151E3D] rounded-full flex items-center justify-center mr-4">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-[#151E3D] dark:text-white">
                  Policy Management
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Manage insurance policies, coverage, and agent assignments
                </p>
              </div>
            </div>
            
            <button
              onClick={() => {
                resetForm();
                setShowCreateModal(true);
              }}
              className="flex items-center px-4 py-2 bg-gradient-to-r from-red-900 to-[#151E3D] text-white rounded-lg hover:from-red-800 hover:to-[#1a2332] transition-all duration-200 shadow-lg transform hover:scale-105"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Policy
            </button>
          </div>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
              <span className="text-green-800">{success}</span>
            </div>
          </div>
        )}
        
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <XCircle className="w-5 h-5 text-red-500 mr-2" />
              <span className="text-red-800">{error}</span>
            </div>
          </div>
        )}

        {/* Statistics Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mr-4">
                  <BarChart3 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Policies</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalPolicies}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mr-4">
                  <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Active Policies</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.activePolicies}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900 rounded-lg flex items-center justify-center mr-4">
                  <Clock className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Expiring Soon</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.expiringPolicies}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mr-4">
                  <Coins className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Coverage</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    LKR {stats.typeStats?.reduce((total, stat) => total + (stat.totalCoverage || 0), 0)?.toLocaleString() || '0'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters and Search */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search policies by ID or notes..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>
            
            {/* Filters */}
            <div className="flex flex-wrap gap-3">
              <select
                value={filters.policyType}
                onChange={(e) => setFilters(prev => ({ ...prev, policyType: e.target.value }))}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                <option value="">All Types</option>
                <option value="life">Life Insurance</option>
                <option value="vehicle">Vehicle Insurance</option>
              </select>
              
              <select
                value={filters.policyCategory}
                onChange={(e) => setFilters(prev => ({ ...prev, policyCategory: e.target.value }))}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                <option value="">All Categories</option>
                <option value="individual">Individual</option>
                <option value="group">Group</option>
              </select>
              
              <select
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="expired">Expired</option>
                <option value="cancelled">Cancelled</option>
                <option value="suspended">Suspended</option>
                <option value="pending">Pending</option>
              </select>
              
              <select
                value={filters.insuranceAgent}
                onChange={(e) => setFilters(prev => ({ ...prev, insuranceAgent: e.target.value }))}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                <option value="">All Agents</option>
                {insuranceAgents.map(agent => (
                  <option key={agent._id} value={agent._id}>
                    {agent.profile?.firstName} {agent.profile?.lastName}
                  </option>
                ))}
              </select>
              
              <button
                onClick={handleGeneratePoliciesReport}
                disabled={loading}
                className="flex items-center px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-200 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FileText className="w-4 h-4 mr-2" />
                Generate Report
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <>
            {/* Policies Table */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Policy Details
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Type & Category
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Coverage
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Agent
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {policies.map((policy) => (
                      <tr key={policy._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {policy.policyId}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              Created: {new Date(policy.createdAt).toLocaleDateString()}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              Expires: {new Date(policy.validity.endDate).toLocaleDateString()}
                            </div>
                          </div>
                        </td>
                        
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              policy.policyType === 'life' 
                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                            }`}>
                              {policy.policyType === 'life' ? 'Life' : 'Vehicle'}
                            </span>
                            <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                              {policy.policyCategory}
                            </div>
                          </div>
                        </td>
                        
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              LKR {policy.coverage.coverageAmount?.toLocaleString() || '0'}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              Premium: LKR {policy.premium.amount?.toLocaleString() || '0'} 
                              {policy.premium.frequency && ` (${policy.premium.frequency})`}
                            </div>
                          </div>
                        </td>
                        
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-8 w-8">
                              <div className="h-8 w-8 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                                <Users className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                              </div>
                            </div>
                            <div className="ml-3">
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {policy.insuranceAgent?.profile?.firstName} {policy.insuranceAgent?.profile?.lastName}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                {policy.insuranceAgent?.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            policy.status === 'active' 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                              : policy.status === 'expired'
                              ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                              : policy.status === 'suspended'
                              ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                              : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                          }`}>
                            {policy.status}
                          </span>
                        </td>
                        
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => {
                                setSelectedPolicy(policy);
                                setShowDetailsModal(true);
                              }}
                              className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            
                            <button
                              onClick={() => {
                                setSelectedPolicy(policy);
                                // Pre-fill form with current policy data, converting numbers to strings
                                setFormData({
                                  policyType: policy.policyType,
                                  policyCategory: policy.policyCategory,
                                  insuranceAgent: policy.insuranceAgent?._id || '',
                                  coverage: {
                                    ...policy.coverage,
                                    coverageAmount: policy.coverage.coverageAmount ? policy.coverage.coverageAmount.toString() : '',
                                    deductible: policy.coverage.deductible ? policy.coverage.deductible.toString() : '',
                                    coverageDetails: policy.coverage.coverageDetails.map(detail => ({
                                      ...detail,
                                      limit: detail.limit ? detail.limit.toString() : ''
                                    }))
                                  },
                                  validity: {
                                    startDate: policy.validity?.startDate ? 
                                      new Date(policy.validity.startDate).toISOString().split('T')[0] : '',
                                    endDate: policy.validity?.endDate ? 
                                      new Date(policy.validity.endDate).toISOString().split('T')[0] : ''
                                  },
                                  premium: {
                                    ...policy.premium,
                                    amount: policy.premium.amount ? policy.premium.amount.toString() : ''
                                  },
                                  status: policy.status,
                                  notes: policy.notes || ''
                                });
                                setShowEditModal(true);
                              }}
                              className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                              title="Edit Policy"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            
                            <button
                              onClick={() => handleDeletePolicy(policy)}
                              className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                              title="Delete Policy"
                              disabled={policy.beneficiaries && policy.beneficiaries.length > 0}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Pagination */}
              {pagination.pages > 1 && (
                <div className="bg-white dark:bg-gray-800 px-4 py-3 flex items-center justify-between border-t border-gray-200 dark:border-gray-700 sm:px-6">
                  <div className="flex-1 flex justify-between sm:hidden">
                    <button
                      onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                      disabled={pagination.page === 1}
                      className="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setPagination(prev => ({ ...prev, page: Math.min(prev.pages, prev.page + 1) }))}
                      disabled={pagination.page === pagination.pages}
                      className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                  <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        Showing{' '}
                        <span className="font-medium">{(pagination.page - 1) * pagination.limit + 1}</span>
                        {' '}to{' '}
                        <span className="font-medium">
                          {Math.min(pagination.page * pagination.limit, pagination.total)}
                        </span>
                        {' '}of{' '}
                        <span className="font-medium">{pagination.total}</span>
                        {' '}results
                      </p>
                    </div>
                    <div>
                      <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                        <button
                          onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                          disabled={pagination.page === 1}
                          className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <ChevronLeft className="h-5 w-5" />
                        </button>
                        
                        {/* Page numbers */}
                        {[...Array(Math.min(5, pagination.pages))].map((_, index) => {
                          const page = index + 1;
                          return (
                            <button
                              key={page}
                              onClick={() => setPagination(prev => ({ ...prev, page }))}
                              className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                page === pagination.page
                                  ? 'z-10 bg-blue-50 border-blue-500 text-blue-600 dark:bg-blue-900 dark:border-blue-600 dark:text-blue-400'
                                  : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700'
                              }`}
                            >
                              {page}
                            </button>
                          );
                        })}
                        
                        <button
                          onClick={() => setPagination(prev => ({ ...prev, page: Math.min(prev.pages, prev.page + 1) }))}
                          disabled={pagination.page === pagination.pages}
                          className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <ChevronRight className="h-5 w-5" />
                        </button>
                      </nav>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Create Policy Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 flex items-center justify-center p-4 z-50"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.6)" }}>
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Create New Policy
              </h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6">
              <form onSubmit={handleCreatePolicy} className="space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Policy Type *
                    </label>
                    <select
                      value={formData.policyType}
                      onChange={(e) => handlePolicyTypeChange(e.target.value)}
                      required
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    >
                      <option value="">Select Policy Type</option>
                      <option value="life">Life Insurance</option>
                      <option value="vehicle">Vehicle Insurance</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Policy Category *
                    </label>
                    <select
                      value={formData.policyCategory}
                      onChange={(e) => setFormData(prev => ({ ...prev, policyCategory: e.target.value }))}
                      required
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    >
                      <option value="">Select Category</option>
                      <option value="individual">Individual</option>
                      <option value="group">Group</option>
                    </select>
                  </div>
                </div>

                {/* Insurance Agent */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Insurance Agent *
                  </label>
                  <select
                    value={formData.insuranceAgent}
                    onChange={(e) => setFormData(prev => ({ ...prev, insuranceAgent: e.target.value }))}
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">Select Insurance Agent</option>
                    {insuranceAgents.map(agent => (
                      <option key={agent._id} value={agent._id}>
                        {agent.profile?.firstName} {agent.profile?.lastName} - {agent.email}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Validity Period */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Start Date *
                    </label>
                    <input
                      type="date"
                      value={formData.validity.startDate}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        validity: { ...prev.validity, startDate: e.target.value }
                      }))}
                      required
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      End Date *
                    </label>
                    <input
                      type="date"
                      value={formData.validity.endDate}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        validity: { ...prev.validity, endDate: e.target.value }
                      }))}
                      required
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>

                {/* Premium Information */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Premium Amount *
                    </label>
                    <input
                      type="text" inputMode="numeric" pattern="[0-9]*"
                      min="0"
                      
                      value={formData.premium.amount || ""}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        premium: { ...prev.premium, amount: safeIntegerConversion(e.target.value) }
                      }))}
                      required
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Premium Frequency *
                    </label>
                    <select
                      value={formData.premium.frequency}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        premium: { ...prev.premium, frequency: e.target.value }
                      }))}
                      required
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    >
                      <option value="monthly">Monthly</option>
                      <option value="quarterly">Quarterly</option>
                      <option value="semi-annual">Semi-Annual</option>
                      <option value="annual">Annual</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Deductible
                    </label>
                    <input
                      type="text" inputMode="numeric" pattern="[0-9]*"
                      min="0"
                      
                      value={formData.coverage.deductible || ""}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        coverage: { ...prev.coverage, deductible: safeIntegerConversion(e.target.value) }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>

                {/* Coverage Details */}
                {formData.policyType && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                      Coverage Details
                    </h3>
                    <div className="space-y-4">
                      {formData.coverage.coverageDetails.map((detail, index) => (
                        <div key={detail.type} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Coverage Type
                              </label>
                              <input
                                type="text"
                                value={detail.type.replace('_', ' ').toUpperCase()}
                                disabled
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-600 text-gray-500 dark:text-gray-400"
                              />
                            </div>
                            
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Coverage Limit *
                              </label>
                              <input
                                type="text" inputMode="numeric" pattern="[0-9]*"
                                min="0"
                                
                                value={detail.limit || ""}
                                onChange={(e) => {
                                  const newCoverageDetails = [...formData.coverage.coverageDetails];
                                  newCoverageDetails[index].limit = safeIntegerConversion(e.target.value);
                                  setFormData(prev => ({
                                    ...prev,
                                    coverage: {
                                      ...prev.coverage,
                                      coverageDetails: newCoverageDetails,
                                      coverageAmount: calculateTotalCoverage(newCoverageDetails)
                                    }
                                  }));
                                }}
                                required
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                              />
                            </div>
                          </div>
                          
                          <div className="mt-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Description
                            </label>
                            <input
                              type="text"
                              value={detail.description}
                              onChange={(e) => {
                                const newCoverageDetails = [...formData.coverage.coverageDetails];
                                newCoverageDetails[index].description = e.target.value;
                                setFormData(prev => ({
                                  ...prev,
                                  coverage: { ...prev.coverage, coverageDetails: newCoverageDetails }
                                }));
                              }}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900 rounded-lg">
                      <div className="text-sm text-blue-800 dark:text-blue-200">
                        <strong>Total Coverage Amount: LKR {formData.coverage.coverageAmount?.toLocaleString() || '0'}</strong>
                      </div>
                    </div>
                  </div>
                )}

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Notes
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="Additional notes or comments about this policy..."
                  />
                </div>

                {/* Form Actions */}
                <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Create Policy
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Policy Modal */}
      {showEditModal && selectedPolicy && (
        <div className="fixed inset-0 flex items-center justify-center p-4 z-50"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.6)" }}>
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Edit Policy: {selectedPolicy.policyId}
              </h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6">
              <form onSubmit={handleUpdatePolicy} className="space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Policy Type
                    </label>
                    <input
                      type="text"
                      value={formData.policyType === 'life' ? 'Life Insurance' : 'Vehicle Insurance'}
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-600 text-gray-500 dark:text-gray-400"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Policy Category *
                    </label>
                    <select
                      value={formData.policyCategory}
                      onChange={(e) => setFormData(prev => ({ ...prev, policyCategory: e.target.value }))}
                      required
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    >
                      <option value="individual">Individual</option>
                      <option value="group">Group</option>
                    </select>
                  </div>
                </div>

                {/* Insurance Agent */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Insurance Agent *
                  </label>
                  <select
                    value={formData.insuranceAgent}
                    onChange={(e) => setFormData(prev => ({ ...prev, insuranceAgent: e.target.value }))}
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  >
                    {insuranceAgents.map(agent => (
                      <option key={agent._id} value={agent._id}>
                        {agent.profile?.firstName} {agent.profile?.lastName} - {agent.email}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Validity Period */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Start Date *
                    </label>
                    <input
                      type="date"
                      value={formData.validity.startDate ? formData.validity.startDate.split('T')[0] : ''}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        validity: { ...prev.validity, startDate: e.target.value }
                      }))}
                      required
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      End Date *
                    </label>
                    <input
                      type="date"
                      value={formData.validity.endDate ? formData.validity.endDate.split('T')[0] : ''}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        validity: { ...prev.validity, endDate: e.target.value }
                      }))}
                      required
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>

                {/* Premium Information */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Premium Amount *
                    </label>
                    <input
                      type="text" inputMode="numeric" pattern="[0-9]*"
                      min="0"
                      
                      value={formData.premium.amount || ""}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        premium: { ...prev.premium, amount: safeIntegerConversion(e.target.value) }
                      }))}
                      required
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Premium Frequency *
                    </label>
                    <select
                      value={formData.premium.frequency}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        premium: { ...prev.premium, frequency: e.target.value }
                      }))}
                      required
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    >
                      <option value="monthly">Monthly</option>
                      <option value="quarterly">Quarterly</option>
                      <option value="semi-annual">Semi-Annual</option>
                      <option value="annual">Annual</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Deductible
                    </label>
                    <input
                      type="text" inputMode="numeric" pattern="[0-9]*"
                      min="0"
                      
                      value={formData.coverage.deductible || ""}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        coverage: { ...prev.coverage, deductible: safeIntegerConversion(e.target.value) }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>

                {/* Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Policy Status *
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  >
                    <option value="active">Active</option>
                    <option value="suspended">Suspended</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="expired">Expired</option>
                    <option value="pending">Pending</option>
                  </select>
                </div>

                {/* Coverage Details */}
                {formData.coverage.coverageDetails && formData.coverage.coverageDetails.length > 0 && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                      Coverage Details
                    </h3>
                    <div className="space-y-4">
                      {formData.coverage.coverageDetails.map((detail, index) => (
                        <div key={detail.type} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Coverage Type
                              </label>
                              <input
                                type="text"
                                value={detail.type.replace('_', ' ').toUpperCase()}
                                disabled
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-600 text-gray-500 dark:text-gray-400"
                              />
                            </div>
                            
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Coverage Limit *
                              </label>
                              <input
                                type="text" inputMode="numeric" pattern="[0-9]*"
                                min="0"
                                
                                value={detail.limit || ""}
                                onChange={(e) => {
                                  const newCoverageDetails = [...formData.coverage.coverageDetails];
                                  newCoverageDetails[index].limit = safeIntegerConversion(e.target.value);
                                  setFormData(prev => ({
                                    ...prev,
                                    coverage: {
                                      ...prev.coverage,
                                      coverageDetails: newCoverageDetails,
                                      coverageAmount: calculateTotalCoverage(newCoverageDetails)
                                    }
                                  }));
                                }}
                                required
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                              />
                            </div>
                          </div>
                          
                          <div className="mt-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Description
                            </label>
                            <input
                              type="text"
                              value={detail.description}
                              onChange={(e) => {
                                const newCoverageDetails = [...formData.coverage.coverageDetails];
                                newCoverageDetails[index].description = e.target.value;
                                setFormData(prev => ({
                                  ...prev,
                                  coverage: { ...prev.coverage, coverageDetails: newCoverageDetails }
                                }));
                              }}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900 rounded-lg">
                      <div className="text-sm text-blue-800 dark:text-blue-200">
                        <strong>Total Coverage Amount: LKR {formData.coverage.coverageAmount?.toLocaleString() || '0'}</strong>
                      </div>
                    </div>
                  </div>
                )}

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Notes
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="Additional notes or comments about this policy..."
                  />
                </div>

                {/* Form Actions */}
                <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Update Policy
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Policy Details Modal */}
      {showDetailsModal && selectedPolicy && (
        <div className="fixed inset-0 flex items-center justify-center p-4 z-50"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.6)" }}>
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Policy Details: {selectedPolicy.policyId}
              </h2>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Policy Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Basic Information</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Policy ID:</span>
                      <span className="font-medium text-gray-900 dark:text-white">{selectedPolicy.policyId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Type:</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {selectedPolicy.policyType === 'life' ? 'Life Insurance' : 'Vehicle Insurance'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Category:</span>
                      <span className="font-medium text-gray-900 dark:text-white">{selectedPolicy.policyCategory}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Status:</span>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        selectedPolicy.status === 'active' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : selectedPolicy.status === 'expired'
                          ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                      }`}>
                        {selectedPolicy.status}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Coverage & Premium</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Total Coverage:</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        LKR {selectedPolicy.coverage.coverageAmount?.toLocaleString() || '0'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Deductible:</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        LKR {selectedPolicy.coverage.deductible?.toLocaleString() || '0'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Premium:</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        LKR {selectedPolicy.premium.amount?.toLocaleString() || '0'} ({selectedPolicy.premium.frequency})
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Coverage Details */}
              {selectedPolicy.coverage.coverageDetails && selectedPolicy.coverage.coverageDetails.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Coverage Breakdown</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedPolicy.coverage.coverageDetails.map((detail, index) => (
                      <div key={index} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          {detail.type.replace('_', ' ').toUpperCase()}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {detail.description}
                        </p>
                        <p className="text-lg font-semibold text-blue-600 dark:text-blue-400 mt-2">
                          LKR {detail.limit?.toLocaleString() || '0'}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Insurance Agent */}
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Insurance Agent</h3>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mr-3">
                    <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {selectedPolicy.insuranceAgent?.profile?.firstName} {selectedPolicy.insuranceAgent?.profile?.lastName}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {selectedPolicy.insuranceAgent?.email}
                    </p>
                  </div>
                </div>
              </div>

              {/* Beneficiaries */}
              {selectedPolicy.beneficiaries && selectedPolicy.beneficiaries.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                    Beneficiaries ({selectedPolicy.beneficiaries.length})
                  </h3>
                  <div className="space-y-2">
                    {selectedPolicy.beneficiaries.map((beneficiary, index) => (
                      <div key={index} className="flex items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center mr-3">
                          <Users className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {beneficiary.firstName || beneficiary.profile?.firstName} {beneficiary.lastName || beneficiary.profile?.lastName}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {beneficiary.email} {beneficiary.employeeId && `(${beneficiary.employeeId})`}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Validity Period */}
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Validity Period</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Start Date:</span>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {new Date(selectedPolicy.validity.startDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">End Date:</span>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {new Date(selectedPolicy.validity.endDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {selectedPolicy.notes && (
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Notes</h3>
                  <p className="text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    {selectedPolicy.notes}
                  </p>
                </div>
              )}
            </div>
            
            <div className="flex items-center justify-end p-6 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPolicies;
