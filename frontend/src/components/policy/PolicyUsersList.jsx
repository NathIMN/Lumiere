import React from 'react';
import { 
  Eye, 
  Users, 
  Calendar, 
  DollarSign, 
  Shield,
  Car,
  Heart,
  User,
  UserCheck,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  Pause
} from 'lucide-react';
import { formatDate, formatCurrency } from '../../utils/formatters';

export const PolicyUsersList = ({ 
  policies, 
  loading, 
  view, 
  onViewDetails,
  currentPage,
  totalPages,
  onPageChange
}) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'text-green-700 bg-green-100 dark:text-green-300 dark:bg-green-900';
      case 'expired': return 'text-red-700 bg-red-100 dark:text-red-300 dark:bg-red-900';
      case 'suspended': return 'text-yellow-700 bg-yellow-100 dark:text-yellow-300 dark:bg-yellow-900';
      case 'cancelled': return 'text-gray-700 bg-gray-100 dark:text-gray-300 dark:bg-gray-900';
      case 'pending': return 'text-blue-700 bg-blue-100 dark:text-blue-300 dark:bg-blue-900';
      default: return 'text-gray-700 bg-gray-100 dark:text-gray-300 dark:bg-gray-900';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return <CheckCircle2 className="h-4 w-4" />;
      case 'expired': return <XCircle className="h-4 w-4" />;
      case 'suspended': return <Pause className="h-4 w-4" />;
      case 'cancelled': return <XCircle className="h-4 w-4" />;
      case 'pending': return <Clock className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'life': return <Heart className="h-5 w-5 text-red-500" />;
      case 'vehicle': return <Car className="h-5 w-5 text-blue-500" />;
      default: return <Shield className="h-5 w-5 text-gray-500" />;
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'individual': return <User className="h-4 w-4 text-blue-500" />;
      case 'group': return <Users className="h-4 w-4 text-purple-500" />;
      default: return <User className="h-4 w-4 text-gray-500" />;
    }
  };

  const isExpiringSoon = (endDate) => {
    const today = new Date();
    const expiry = new Date(endDate);
    const daysDiff = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
    return daysDiff <= 30 && daysDiff > 0;
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className={view === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
          {[...Array(6)].map((_, index) => (
            <div key={index} className="bg-gray-100 dark:bg-gray-700 rounded-lg p-6 animate-pulse">
              <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded mb-4"></div>
              <div className="h-6 bg-gray-200 dark:bg-gray-600 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-2/3 mb-4"></div>
              <div className="flex gap-2">
                <div className="h-8 bg-gray-200 dark:bg-gray-600 rounded flex-1"></div>
                <div className="h-8 bg-gray-200 dark:bg-gray-600 rounded w-20"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!policies || policies.length === 0) {
    return (
      <div className="p-12 text-center">
        <div className="bg-gray-100 dark:bg-gray-700 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
          <Users className="h-8 w-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          No policies found
        </h3>
        <p className="text-gray-500 dark:text-gray-400">
          No policies match your current filters. Try adjusting your search criteria.
        </p>
      </div>
    );
  }

  const GridView = () => (
    <div className="p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {policies.map((policy) => (
          <div
            key={policy._id}
            className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 hover:shadow-lg transition-shadow border border-gray-200 dark:border-gray-600"
          >
            {/* Policy Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                {getTypeIcon(policy.policyType)}
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {policy.policyId}
                </h3>
              </div>
              <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(policy.status)}`}>
                {getStatusIcon(policy.status)}
                <span className="ml-1 capitalize">{policy.status}</span>
              </div>
            </div>

            {/* Policy Type & Category */}
            <div className="flex items-center gap-4 mb-3">
              <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                <span className="capitalize font-medium">{policy.policyType}</span>
              </div>
              <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                {getCategoryIcon(policy.policyCategory)}
                <span className="capitalize">{policy.policyCategory}</span>
              </div>
            </div>

            {/* Coverage & Premium */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Coverage</p>
                <p className="text-lg font-bold text-green-600 dark:text-green-400">
                  {formatCurrency(policy.coverage.coverageAmount)}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Premium</p>
                <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                  {formatCurrency(policy.premium.amount)}
                  <span className="text-xs text-gray-500 font-normal">
                    /{policy.premium.frequency}
                  </span>
                </p>
              </div>
            </div>

            {/* Insurance Agent */}
            <div className="mb-4">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Insurance Agent</p>
              <div className="flex items-center gap-2">
                <UserCheck className="h-4 w-4 text-gray-400" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {policy.insuranceAgent?.firstName} {policy.insuranceAgent?.lastName}
                </span>
              </div>
            </div>

            {/* Beneficiaries */}
            <div className="mb-4">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Beneficiaries</p>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-gray-400" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {policy.beneficiaries?.length || 0} users
                </span>
              </div>
            </div>

            {/* Validity */}
            <div className="mb-4">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Valid Until</p>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {formatDate(policy.validity.endDate)}
                </span>
                {isExpiringSoon(policy.validity.endDate) && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-orange-700 bg-orange-100 dark:text-orange-300 dark:bg-orange-900">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    Expiring Soon
                  </span>
                )}
              </div>
            </div>

            {/* Actions */}
            <button
              onClick={() => onViewDetails(policy)}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Eye className="h-4 w-4" />
              View Details
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  const ListView = () => (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50 dark:bg-gray-700">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Policy
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Type & Category
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Coverage
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Premium
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Agent
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Beneficiaries
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Validity
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
          {policies.map((policy) => (
            <tr key={policy._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
              {/* Policy */}
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center gap-3">
                  {getTypeIcon(policy.policyType)}
                  <div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {policy.policyId}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Created {formatDate(policy.createdAt)}
                    </div>
                  </div>
                </div>
              </td>

              {/* Type & Category */}
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="space-y-1">
                  <div className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                    {policy.policyType} Insurance
                  </div>
                  <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                    {getCategoryIcon(policy.policyCategory)}
                    <span className="capitalize">{policy.policyCategory}</span>
                  </div>
                </div>
              </td>

              {/* Coverage */}
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-green-600 dark:text-green-400">
                  {formatCurrency(policy.coverage.coverageAmount)}
                </div>
                {policy.coverage.deductible > 0 && (
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Deductible: {formatCurrency(policy.coverage.deductible)}
                  </div>
                )}
              </td>

              {/* Premium */}
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-blue-600 dark:text-blue-400">
                  {formatCurrency(policy.premium.amount)}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                  {policy.premium.frequency}
                </div>
              </td>

              {/* Agent */}
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900 dark:text-white">
                  {policy.insuranceAgent?.firstName} {policy.insuranceAgent?.lastName}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {policy.insuranceAgent?.email}
                </div>
              </td>

              {/* Beneficiaries */}
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-gray-400" />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {policy.beneficiaries?.length || 0}
                  </span>
                </div>
              </td>

              {/* Status */}
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(policy.status)}`}>
                  {getStatusIcon(policy.status)}
                  <span className="ml-1 capitalize">{policy.status}</span>
                </span>
              </td>

              {/* Validity */}
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900 dark:text-white">
                  {formatDate(policy.validity.endDate)}
                </div>
                {isExpiringSoon(policy.validity.endDate) && (
                  <div className="text-xs text-orange-600 dark:text-orange-400 flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    Expiring Soon
                  </div>
                )}
              </td>

              {/* Actions */}
              <td className="px-6 py-4 whitespace-nowrap">
                <button
                  onClick={() => onViewDetails(policy)}
                  className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 font-medium flex items-center gap-1"
                >
                  <Eye className="h-4 w-4" />
                  View
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  // Pagination Component
  const Pagination = () => {
    if (totalPages <= 1) return null;

    const getPageNumbers = () => {
      const pages = [];
      const maxVisible = 5;
      
      if (totalPages <= maxVisible) {
        for (let i = 1; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        if (currentPage <= 3) {
          for (let i = 1; i <= 4; i++) pages.push(i);
          pages.push('...');
          pages.push(totalPages);
        } else if (currentPage >= totalPages - 2) {
          pages.push(1);
          pages.push('...');
          for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
        } else {
          pages.push(1);
          pages.push('...');
          for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
          pages.push('...');
          pages.push(totalPages);
        }
      }
      
      return pages;
    };

    return (
      <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 dark:border-gray-700">
        <div className="text-sm text-gray-700 dark:text-gray-300">
          Page {currentPage} of {totalPages}
        </div>
        
        <div className="flex items-center space-x-1">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </button>
          
          {getPageNumbers().map((page, index) => (
            <button
              key={index}
              onClick={() => typeof page === 'number' && onPageChange(page)}
              disabled={page === '...'}
              className={`px-3 py-2 text-sm font-medium rounded-md ${
                page === currentPage
                  ? 'bg-green-600 text-white'
                  : page === '...'
                  ? 'text-gray-400 cursor-default'
                  : 'text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
              }`}
            >
              {page}
            </button>
          ))}
          
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div>
      {view === 'grid' ? <GridView /> : <ListView />}
      <Pagination />
    </div>
  );
};