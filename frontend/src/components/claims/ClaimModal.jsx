import React from 'react';
import { 
  X, 
  User, 
  FileText, 
  DollarSign, 
  Calendar, 
  Shield,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  XCircle,
  Clock,
  Download
} from 'lucide-react';

export const ClaimModal = ({ claim, onClose, onForward, onReturn }) => {
  if (!claim) return null;

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    if (!amount) return '$0';
    return `$${amount.toLocaleString()}`;
  };

  const getStatusColor = (status) => {
    const colorMap = {
      hr: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      insurer: 'bg-blue-100 text-blue-800 border-blue-200',
      approved: 'bg-green-100 text-green-800 border-green-200',
      rejected: 'bg-red-100 text-red-800 border-red-200',
      employee: 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return colorMap[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getStatusText = (status) => {
    const statusMap = {
      hr: 'Pending HR Review',
      insurer: 'With Insurer',
      approved: 'Approved',
      rejected: 'Rejected',
      employee: 'With Employee'
    };
    return statusMap[status] || status;
  };

  const canTakeAction = claim.claimStatus === 'hr';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Claim Details
            </h2>
            <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(claim.claimStatus)}`}>
              {getStatusText(claim.claimStatus)}
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 space-y-8">
          {/* Basic Claim Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
                Claim Information
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <FileText className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Claim ID</p>
                    <p className="font-medium text-gray-900 dark:text-white">{claim.claimId}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Shield className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Claim Type</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {claim.claimType === 'life' ? 'Life Insurance' : 'Vehicle Insurance'}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Option: {claim.claimType === 'life' ? claim.lifeClaimOption : claim.vehicleClaimOption}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <DollarSign className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Requested Amount</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {formatCurrency(claim.claimAmount?.requested)}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Calendar className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Submitted Date</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {formatDate(claim.submittedAt)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
                Employee Information
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <User className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Employee Name</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {claim.employeeId?.firstName} {claim.employeeId?.lastName}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="h-5 w-5" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Email</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {claim.employeeId?.email}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="h-5 w-5" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Department</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {claim.employeeId?.department || 'Not specified'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Policy Information */}
          {claim.policy && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
                Policy Information
              </h3>
              
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Policy Number</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {claim.policy.policyNumber}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Policy Type</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {claim.policy.policyType}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Provider</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {claim.policy.provider}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Questionnaire Responses */}
          {claim.questionnaire && claim.questionnaire.responses && claim.questionnaire.responses.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
                Questionnaire Responses
              </h3>
              
              <div className="space-y-4 max-h-60 overflow-y-auto">
                {claim.questionnaire.responses
                  .filter(response => response.isAnswered)
                  .map((response, index) => (
                    <div key={index} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                      <p className="font-medium text-gray-900 dark:text-white mb-2">
                        {response.questionText}
                      </p>
                      <p className="text-gray-600 dark:text-gray-300">
                        {response.answer.textValue || 
                         response.answer.numberValue || 
                         response.answer.booleanValue?.toString() ||
                         response.answer.selectValue ||
                         response.answer.multiselectValue?.join(', ') ||
                         (response.answer.dateValue && formatDate(response.answer.dateValue)) ||
                         'File uploaded'}
                      </p>
                    </div>
                  ))
                }
              </div>
            </div>
          )}

          {/* Documents */}
          {claim.documents && claim.documents.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
                Supporting Documents
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {claim.documents.map((doc, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <div className="flex items-center space-x-3">
                      <FileText className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {doc.originalName || doc.filename}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {formatDate(doc.uploadedAt)}
                        </p>
                      </div>
                    </div>
                    <button className="text-green-600 hover:text-green-700 dark:text-green-400">
                      <Download className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Return Reason (if applicable) */}
          {claim.returnReason && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
                Return Reason
              </h3>
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                <p className="text-yellow-800 dark:text-yellow-200">
                  {claim.returnReason}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        {canTakeAction && (
          <div className="flex items-center justify-end space-x-4 p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
            <button
              onClick={onReturn}
              className="flex items-center space-x-2 px-4 py-2 border border-orange-300 text-orange-700 rounded-md hover:bg-orange-50 dark:border-orange-600 dark:text-orange-400 dark:hover:bg-orange-900/20"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Return to Employee</span>
            </button>
            
            <button
              onClick={onForward}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600"
            >
              <ArrowRight className="h-4 w-4" />
              <span>Forward to Insurer</span>
            </button>
          </div>
        )}
        
        {!canTakeAction && (
          <div className="flex items-center justify-end space-x-4 p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
};