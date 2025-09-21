import React, { useState, useEffect, useCallback } from 'react';
import { 
  Search, 
  Filter, 
  Grid, 
  List, 
  ChevronLeft, 
  ChevronRight, 
  RefreshCw, 
  MoreVertical, 
  Eye, 
  Edit, 
  UserPlus, 
  UserMinus, 
  AlertTriangle,
  BarChart3, 
  Shield, 
  Clock, 
  TrendingUp,
  Calendar,
  DollarSign,
  Users,
  User,
  Phone,
  Mail,
  X,
  ChevronDown
} from 'lucide-react';

// Coverage type mappings
const COVERAGE_TYPES = {
  life: {
    life_cover: 'Life Cover',
    hospitalization: 'Hospitalization',
    surgical_benefits: 'Surgical Benefits',
    outpatient: 'Outpatient',
    prescription_drugs: 'Prescription Drugs'
  },
  vehicle: {
    collision: 'Collision',
    liability: 'Liability',
    comprehensive: 'Comprehensive',
    personal_accident: 'Personal Accident'
  }
};

// Mock service functions with enhanced filtering
const mockPolicyService = {
  getAllPolicies: async (params) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    let mockPolicies = [
      {
        _id: '1',
        policyId: 'LI0001',
        policyType: 'life',
        policyCategory: 'individual',
        status: 'active',
        coverage: { 
          coverageAmount: 500000, 
          deductible: 5000,
          typeLife: ['life_cover', 'hospitalization'],
          coverageDetails: [
            { type: 'life_cover', description: 'Basic life insurance coverage', limit: 300000 },
            { type: 'hospitalization', description: 'Hospital expenses coverage', limit: 200000 }
          ]
        },
        premium: { amount: 2500, frequency: 'monthly' },
        validity: { startDate: '2024-01-01', endDate: '2024-12-31' },
        insuranceAgent: { firstName: 'John', lastName: 'Agent', email: 'john@example.com' },
        beneficiaries: [{ firstName: 'Jane', lastName: 'Doe', email: 'jane@example.com', employeeId: 'EMP001' }]
      },
      {
        _id: '2',
        policyId: 'LI0002',
        policyType: 'life',
        policyCategory: 'group',
        status: 'active',
        coverage: { 
          coverageAmount: 750000, 
          deductible: 3000,
          typeLife: ['life_cover', 'surgical_benefits', 'prescription_drugs'],
          coverageDetails: [
            { type: 'life_cover', description: 'Comprehensive life coverage', limit: 400000 },
            { type: 'surgical_benefits', description: 'Surgical procedure coverage', limit: 250000 },
            { type: 'prescription_drugs', description: 'Medication coverage', limit: 100000 }
          ]
        },
        premium: { amount: 3500, frequency: 'monthly' },
        validity: { startDate: '2024-01-01', endDate: '2024-12-31' },
        insuranceAgent: { firstName: 'Sarah', lastName: 'Smith', email: 'sarah@example.com' },
        beneficiaries: [{ firstName: 'Bob', lastName: 'Wilson', email: 'bob@example.com', employeeId: 'EMP002' }]
      },
      {
        _id: '3',
        policyId: 'VI0001',
        policyType: 'vehicle',
        policyCategory: 'individual',
        status: 'suspended',
        coverage: { 
          coverageAmount: 200000, 
          deductible: 2000,
          typeVehicle: ['collision', 'liability'],
          coverageDetails: [
            { type: 'collision', description: 'Vehicle collision coverage', limit: 120000 },
            { type: 'liability', description: 'Third-party liability coverage', limit: 80000 }
          ]
        },
        premium: { amount: 1500, frequency: 'quarterly' },
        validity: { startDate: '2024-01-01', endDate: '2024-12-31' },
        insuranceAgent: { firstName: 'Mike', lastName: 'Johnson', email: 'mike@example.com' },
        beneficiaries: [{ firstName: 'Alice', lastName: 'Brown', email: 'alice@example.com', employeeId: 'EMP003' }]
      },
      {
        _id: '4',
        policyId: 'VI0002',
        policyType: 'vehicle',
        policyCategory: 'group',
        status: 'active',
        coverage: { 
          coverageAmount: 300000, 
          deductible: 1500,
          typeVehicle: ['comprehensive', 'personal_accident'],
          coverageDetails: [
            { type: 'comprehensive', description: 'Full vehicle coverage', limit: 200000 },
            { type: 'personal_accident', description: 'Personal injury coverage', limit: 100000 }
          ]
        },
        premium: { amount: 2000, frequency: 'quarterly' },
        validity: { startDate: '2024-01-01', endDate: '2024-12-31' },
        insuranceAgent: { firstName: 'Lisa', lastName: 'Davis', email: 'lisa@example.com' },
        beneficiaries: [{ firstName: 'David', lastName: 'Miller', email: 'david@example.com', employeeId: 'EMP004' }]
      }
    ];

    // Apply filters
    if (params.policyType) {
      mockPolicies = mockPolicies.filter(p => p.policyType === params.policyType);
    }

    if (params.policyCategory) {
      mockPolicies = mockPolicies.filter(p => p.policyCategory === params.policyCategory);
    }

    if (params.coverageType) {
      mockPolicies = mockPolicies.filter(p => {
        const coverageTypes = p.policyType === 'life' ? p.coverage.typeLife : p.coverage.typeVehicle;
        return coverageTypes && coverageTypes.includes(params.coverageType);
      });
    }

    if (params.status) {
      mockPolicies = mockPolicies.filter(p => p.status === params.status);
    }

    if (params.search) {
      const searchTerm = params.search.toLowerCase();
      mockPolicies = mockPolicies.filter(p => 
        p.policyId.toLowerCase().includes(searchTerm) ||
        p.policyType.toLowerCase().includes(searchTerm) ||
        (p.insuranceAgent?.firstName + ' ' + p.insuranceAgent?.lastName).toLowerCase().includes(searchTerm)
      );
    }

    return {
      policies: mockPolicies,
      totalPolicies: mockPolicies.length,
      totalPages: Math.ceil(mockPolicies.length / 10),
      currentPage: 1
    };
  },

  getPolicyStats: async () => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return {
      stats: {
        totalPolicies: 45,
        activePolicies: 32,
        expiringPolicies: 5,
        typeStats: [
          { _id: 'life', count: 25 },
          { _id: 'vehicle', count: 20 }
        ]
      }
    };
  }
};

// Format currency
const formatCurrency = (amount) => {
  if (!amount) return 'N/A';
  return new Intl.NumberFormat('en-LK', {
    style: 'currency',
    currency: 'LKR'
  }).format(amount);
};

// Format date
const formatDate = (date) => {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

// Format expiry status
const formatExpiryStatus = (endDate) => {
  if (!endDate) return { text: 'N/A', color: 'text-gray-500' };
  
  const today = new Date();
  const expiry = new Date(endDate);
  const diffTime = expiry.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) return { text: `Expired ${Math.abs(diffDays)} days ago`, color: 'text-red-600' };
  if (diffDays <= 30) return { text: `Expires in ${diffDays} days`, color: 'text-yellow-600' };
  return { text: `Expires in ${diffDays} days`, color: 'text-green-600' };
};

// PolicyStats Component
const PolicyStats = ({ stats, loading }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, index) => (
          <div key={index} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="animate-pulse">
              <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded mb-3"></div>
              <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded mb-2"></div>
              <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Policies',
      value: stats.totalPolicies || 0,
      icon: Shield,
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      iconColor: 'text-blue-600 dark:text-blue-400',
      textColor: 'text-blue-700 dark:text-blue-300'
    },
    {
      title: 'Active Policies',
      value: stats.activePolicies || 0,
      icon: TrendingUp,
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      iconColor: 'text-green-600 dark:text-green-400',
      textColor: 'text-green-700 dark:text-green-300'
    },
    {
      title: 'Expiring Soon',
      value: stats.expiringPolicies || 0,
      icon: Clock,
      bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
      iconColor: 'text-yellow-600 dark:text-yellow-400',
      textColor: 'text-yellow-700 dark:text-yellow-300'
    },
    {
      title: 'Policy Types',
      value: stats.typeStats?.length || 0,
      icon: BarChart3,
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
      iconColor: 'text-purple-600 dark:text-purple-400',
      textColor: 'text-purple-700 dark:text-purple-300'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {statCards.map((stat) => {
        const IconComponent = stat.icon;
        return (
          <div key={stat.title} className={`${stat.bgColor} p-6 rounded-lg border border-gray-200 dark:border-gray-700`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{stat.title}</p>
                <p className={`text-2xl font-bold ${stat.textColor} mt-1`}>
                  {stat.value.toLocaleString()}
                </p>
              </div>
              <div className={`p-2 rounded-lg ${stat.bgColor.replace('50', '100').replace('900/20', '800/30')}`}>
                <IconComponent className={`h-6 w-6 ${stat.iconColor}`} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

// Enhanced PolicyFilters Component with hierarchical filtering
const PolicyFilters = ({ filters, updateFilter, clearFilters, onClose }) => {
  const policyTypeOptions = [
    { value: '', label: 'All Policy Types' },
    { value: 'life', label: 'Life Insurance' },
    { value: 'vehicle', label: 'Vehicle Insurance' }
  ];

  const policyCategoryOptions = [
    { value: '', label: 'All Categories' },
    { value: 'individual', label: 'Individual Policy' },
    { value: 'group', label: 'Group Policy' }
  ];

  const policyStatusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'active', label: 'Active' },
    { value: 'suspended', label: 'Suspended' },
    { value: 'cancelled', label: 'Cancelled' },
    { value: 'expired', label: 'Expired' },
    { value: 'pending', label: 'Pending' }
  ];

  // Get coverage type options based on selected policy type
  const getCoverageTypeOptions = () => {
    if (!filters.policyType) {
      return [{ value: '', label: 'Select Policy Type First' }];
    }
    
    const coverageTypes = COVERAGE_TYPES[filters.policyType] || {};
    return [
      { value: '', label: 'All Coverage Types' },
      ...Object.entries(coverageTypes).map(([value, label]) => ({ value, label }))
    ];
  };

  const hasActiveFilters = Object.values(filters).some(value => value !== '');

  // Handle policy type change - reset coverage type when policy type changes
  const handlePolicyTypeChange = (value) => {
    updateFilter('policyType', value);
    if (filters.coverageType) {
      updateFilter('coverageType', ''); // Reset coverage type
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">3-Level Hierarchical Filters</h3>
        </div>
        {onClose && (
          <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
            <X className="h-5 w-5 text-gray-500" />
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        {/* Step 1: Policy Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <span className="inline-flex items-center gap-1">
              <span className="w-5 h-5 bg-blue-100 text-blue-800 rounded-full text-xs flex items-center justify-center font-bold">1</span>
              Policy Type
            </span>
          </label>
          <select
            value={filters.policyType || ''}
            onChange={(e) => handlePolicyTypeChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {policyTypeOptions.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>

        {/* Step 2: Policy Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <span className="inline-flex items-center gap-1">
              <span className="w-5 h-5 bg-green-100 text-green-800 rounded-full text-xs flex items-center justify-center font-bold">2</span>
              Policy Category
            </span>
          </label>
          <select
            value={filters.policyCategory || ''}
            onChange={(e) => updateFilter('policyCategory', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-green-500"
          >
            {policyCategoryOptions.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>

        {/* Step 3: Coverage Type (conditional) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <span className="inline-flex items-center gap-1">
              <span className="w-5 h-5 bg-purple-100 text-purple-800 rounded-full text-xs flex items-center justify-center font-bold">3</span>
              Coverage Type
            </span>
            {/* {!filters.policyType && 
              // <span className="text-xs text-gray-400 ml-1">(Select policy type first)</span>
            } */}
          </label>
          <select
            value={filters.coverageType || ''}
            onChange={(e) => updateFilter('coverageType', e.target.value)}
            disabled={!filters.policyType}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {getCoverageTypeOptions().map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>

        {/* Additional: Status Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <span className="inline-flex items-center gap-1">
              <span className="w-5 h-5 bg-gray-100 text-gray-800 rounded-full text-xs flex items-center justify-center font-bold">+</span>
              Status
            </span>
          </label>
          <select
            value={filters.status || ''}
            onChange={(e) => updateFilter('status', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
          >
            {policyStatusOptions.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Filter Path Visualization */}
      {hasActiveFilters && (
        <div className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Filter Path:</h4>
              <div className="flex items-center gap-2 flex-wrap">
                {/* Step 1 */}
                {filters.policyType ? (
                  <span className="inline-flex px-3 py-1 text-sm bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200 rounded-full font-medium">
                    {policyTypeOptions.find(opt => opt.value === filters.policyType)?.label}
                  </span>
                ) : (
                  <span className="inline-flex px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-500 rounded-full">
                    Any Type
                  </span>
                )}
                
                <span className="text-gray-400">→</span>
                
                {/* Step 2 */}
                {filters.policyCategory ? (
                  <span className="inline-flex px-3 py-1 text-sm bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-200 rounded-full font-medium">
                    {policyCategoryOptions.find(opt => opt.value === filters.policyCategory)?.label}
                  </span>
                ) : (
                  <span className="inline-flex px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-500 rounded-full">
                    Any Category
                  </span>
                )}
                
                <span className="text-gray-400">→</span>
                
                {/* Step 3 */}
                {filters.coverageType ? (
                  <span className="inline-flex px-3 py-1 text-sm bg-purple-100 dark:bg-purple-800 text-purple-800 dark:text-purple-200 rounded-full font-medium">
                    {COVERAGE_TYPES[filters.policyType]?.[filters.coverageType]}
                  </span>
                ) : (
                  <span className="inline-flex px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-500 rounded-full">
                    {filters.policyType ? 'Any Coverage' : 'Select Type First'}
                  </span>
                )}
                
                {/* Status */}
                {filters.status && (
                  <>
                    <span className="text-gray-400">+</span>
                    <span className="inline-flex px-3 py-1 text-sm bg-orange-100 dark:bg-orange-800 text-orange-800 dark:text-orange-200 rounded-full font-medium">
                      {policyStatusOptions.find(opt => opt.value === filters.status)?.label}
                    </span>
                  </>
                )}
              </div>
            </div>
            <button
              onClick={clearFilters}
              className="px-4 py-2 text-sm font-medium text-red-700 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800 transition-colors"
            >
              Clear All Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Enhanced PolicyTable with coverage details
const PolicyTable = ({ policies, loading, onViewPolicy, onEditStatus, selectedCoverageType }) => {
  const [dropdownOpen, setDropdownOpen] = useState(null);

  const getStatusColor = (status) => {
    const colors = {
      active: 'bg-green-100 text-green-800',
      expired: 'bg-red-100 text-red-800',
      cancelled: 'bg-red-100 text-red-800',
      suspended: 'bg-yellow-100 text-yellow-800',
      pending: 'bg-blue-100 text-blue-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  // Get coverage details for specific coverage type
  const getCoverageDetails = (policy, coverageType) => {
    if (!coverageType || !policy.coverage?.coverageDetails) return null;
    
    const detail = policy.coverage.coverageDetails.find(detail => detail.type === coverageType);
    return detail;
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg border">
        <div className="p-6 animate-pulse space-y-4">
          {[...Array(5)].map((_, index) => (
            <div key={index} className="h-12 bg-gray-300 dark:bg-gray-600 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!policies || policies.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg border p-12 text-center">
        <AlertTriangle className="h-12 w-12 text-gray-300 mx-auto mb-3" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No policies found</h3>
        <p className="text-gray-500">No policies match your current filter criteria.</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-900">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Policy Details</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type & Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                {selectedCoverageType ? 'Specific Coverage' : 'Total Coverage'}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Coverage Types</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Validity</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {policies.map((policy) => {
              const expiryStatus = formatExpiryStatus(policy.validity?.endDate);
              const specificCoverage = getCoverageDetails(policy, selectedCoverageType);
              const coverageTypes = policy.policyType === 'life' ? policy.coverage?.typeLife : policy.coverage?.typeVehicle;
              
              return (
                <tr key={policy._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">{policy.policyId}</div>
                      <div className="text-sm text-gray-500 capitalize">{policy.policyCategory} Policy</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <span className="inline-flex px-2 py-1 text-xs font-medium rounded-md bg-blue-100 text-blue-800">
                        {policy.policyType === 'life' ? 'Life' : 'Vehicle'}
                      </span>
                      <br />
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-md ${getStatusColor(policy.status)}`}>
                        {policy.status.charAt(0).toUpperCase() + policy.status.slice(1)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {specificCoverage ? (
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {formatCurrency(specificCoverage.limit)}
                        </div>
                        <div className="text-sm text-gray-500 capitalize">
                          {COVERAGE_TYPES[policy.policyType]?.[specificCoverage.type]}
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          {specificCoverage.description}
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {formatCurrency(policy.coverage?.coverageAmount)}
                        </div>
                        <div className="text-sm text-gray-500">
                          Premium: {formatCurrency(policy.premium?.amount)} / {policy.premium?.frequency}
                        </div>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {coverageTypes?.map((type, index) => (
                        <span 
                          key={index}
                          className={`inline-flex px-2 py-1 text-xs rounded-md border ${
                            selectedCoverageType === type 
                              ? 'bg-green-100 text-green-800 border-green-300 font-medium' 
                              : 'bg-gray-100 text-gray-700 border-gray-300'
                          }`}
                        >
                          {COVERAGE_TYPES[policy.policyType]?.[type] || type}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm text-gray-900 dark:text-white">
                        {formatDate(policy.validity?.startDate)} - {formatDate(policy.validity?.endDate)}
                      </div>
                      <div className={`text-xs ${expiryStatus.color}`}>
                        {expiryStatus.text}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="relative">
                      <button
                        onClick={() => setDropdownOpen(dropdownOpen === policy._id ? null : policy._id)}
                        className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </button>
                      
                      {dropdownOpen === policy._id && (
                        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-700 rounded-md shadow-lg z-10 border">
                          <div className="py-1">
                            <button
                              onClick={() => {
                                onViewPolicy(policy._id);
                                setDropdownOpen(null);
                              }}
                              className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 w-full text-left"
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </button>
                            <button
                              onClick={() => {
                                onEditStatus(policy._id, policy.status);
                                setDropdownOpen(null);
                              }}
                              className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 w-full text-left"
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Change Status
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Main HRPolicyUser Component
export const HRPolicyUser = () => {
  // States
  const [viewMode, setViewMode] = useState('table');
  const [showFilters, setShowFilters] = useState(true); // Show filters by default
  const [policies, setPolicies] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(false);
  const [statsLoading, setStatsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    policyType: '',
    policyCategory: '',
    coverageType: '',
    status: ''
  });
  const [totalPolicies, setTotalPolicies] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch policies
  const fetchPolicies = useCallback(async () => {
    setLoading(true);
    try {
      const params = { 
        ...filters, 
        search: searchTerm, 
        page: currentPage 
      };
      const response = await mockPolicyService.getAllPolicies(params);
      setPolicies(response.policies);
      setTotalPolicies(response.totalPolicies);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error('Error fetching policies:', error);
    } finally {
      setLoading(false);
    }
  }, [filters, searchTerm, currentPage]);

  // Fetch stats
  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const response = await mockPolicyService.getPolicyStats();
      setStats(response.stats);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  // Effects
  useEffect(() => {
    fetchPolicies();
  }, [fetchPolicies]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Handlers
  const updateFilter = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({ policyType: '', policyCategory: '', coverageType: '', status: '' });
    setSearchTerm('');
    setCurrentPage(1);
  };

  const handleViewPolicy = (policyId) => {
    console.log('View policy:', policyId);
  };

  const handleEditStatus = (policyId, currentStatus) => {
    console.log('Edit status for policy:', policyId, 'Current:', currentStatus);
  };

  const handleRefresh = () => {
    fetchPolicies();
    fetchStats();
  };

  // Get filter description for display
  const getFilterDescription = () => {
    let description = [];
    
    if (filters.policyType) {
      description.push(`${filters.policyType === 'life' ? 'Life' : 'Vehicle'} Insurance`);
    }
    
    if (filters.policyCategory) {
      description.push(`${filters.policyCategory === 'individual' ? 'Individual' : 'Group'} Policy`);
    }
    
    if (filters.coverageType) {
      description.push(`with ${COVERAGE_TYPES[filters.policyType]?.[filters.coverageType] || filters.coverageType} coverage`);
    }
    
    if (filters.status) {
      description.push(`Status: ${filters.status.charAt(0).toUpperCase() + filters.status.slice(1)}`);
    }
    
    return description.length > 0 ? description.join(' • ') : 'All Policies';
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Policy Management</h1>
            <p className="text-gray-600 dark:text-gray-400">
              {getFilterDescription()} • {totalPolicies} policies found
            </p>
          </div>
          <button
            onClick={handleRefresh}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
        </div>

        {/* Statistics */}
        <PolicyStats stats={stats} loading={statsLoading} />
      </div>

      {/* Search and Controls */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          {/* Search */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search policies by ID, agent, or type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:text-white dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-3">
            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors ${
                showFilters
                  ? 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-300'
                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300'
              }`}
            >
              <Filter className="h-4 w-4" />
              Hierarchical Filters
              <ChevronDown className={`h-4 w-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>

            {/* View Mode Toggle */}
            <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              <button
                onClick={() => setViewMode('table')}
                className={`flex items-center gap-2 px-3 py-1 rounded-md text-sm transition-colors ${
                  viewMode === 'table'
                    ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <List className="h-4 w-4" />
                Table
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`flex items-center gap-2 px-3 py-1 rounded-md text-sm transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <Grid className="h-4 w-4" />
                Grid
              </button>
            </div>
          </div>
        </div>

        {/* Hierarchical Filters */}
        {showFilters && (
          <div className="mt-4">
            <PolicyFilters
              filters={filters}
              updateFilter={updateFilter}
              clearFilters={clearFilters}
              onClose={() => setShowFilters(false)}
            />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="mb-6">
        {viewMode === 'table' ? (
          <PolicyTable
            policies={policies}
            loading={loading}
            onViewPolicy={handleViewPolicy}
            onEditStatus={handleEditStatus}
            selectedCoverageType={filters.coverageType}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              [...Array(6)].map((_, index) => (
                <div key={index} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border animate-pulse">
                  <div className="space-y-4">
                    <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
                    <div className="space-y-2">
                      <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded"></div>
                      <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-2/3"></div>
                    </div>
                  </div>
                </div>
              ))
            ) : policies.length > 0 ? (
              policies.map((policy) => {
                const coverageTypes = policy.policyType === 'life' ? policy.coverage?.typeLife : policy.coverage?.typeVehicle;
                const specificCoverage = filters.coverageType ? 
                  policy.coverage?.coverageDetails?.find(detail => detail.type === filters.coverageType) : null;
                
                return (
                  <div key={policy._id} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{policy.policyId}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                          {policy.policyType} Insurance • {policy.policyCategory}
                        </p>
                      </div>
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-md ${
                        policy.status === 'active' ? 'bg-green-100 text-green-800' :
                        policy.status === 'suspended' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {policy.status.charAt(0).toUpperCase() + policy.status.slice(1)}
                      </span>
                    </div>

                    {/* Coverage Information */}
                    <div className="mb-4">
                      {specificCoverage ? (
                        <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg border border-green-200 dark:border-green-800">
                          <h4 className="text-sm font-medium text-green-900 dark:text-green-300 mb-1">
                            Specific Coverage: {COVERAGE_TYPES[policy.policyType]?.[specificCoverage.type]}
                          </h4>
                          <p className="text-lg font-bold text-green-700 dark:text-green-400">
                            {formatCurrency(specificCoverage.limit)}
                          </p>
                          <p className="text-xs text-green-600 dark:text-green-500 mt-1">
                            {specificCoverage.description}
                          </p>
                        </div>
                      ) : (
                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Total Coverage:</span>
                            <span className="font-semibold text-gray-900 dark:text-white">
                              {formatCurrency(policy.coverage?.coverageAmount)}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Premium:</span>
                            <span className="text-sm text-gray-900 dark:text-white">
                              {formatCurrency(policy.premium?.amount)} / {policy.premium?.frequency}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Coverage Types */}
                    <div className="mb-4">
                      <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase mb-2">Coverage Types</h4>
                      <div className="flex flex-wrap gap-1">
                        {coverageTypes?.map((type, index) => (
                          <span 
                            key={index}
                            className={`inline-flex px-2 py-1 text-xs rounded-md border ${
                              filters.coverageType === type 
                                ? 'bg-green-100 text-green-800 border-green-300 font-medium' 
                                : 'bg-gray-100 text-gray-700 border-gray-300'
                            }`}
                          >
                            {COVERAGE_TYPES[policy.policyType]?.[type] || type}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Agent & Validity */}
                    <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                      <div>
                        <span className="font-medium">Agent:</span> {policy.insuranceAgent?.firstName} {policy.insuranceAgent?.lastName}
                      </div>
                      <div>
                        <span className="font-medium">Valid Until:</span> {formatDate(policy.validity?.endDate)}
                      </div>
                      <div className="flex justify-between items-center mt-3">
                        <button
                          onClick={() => handleViewPolicy(policy._id)}
                          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                        >
                          View Details
                        </button>
                        <span className="text-xs text-gray-500">
                          {policy.beneficiaries?.length || 0} beneficiaries
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="col-span-full text-center py-12">
                <AlertTriangle className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No policies found</h3>
                <p className="text-gray-500">Try adjusting your hierarchical filters or search terms.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between bg-white dark:bg-gray-800 px-6 py-3 border border-gray-200 dark:border-gray-700 rounded-lg">
          <div className="text-sm text-gray-700 dark:text-gray-300">
            Showing {policies.length} of {totalPolicies} policies
            {(filters.policyType || filters.policyCategory || filters.coverageType) && (
              <span className="text-blue-600 dark:text-blue-400">
                {' '}• Filtered by:{' '}
                {filters.policyType && (
                  <span>{filters.policyType === 'life' ? 'Life' : 'Vehicle'} Insurance</span>
                )}
                {filters.policyCategory && (
                  <span> → {filters.policyCategory === 'individual' ? 'Individual' : 'Group'} Policy</span>
                )}
                {filters.coverageType && (
                  <span> → {COVERAGE_TYPES[filters.policyType]?.[filters.coverageType]}</span>
                )}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="flex items-center gap-1 px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </button>
            
            <span className="px-3 py-1 text-sm text-gray-700 dark:text-gray-300">
              Page {currentPage} of {totalPages}
            </span>
            
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="flex items-center gap-1 px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

