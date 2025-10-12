/* eslint-disable no-unused-vars */
import React from 'react';
import { 
  X, 
  Calendar, 
  DollarSign, 
  Shield, 
  Users, 
  User,
  Mail,
  Phone,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Heart,
  Car,
  UserCheck
} from 'lucide-react';

export const PolicyDetailsModal = ({ policy, isOpen, onClose }) => {
  // Debug logging
  console.log('=== PolicyDetailsModal Render ===');
  console.log('isOpen:', isOpen);
  console.log('policy:', policy);
  console.log('Has policy:', !!policy);
  
  // Early return if not open or no policy
  if (!isOpen) {
    console.log('Modal not open - returning null');
    return null;
  }
  
  if (!policy) {
    console.log('No policy data - returning null');
    return null;
  }

  // Log policy structure
  console.log('Policy structure:', {
    id: policy._id,
    policyId: policy.policyId,
    policyNumber: policy.policyNumber,
    policyType: policy.policyType,
    status: policy.status,
    hasCoverage: !!policy.coverage,
    hasPremium: !!policy.premium,
    hasValidity: !!policy.validity,
    hasBeneficiaries: !!policy.beneficiaries,
    hasInsuranceAgent: !!policy.insuranceAgent
  });

  // Safe format functions
  const safeFormatCurrency = (amount) => {
    try {
      if (!amount && amount !== 0) return 'N/A';
      return new Intl.NumberFormat('en-LK', {
        style: 'currency',
        currency: 'LKR',
      }).format(amount);
    } catch (error) {
      return `LKR ${amount || 0}`;
    }
  };

  const safeFormatDate = (date) => {
    try {
      if (!date) return 'N/A';
      return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return 'Invalid Date';
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      active: 'text-green-700 bg-green-100',
      expired: 'text-red-700 bg-red-100',
      suspended: 'text-yellow-700 bg-yellow-100',
      cancelled: 'text-gray-700 bg-gray-100',
      pending: 'text-blue-700 bg-blue-100'
    };
    return colors[status] || colors.pending;
  };

  const getStatusIcon = (status) => {
    const icons = {
      active: <CheckCircle2 className="h-5 w-5" />,
      expired: <X className="h-5 w-5" />,
      suspended: <AlertTriangle className="h-5 w-5" />,
      cancelled: <X className="h-5 w-5" />,
      pending: <Clock className="h-5 w-5" />
    };
    return icons[status] || <Clock className="h-5 w-5" />;
  };

  const getTypeIcon = (type) => {
    if (type === 'life') return <Heart className="h-6 w-6 text-red-500" />;
    if (type === 'vehicle') return <Car className="h-6 w-6 text-blue-500" />;
    return <Shield className="h-6 w-6 text-gray-500" />;
  };

  const getCoverageTypes = () => {
    if (!policy.coverage) return [];
    if (policy.policyType === 'life') {
      return policy.coverage.typeLife || [];
    } else if (policy.policyType === 'vehicle') {
      return policy.coverage.typeVehicle || [];
    }
    return [];
  };

  const formatCoverageType = (type) => {
    return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const isExpiringSoon = (endDate) => {
    if (!endDate) return false;
    const today = new Date();
    const expiry = new Date(endDate);
    const daysDiff = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
    return daysDiff <= 30 && daysDiff > 0;
  };

  // Safe data extraction with defaults
  const displayPolicy = {
    ...policy,
    policyId: policy.policyId || policy.policyNumber || 'N/A',
    policyType: policy.policyType || 'unknown',
    policyCategory: policy.policyCategory || 'individual',
    status: policy.status || 'pending',
    coverage: policy.coverage || {},
    premium: policy.premium || {},
    validity: policy.validity || {},
    beneficiaries: policy.beneficiaries || [],
    insuranceAgent: policy.insuranceAgent || null,
    documents: policy.documents || [],
    notes: policy.notes || ''
  };

  console.log('✓ Rendering modal with displayPolicy');

  return (
    <div className="fixed inset-0 z-[9999] overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen p-4">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
          onClick={onClose}
        ></div>

        {/* Modal */}
        <div className="relative w-full max-w-4xl bg-white rounded-lg shadow-xl overflow-hidden" style={{ maxHeight: '90vh' }}>
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white sticky top-0 z-10">
            <div className="flex items-center gap-3">
              {getTypeIcon(displayPolicy.policyType)}
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Policy Details - {displayPolicy.policyId}
                </h2>
                <p className="text-sm text-gray-500">
                  {displayPolicy.policyType === 'life' ? 'Life Insurance' : 'Vehicle Insurance'} • {displayPolicy.policyCategory === 'individual' ? 'Individual' : 'Group'} Policy
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Content - Scrollable */}
          <div className="overflow-y-auto p-6" style={{ maxHeight: 'calc(90vh - 140px)' }}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-6">
                {/* Policy Overview */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Policy Overview
                  </h3>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">Status</span>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(displayPolicy.status)}`}>
                        {getStatusIcon(displayPolicy.status)}
                        <span className="ml-1 capitalize">{displayPolicy.status}</span>
                      </span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Policy Type</span>
                      <span className="text-sm font-medium text-gray-900 capitalize">
                        {displayPolicy.policyType} Insurance
                      </span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Category</span>
                      <span className="text-sm font-medium text-gray-900 capitalize">
                        {displayPolicy.policyCategory}
                      </span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Created</span>
                      <span className="text-sm font-medium text-gray-900">
                        {safeFormatDate(displayPolicy.createdAt)}
                      </span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Last Updated</span>
                      <span className="text-sm font-medium text-gray-900">
                        {safeFormatDate(displayPolicy.updatedAt)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Coverage Details */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Coverage Details
                  </h3>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Coverage Amount</span>
                      <span className="text-lg font-bold text-green-600">
                        {safeFormatCurrency(displayPolicy.coverage.coverageAmount)}
                      </span>
                    </div>
                    
                    {displayPolicy.coverage.deductible > 0 && (
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Deductible</span>
                        <span className="text-sm font-medium text-gray-900">
                          {safeFormatCurrency(displayPolicy.coverage.deductible)}
                        </span>
                      </div>
                    )}
                    
                    {getCoverageTypes().length > 0 && (
                      <div>
                        <span className="text-sm text-gray-500">Coverage Types</span>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {getCoverageTypes().map((type, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                            >
                              {formatCoverageType(type)}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Premium Information */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Premium Information
                  </h3>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Premium Amount</span>
                      <span className="text-lg font-bold text-blue-600">
                        {safeFormatCurrency(displayPolicy.premium.amount)}
                      </span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Payment Frequency</span>
                      <span className="text-sm font-medium text-gray-900 capitalize">
                        {displayPolicy.premium.frequency || 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Validity Period */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Validity Period
                  </h3>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Start Date</span>
                      <span className="text-sm font-medium text-gray-900">
                        {safeFormatDate(displayPolicy.validity.startDate)}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">End Date</span>
                      <div className="text-right">
                        <span className="text-sm font-medium text-gray-900">
                          {safeFormatDate(displayPolicy.validity.endDate)}
                        </span>
                        {isExpiringSoon(displayPolicy.validity.endDate) && (
                          <div className="text-xs text-orange-600 flex items-center gap-1 mt-1">
                            <AlertTriangle className="h-3 w-3" />
                            Expiring Soon
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                {/* Insurance Agent */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <UserCheck className="h-5 w-5" />
                    Insurance Agent
                  </h3>
                  
                  {displayPolicy.insuranceAgent ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="bg-green-100 p-2 rounded-full">
                          <User className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {displayPolicy.insuranceAgent.firstName} {displayPolicy.insuranceAgent.lastName}
                          </p>
                          <p className="text-xs text-gray-500">
                            Insurance Agent
                          </p>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-600">
                            {displayPolicy.insuranceAgent.email}
                          </span>
                        </div>
                        
                        {displayPolicy.insuranceAgent.phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-600">
                              {displayPolicy.insuranceAgent.phone}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 text-center py-4">
                      No insurance agent assigned
                    </p>
                  )}
                </div>

                {/* Beneficiaries */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Beneficiaries ({displayPolicy.beneficiaries.length})
                  </h3>
                  
                  {displayPolicy.beneficiaries.length > 0 ? (
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      {displayPolicy.beneficiaries.map((beneficiary, index) => (
                        <div key={index} className="flex items-center gap-3 p-3 bg-white rounded">
                          <div className="bg-blue-100 p-2 rounded-full">
                            <User className="h-4 w-4 text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">
                              {beneficiary.firstName} {beneficiary.lastName}
                            </p>
                            <div className="flex items-center gap-4 text-xs text-gray-500">
                              <span>{beneficiary.email}</span>
                              {beneficiary.employeeId && (
                                <span>ID: {beneficiary.employeeId}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 text-center py-4">
                      No beneficiaries added to this policy
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-200 bg-white sticky bottom-0">
            <div className="flex justify-end">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};