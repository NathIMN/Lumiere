/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import {
  X,
  Eye,
  Calendar,
  DollarSign,
  Shield,
  Users,
  FileText,
  User,
  Mail,
  Phone,
  Building,
  Clock,
  CheckCircle,
  AlertCircle,
  Info,
  CreditCard,
  Tag,
} from "lucide-react";

export const PolicyDetailsModal = ({ isOpen, onClose, policy, loading = false }) => {
  if (!isOpen) return null;

  console.log('PolicyDetailsModal - Policy data:', policy);
  console.log('PolicyDetailsModal - Loading state:', loading);

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  // Format date
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Get status color and icon
  const getStatusDisplay = (status) => {
    const statusConfig = {
      active: {
        color: 'bg-green-100 text-green-800 border-green-200',
        icon: CheckCircle,
        label: 'Active'
      },
      expired: {
        color: 'bg-red-100 text-red-800 border-red-200',
        icon: AlertCircle,
        label: 'Expired'
      },
      cancelled: {
        color: 'bg-gray-100 text-gray-800 border-gray-200',
        icon: X,
        label: 'Cancelled'
      },
      suspended: {
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        icon: AlertCircle,
        label: 'Suspended'
      },
      pending: {
        color: 'bg-blue-100 text-blue-800 border-blue-200',
        icon: Clock,
        label: 'Pending'
      }
    };

    return statusConfig[status] || statusConfig.pending;
  };

  // Get policy type display
  const getPolicyTypeDisplay = (type) => {
    return {
      life: {
        label: 'Life Insurance',
        color: 'bg-blue-50 text-blue-700 border-blue-200',
        icon: Shield
      },
      vehicle: {
        label: 'Vehicle Insurance',
        color: 'bg-purple-50 text-purple-700 border-purple-200',
        icon: Shield
      }
    }[type] || { label: type, color: 'bg-gray-50 text-gray-700 border-gray-200', icon: Shield };
  };

  const statusDisplay = getStatusDisplay(policy?.status);
  const StatusIcon = statusDisplay.icon;
  const policyTypeDisplay = getPolicyTypeDisplay(policy?.policyType);
  const PolicyTypeIcon = policyTypeDisplay.icon;

  // Calculate days until expiry
  const getDaysUntilExpiry = () => {
    if (!policy?.validity?.endDate) return null;
    const endDate = new Date(policy.validity.endDate);
    const today = new Date();
    const diffTime = endDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysUntilExpiry = getDaysUntilExpiry();

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-6xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <Eye className="h-6 w-6 text-blue-600" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Policy Details
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {policy?.policyId}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-6">
              <div className="animate-pulse space-y-6">
                <div className="h-4 bg-gray-300 rounded w-1/4"></div>
                <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                <div className="h-4 bg-gray-300 rounded w-1/3"></div>
              </div>
            </div>
          ) : (
            <div className="p-6 space-y-6">
              {/* Policy Overview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Status Card */}
                <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-700 dark:to-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-600">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</h3>
                    <StatusIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${statusDisplay.color}`}>
                    <StatusIcon className="h-4 w-4 mr-1" />
                    {statusDisplay.label}
                  </div>
                  {daysUntilExpiry !== null && (
                    <p className="text-xs text-gray-500 mt-2">
                      {daysUntilExpiry > 0 
                        ? `Expires in ${daysUntilExpiry} days`
                        : daysUntilExpiry === 0 
                        ? 'Expires today'
                        : `Expired ${Math.abs(daysUntilExpiry)} days ago`
                      }
                    </p>
                  )}
                </div>

                {/* Policy Type Card */}
                <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-700 dark:to-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-600">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Policy Type</h3>
                    <PolicyTypeIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${policyTypeDisplay.color}`}>
                    <PolicyTypeIcon className="h-4 w-4 mr-1" />
                    {policyTypeDisplay.label}
                  </div>
                  <p className="text-xs text-gray-500 mt-2 capitalize">
                    {policy?.policyCategory} policy
                  </p>
                </div>

                {/* Coverage Card */}
                <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-700 dark:to-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-600">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Coverage</h3>
                    <DollarSign className="h-5 w-5 text-gray-400" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {formatCurrency(policy?.coverage?.coverageAmount || 0)}
                  </div>
                  {policy?.coverage?.deductible > 0 && (
                    <p className="text-xs text-gray-500 mt-1">
                      Deductible: {formatCurrency(policy.coverage.deductible)}
                    </p>
                  )}
                </div>
              </div>

              {/* Basic Information */}
              <div className="bg-white dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-600">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <Info className="h-5 w-5 text-blue-600" />
                    Basic Information
                  </h3>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                        Policy ID
                      </label>
                      <p className="text-sm font-mono bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                        {policy?.policyId}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                        Start Date
                      </label>
                      <p className="text-sm text-gray-900 dark:text-white">
                        {policy?.validity?.startDate ? formatDate(policy.validity.startDate) : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                        End Date
                      </label>
                      <p className="text-sm text-gray-900 dark:text-white">
                        {policy?.validity?.endDate ? formatDate(policy.validity.endDate) : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                        Premium Amount
                      </label>
                      <p className="text-sm text-gray-900 dark:text-white">
                        {formatCurrency(policy?.premium?.amount || 0)}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                        Premium Frequency
                      </label>
                      <p className="text-sm text-gray-900 dark:text-white capitalize">
                        {policy?.premium?.frequency || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                        Created On
                      </label>
                      <p className="text-sm text-gray-900 dark:text-white">
                        {policy?.createdAt ? formatDate(policy.createdAt) : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Insurance Agent */}
              {policy?.insuranceAgent && (
                <div className="bg-white dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600">
                  <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-600">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                      <User className="h-5 w-5 text-blue-600" />
                      Insurance Agent
                    </h3>
                  </div>
                  <div className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                        <User className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 dark:text-white">
                          {policy.insuranceAgent.profile?.firstName || policy.insuranceAgent.firstName || 'N/A'}{' '}
                          {policy.insuranceAgent.profile?.lastName || policy.insuranceAgent.lastName || ''}
                        </h4>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                          {policy.insuranceAgent.email && (
                            <div className="flex items-center gap-1">
                              <Mail className="h-4 w-4" />
                              {policy.insuranceAgent.email}
                            </div>
                          )}
                          {(policy.insuranceAgent.profile?.phoneNumber || policy.insuranceAgent.phone) && (
                            <div className="flex items-center gap-1">
                              <Phone className="h-4 w-4" />
                              {policy.insuranceAgent.profile?.phoneNumber || policy.insuranceAgent.phone}
                            </div>
                          )}
                        </div>
                        {policy.insuranceAgent.employment?.department && (
                          <div className="flex items-center gap-1 mt-1 text-xs text-gray-400">
                            <Building className="h-3 w-3" />
                            {policy.insuranceAgent.employment.department}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Coverage Details */}
              {policy?.coverage && (
                <div className="bg-white dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600">
                  <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-600">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                      <Shield className="h-5 w-5 text-blue-600" />
                      Coverage Details
                    </h3>
                  </div>
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                          Coverage Amount
                        </label>
                        <p className="text-xl font-semibold text-gray-900 dark:text-white">
                          {formatCurrency(policy.coverage.coverageAmount)}
                        </p>
                      </div>
                      {policy.coverage.deductible > 0 && (
                        <div>
                          <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                            Deductible
                          </label>
                          <p className="text-xl font-semibold text-gray-900 dark:text-white">
                            {formatCurrency(policy.coverage.deductible)}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Coverage Types */}
                    {(policy.coverage.typeLife?.length > 0 || policy.coverage.typeVehicle?.length > 0) && (
                      <div className="mt-6">
                        <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                          Coverage Types
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {policy.coverage.typeLife?.map((type, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                            >
                              <Tag className="h-3 w-3 mr-1" />
                              {type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </span>
                          ))}
                          {policy.coverage.typeVehicle?.map((type, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
                            >
                              <Tag className="h-3 w-3 mr-1" />
                              {type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Coverage Details */}
                    {policy.coverage.coverageDetails?.length > 0 && (
                      <div className="mt-6">
                        <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                          Detailed Coverage
                        </label>
                        <div className="space-y-3">
                          {policy.coverage.coverageDetails.map((detail, index) => (
                            <div
                              key={index}
                              className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-600"
                            >
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <h5 className="font-medium text-gray-900 dark:text-white">
                                    {detail.type?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                  </h5>
                                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                                    {detail.description}
                                  </p>
                                </div>
                                <div className="text-right ml-4">
                                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                                    {formatCurrency(detail.limit)}
                                  </p>
                                  <p className="text-xs text-gray-500">limit</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Beneficiaries */}
              {policy?.beneficiaries?.length > 0 && (
                <div className="bg-white dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600">
                  <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-600">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                      <Users className="h-5 w-5 text-blue-600" />
                      Beneficiaries ({policy.beneficiaries.length})
                    </h3>
                  </div>
                  <div className="p-6">
                    <div className="space-y-4">
                      {policy.beneficiaries.map((beneficiary, index) => (
                        <div
                          key={beneficiary._id || beneficiary.id || index}
                          className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600"
                        >
                          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                            <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900 dark:text-white">
                              {beneficiary.profile?.firstName || beneficiary.firstName || 'N/A'}{' '}
                              {beneficiary.profile?.lastName || beneficiary.lastName || ''}
                            </h4>
                            <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                              {beneficiary.email && (
                                <div className="flex items-center gap-1">
                                  <Mail className="h-3 w-3" />
                                  {beneficiary.email}
                                </div>
                              )}
                              {(beneficiary.profile?.phoneNumber || beneficiary.phone) && (
                                <div className="flex items-center gap-1">
                                  <Phone className="h-3 w-3" />
                                  {beneficiary.profile?.phoneNumber || beneficiary.phone}
                                </div>
                              )}
                            </div>
                            <div className="text-xs text-gray-400 mt-1">
                              Employee ID: {beneficiary.userId || beneficiary.employeeId || 'N/A'}
                              {beneficiary.employment?.department && (
                                <span> • {beneficiary.employment.department}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Notes */}
              {policy?.notes && (
                <div className="bg-white dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600">
                  <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-600">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                      <FileText className="h-5 w-5 text-blue-600" />
                      Notes
                    </h3>
                  </div>
                  <div className="p-6">
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                      <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                        {policy.notes}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};