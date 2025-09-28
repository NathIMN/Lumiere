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
  FileText,
  Download,
  Heart,
  Car,
  Building,
  UserCheck,
  AlertTriangle,
  CheckCircle2,
  Clock,
  MapPin
} from 'lucide-react';
import { formatDate, formatCurrency } from '../../utils/policyFormatters';

export const PolicyDetailsModal = ({ policy, isOpen, onClose }) => {
  if (!isOpen || !policy) return null;

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
      case 'active': return <CheckCircle2 className="h-5 w-5" />;
      case 'expired': return <X className="h-5 w-5" />;
      case 'suspended': return <AlertTriangle className="h-5 w-5" />;
      case 'cancelled': return <X className="h-5 w-5" />;
      case 'pending': return <Clock className="h-5 w-5" />;
      default: return <Clock className="h-5 w-5" />;
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'life': return <Heart className="h-6 w-6 text-red-500" />;
      case 'vehicle': return <Car className="h-6 w-6 text-blue-500" />;
      default: return <Shield className="h-6 w-6 text-gray-500" />;
    }
  };

  const getCoverageTypes = () => {
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
    const today = new Date();
    const expiry = new Date(endDate);
    const daysDiff = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
    return daysDiff <= 30 && daysDiff > 0;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen p-4 text-center sm:block sm:p-0">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
        ></div>

        {/* Modal */}
        <div className="inline-block w-full max-w-4xl my-8 overflow-hidden text-left align-middle transition-all transform bg-white dark:bg-gray-800 shadow-xl rounded-lg">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              {getTypeIcon(policy.policyType)}
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  
                  Policy Details - {policy.policyId}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {policy.policyType === 'life' ? 'Life Insurance' : 'Vehicle Insurance'} • {policy.policyCategory === 'individual' ? 'Individual' : 'Group'} Policy
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Content */}
          <div className="max-h-96 overflow-y-auto p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Policy Overview */}
              <div className="space-y-6">
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Policy Overview
                  </h3>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Status</span>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(policy.status)}`}>
                        {getStatusIcon(policy.status)}
                        <span className="ml-1 capitalize">{policy.status}</span>
                      </span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Policy Type</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                        {policy.policyType} Insurance
                      </span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Category</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                        {policy.policyCategory}
                      </span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Created</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {formatDate(policy.createdAt)}
                      </span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Last Updated</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {formatDate(policy.updatedAt)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Coverage Details */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Coverage Details
                  </h3>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Coverage Amount</span>
                      <span className="text-lg font-bold text-green-600 dark:text-green-400">
                        {console.log("qoudg ",policy.coverage)}
                        {formatCurrency(policy.coverage.coverageAmount)}
                      </span>
                    </div>
                    
                    {policy.coverage.deductible > 0 && (
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500 dark:text-gray-400">Deductible</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {formatCurrency(policy.coverage.deductible)}
                        </span>
                      </div>
                    )}
                    
                    {/* Coverage Types */}
                    <div>
                      <span className="text-sm text-gray-500 dark:text-gray-400">Coverage Types</span>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {getCoverageTypes().map((type, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                          >
                            {formatCoverageType(type)}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Coverage Details */}
                    {policy.coverage.coverageDetails && policy.coverage.coverageDetails.length > 0 && (
                      <div>
                        <span className="text-sm text-gray-500 dark:text-gray-400">Detailed Coverage</span>
                        <div className="mt-2 space-y-2">
                          {policy.coverage.coverageDetails.map((detail, index) => (
                            <div key={index} className="bg-white dark:bg-gray-600 rounded p-2">
                              <div className="flex justify-between items-start">
                                <div>
                                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                                    {detail.type}
                                  </p>
                                  <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {detail.description}
                                  </p>
                                </div>
                                <span className="text-sm font-medium text-green-600 dark:text-green-400">
                                  {formatCurrency(detail.limit)}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Premium Information */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Premium Information
                  </h3>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Premium Amount</span>
                      <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                        {formatCurrency(policy.premium.amount)}
                      </span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Payment Frequency</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                        {policy.premium.frequency}
                      </span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Annual Premium</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {formatCurrency(
                          policy.premium.amount * 
                          (policy.premium.frequency === 'monthly' ? 12 :
                           policy.premium.frequency === 'quarterly' ? 4 :
                           policy.premium.frequency === 'semi-annual' ? 2 : 1)
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Validity Period */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Validity Period
                  </h3>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Start Date</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {formatDate(policy.validity.startDate)}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500 dark:text-gray-400">End Date</span>
                      <div className="text-right">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {formatDate(policy.validity.endDate)}
                        </span>
                        {isExpiringSoon(policy.validity.endDate) && (
                          <div className="text-xs text-orange-600 dark:text-orange-400 flex items-center gap-1 mt-1">
                            <AlertTriangle className="h-3 w-3" />
                            Expiring Soon
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Duration</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {Math.ceil((new Date(policy.validity.endDate) - new Date(policy.validity.startDate)) / (1000 * 60 * 60 * 24))} days
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                {/* Insurance Agent */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <UserCheck className="h-5 w-5" />
                    Insurance Agent
                  </h3>
                  
                  {policy.insuranceAgent && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="bg-green-100 dark:bg-green-900 p-2 rounded-full">
                          <User className="h-5 w-5 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {policy.insuranceAgent.firstName} {policy.insuranceAgent.lastName}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Insurance Agent
                          </p>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {policy.insuranceAgent.email}
                          </span>
                        </div>
                        
                        {policy.insuranceAgent.phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              {policy.insuranceAgent.phone}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Beneficiaries */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Beneficiaries ({policy.beneficiaries?.length || 0})
                  </h3>
                  
                  {policy.beneficiaries && policy.beneficiaries.length > 0 ? (
                    <div className="space-y-3 max-h-48 overflow-y-auto">
                      {policy.beneficiaries.map((beneficiary, index) => (
                        <div key={index} className="flex items-center gap-3 p-3 bg-white dark:bg-gray-600 rounded">
                          <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-full">
                            <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {beneficiary.firstName} {beneficiary.lastName}
                            </p>
                            <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                              <span>{beneficiary.email}</span>
                              {beneficiary.employeeId && (
                                <span>ID: {beneficiary.employeeId}</span>
                              )}
                            </div>
                            {beneficiary.employment && (
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {beneficiary.employment.position} - {beneficiary.employment.department}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                      No beneficiaries added to this policy
                    </p>
                  )}
                </div>

                {/* Documents */}
                {policy.documents && policy.documents.length > 0 && (
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Documents ({policy.documents.length})
                    </h3>
                    
                    <div className="space-y-2">
                      {policy.documents.map((document, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-white dark:bg-gray-600 rounded">
                          <div className="flex items-center gap-3">
                            <FileText className="h-4 w-4 text-gray-400" />
                            <div>
                              <p className="text-sm font-medium text-gray-900 dark:text-white">
                                {document.fileName}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {document.fileType} • {formatDate(document.uploadDate)}
                              </p>
                            </div>
                          </div>
                          <button className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-200">
                            <Download className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Notes */}
                {policy.notes && (
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Notes
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                      {policy.notes}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};