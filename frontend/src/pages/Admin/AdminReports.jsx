import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import reportsApiService from '../../services/reports-api';
import {
  FileText,
  Download,
  Filter,
  Calendar,
  Users,
  Shield,
  TrendingUp,
  DollarSign,
  RefreshCw,
  Search,
  ChevronDown,
  Settings,
  Clock,
  CheckCircle,
  AlertCircle,
  X
} from 'lucide-react';

const AdminReports = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [selectedReport, setSelectedReport] = useState('');
  const [reportTemplates, setReportTemplates] = useState([]);
  const [filters, setFilters] = useState({
    dateFrom: '',
    dateTo: '',
    role: '',
    status: '',
    department: '',
    policyType: '',
    claimType: '',
    agent: '',
    premium_min: '',
    premium_max: '',
    amount_min: '',
    amount_max: '',
    period: 'monthly'
  });
  const [showFilters, setShowFilters] = useState(false);
  const [recentReports, setRecentReports] = useState([]);
  const [generateHistory, setGenerateHistory] = useState([]);

  // Available report types
  const reportTypes = [
    {
      id: 'users',
      name: 'User Profiles Report',
      description: 'Comprehensive overview of system users and their profiles',
      icon: Users,
      category: 'User Management',
      access: ['admin', 'hr_officer'],
      filters: ['role', 'department', 'status', 'dateRange']
    },
    {
      id: 'policies',
      name: 'Policies Report',
      description: 'Detailed analysis of insurance policies',
      icon: Shield,
      category: 'Policy Management',
      access: ['admin', 'hr_officer', 'insurance_agent'],
      filters: ['policyType', 'status', 'agent', 'premiumRange', 'dateRange']
    },
    {
      id: 'claims',
      name: 'Claims Report',
      description: 'Comprehensive claims analysis and statistics',
      icon: FileText,
      category: 'Claims Management',
      access: ['admin', 'hr_officer', 'insurance_agent'],
      filters: ['status', 'claimType', 'agent', 'amountRange', 'dateRange']
    },
    {
      id: 'financial',
      name: 'Financial Report',
      description: 'Financial performance and revenue analysis',
      icon: DollarSign,
      category: 'Financial Analysis',
      access: ['admin'],
      filters: ['period', 'dateRange']
    }
  ];

  // Role filter options
  const roleOptions = [
    { value: '', label: 'All Roles' },
    { value: 'admin', label: 'Administrators' },
    { value: 'hr_officer', label: 'HR Officers' },
    { value: 'employee', label: 'Employees' },
    { value: 'insurance_agent', label: 'Insurance Agents' }
  ];

  // Status filter options
  const statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'pending', label: 'Pending' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' }
  ];

  // Policy type options
  const policyTypeOptions = [
    { value: '', label: 'All Policy Types' },
    { value: 'life', label: 'Life Insurance' },
    { value: 'vehicle', label: 'Vehicle Insurance' },
    { value: 'health', label: 'Health Insurance' },
    { value: 'property', label: 'Property Insurance' }
  ];

  // Load report templates on component mount
  useEffect(() => {
    loadReportTemplates();
    loadRecentReports();
  }, []);

  const loadReportTemplates = async () => {
    try {
      const data = await reportsApiService.getReportTemplates();
      setReportTemplates(data.data || []);
    } catch (error) {
      console.error('Error loading report templates:', error);
    }
  };

  const loadRecentReports = () => {
    // Load from localStorage for demo purposes
    const recent = JSON.parse(localStorage.getItem('recentReports') || '[]');
    setRecentReports(recent.slice(0, 5));
  };

  const saveToRecentReports = (reportData) => {
    const recent = JSON.parse(localStorage.getItem('recentReports') || '[]');
    const newReport = {
      id: Date.now(),
      ...reportData,
      generatedAt: new Date().toISOString(),
      generatedBy: user.firstName + ' ' + user.lastName
    };
    recent.unshift(newReport);
    localStorage.setItem('recentReports', JSON.stringify(recent.slice(0, 10)));
    loadRecentReports();
  };

  const generateReport = async (format = 'pdf') => {
    if (!selectedReport) {
      alert('Please select a report type');
      return;
    }

    setLoading(true);
    try {
      let blob;
      
      // Use the appropriate API service method based on report type
      switch (selectedReport) {
        case 'users':
          blob = await reportsApiService.generateUsersReport(filters);
          break;
        case 'policies':
          blob = await reportsApiService.generatePoliciesReport(filters);
          break;
        case 'claims':
          blob = await reportsApiService.generateClaimsReport(filters);
          break;
        case 'financial':
          blob = await reportsApiService.generateFinancialReport(filters);
          break;
        default:
          throw new Error('Unknown report type');
      }

      if (format === 'pdf') {
        // Download PDF
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${selectedReport}-report-${new Date().toISOString().split('T')[0]}.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);

        // Save to recent reports
        const reportType = reportTypes.find(r => r.id === selectedReport);
        saveToRecentReports({
          type: selectedReport,
          name: reportType?.name || selectedReport,
          format: 'PDF',
          filters: { ...filters },
          status: 'completed'
        });
      }
    } catch (error) {
      console.error('Error generating report:', error);
      alert(`Error generating report: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const resetFilters = () => {
    setFilters({
      dateFrom: '',
      dateTo: '',
      role: '',
      status: '',
      department: '',
      policyType: '',
      claimType: '',
      agent: '',
      premium_min: '',
      premium_max: '',
      amount_min: '',
      amount_max: '',
      period: 'monthly'
    });
  };

  const getFilteredReportTypes = () => {
    return reportTypes.filter(report => 
      report.access.includes(user.role)
    );
  };

  const getAvailableFilters = () => {
    const selectedReportType = reportTypes.find(r => r.id === selectedReport);
    return selectedReportType?.filters || [];
  };

  const renderFilterSection = () => {
    const availableFilters = getAvailableFilters();
    if (availableFilters.length === 0) return null;

    return (
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Report Filters
          </h3>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
          >
            <Filter className="w-4 h-4" />
            {showFilters ? 'Hide Filters' : 'Show Filters'}
            <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Date Range */}
            {availableFilters.includes('dateRange') && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    From Date
                  </label>
                  <input
                    type="date"
                    value={filters.dateFrom}
                    onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    To Date
                  </label>
                  <input
                    type="date"
                    value={filters.dateTo}
                    onChange={(e) => setFilters(prev => ({ ...prev, dateTo: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </>
            )}

            {/* Role Filter */}
            {availableFilters.includes('role') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Role
                </label>
                <select
                  value={filters.role}
                  onChange={(e) => setFilters(prev => ({ ...prev, role: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  {roleOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Status Filter */}
            {availableFilters.includes('status') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Status
                </label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  {statusOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Policy Type Filter */}
            {availableFilters.includes('policyType') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Policy Type
                </label>
                <select
                  value={filters.policyType}
                  onChange={(e) => setFilters(prev => ({ ...prev, policyType: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  {policyTypeOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Department Filter */}
            {availableFilters.includes('department') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Department
                </label>
                <input
                  type="text"
                  value={filters.department}
                  onChange={(e) => setFilters(prev => ({ ...prev, department: e.target.value }))}
                  placeholder="Enter department"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            )}

            {/* Premium Range */}
            {availableFilters.includes('premiumRange') && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Min Premium
                  </label>
                  <input
                    type="number"
                    value={filters.premium_min}
                    onChange={(e) => setFilters(prev => ({ ...prev, premium_min: e.target.value }))}
                    placeholder="0"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Max Premium
                  </label>
                  <input
                    type="number"
                    value={filters.premium_max}
                    onChange={(e) => setFilters(prev => ({ ...prev, premium_max: e.target.value }))}
                    placeholder="No limit"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </>
            )}

            {/* Amount Range */}
            {availableFilters.includes('amountRange') && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Min Amount
                  </label>
                  <input
                    type="number"
                    value={filters.amount_min}
                    onChange={(e) => setFilters(prev => ({ ...prev, amount_min: e.target.value }))}
                    placeholder="0"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Max Amount
                  </label>
                  <input
                    type="number"
                    value={filters.amount_max}
                    onChange={(e) => setFilters(prev => ({ ...prev, amount_max: e.target.value }))}
                    placeholder="No limit"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </>
            )}

            {/* Period Filter */}
            {availableFilters.includes('period') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Period
                </label>
                <select
                  value={filters.period}
                  onChange={(e) => setFilters(prev => ({ ...prev, period: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>
            )}
          </div>
        )}

        {showFilters && (
          <div className="flex justify-end mt-4">
            <button
              onClick={resetFilters}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="p-6 bg-white dark:bg-gray-900 rounded-lg shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Reports</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Generate comprehensive reports for policies, claims, users, and financial data
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={loadReportTemplates}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Report Generation Panel */}
        <div className="lg:col-span-2 space-y-6">
          {/* Report Type Selection */}
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Select Report Type
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {getFilteredReportTypes().map((report) => {
                const IconComponent = report.icon;
                return (
                  <div
                    key={report.id}
                    onClick={() => setSelectedReport(report.id)}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                      selectedReport === report.id
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <IconComponent className={`w-6 h-6 mt-1 ${
                        selectedReport === report.id 
                          ? 'text-blue-600 dark:text-blue-400' 
                          : 'text-gray-400'
                      }`} />
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 dark:text-white">
                          {report.name}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {report.description}
                        </p>
                        <span className="inline-block px-2 py-1 text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded mt-2">
                          {report.category}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Filters Section */}
          {selectedReport && renderFilterSection()}

          {/* Action Buttons */}
          {selectedReport && (
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Generate Report
              </h3>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => generateReport('pdf')}
                  disabled={loading}
                  className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Download className="w-4 h-4" />
                  )}
                  {loading ? 'Generating...' : 'Download PDF'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Recent Reports */}
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Recent Reports
            </h3>
            {recentReports.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                No recent reports generated
              </p>
            ) : (
              <div className="space-y-3">
                {recentReports.map((report) => (
                  <div key={report.id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <FileText className="w-4 h-4 text-gray-400" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {report.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(report.generatedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Stats */}
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Quick Stats
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Reports Generated Today</span>
                <span className="font-medium text-gray-900 dark:text-white">{recentReports.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Available Templates</span>
                <span className="font-medium text-gray-900 dark:text-white">{getFilteredReportTypes().length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Your Access Level</span>
                <span className="font-medium text-gray-900 dark:text-white capitalize">
                  {user.role.replace('_', ' ')}
                </span>
              </div>
            </div>
          </div>

          {/* Help & Tips */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-300 mb-3">
              Tips & Help
            </h3>
            <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-2">
              <li>• Use date filters to focus on specific periods</li>
              <li>• Preview data before generating PDF reports</li>
              <li>• PDF reports include charts and summary statistics</li>
              <li>• Reports are generated in real-time from current data</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminReports;