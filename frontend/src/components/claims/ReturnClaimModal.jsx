/* eslint-disable no-undef */
import React, { useState } from 'react';
import { X, ArrowLeft, AlertCircle, MessageSquare } from 'lucide-react';
import insuranceApiService from '../../services/insurance-api';

export const ReturnClaimModal = ({ claim, onClose, onSuccess }) => {
  const [returnReason, setReturnReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [debugInfo, setDebugInfo] = useState('');

  // Predefined return reasons for quick selection
  const predefinedReasons = [
    'Incomplete documentation',
    'Missing required information in questionnaire',
    'Invalid or unclear supporting documents',
    'Claim amount requires justification',
    'Additional medical reports needed',
    'Policy coverage verification required',
    'Inconsistent information provided',
    'Other (please specify in details below)'
  ];

  const validateForm = () => {
    const newErrors = {};

    if (!returnReason.trim()) {
      newErrors.returnReason = 'Return reason is required';
    } else if (returnReason.trim().length < 10) {
      newErrors.returnReason = 'Return reason must be at least 10 characters';
    } else if (returnReason.length > 500) {
      newErrors.returnReason = 'Return reason cannot exceed 500 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setDebugInfo('Starting return process...');

    try {
      // Enhanced debugging
      console.log('=== RETURN CLAIM DEBUG INFO ===');
      console.log('Claim object:', claim);
      console.log('Claim ID:', claim._id);
      console.log('Return reason:', returnReason.trim());
      console.log('API Service:', insuranceApiService);
      
      setDebugInfo('Validating claim data...');
      
      // Validate claim object
      if (!claim || !claim._id) {
        throw new Error('Invalid claim object - missing ID');
      }

      setDebugInfo('Preparing API call...');

      // Check if the returnClaim method exists
      if (!insuranceApiService.returnClaim) {
        throw new Error('returnClaim method not found in insuranceApiService');
      }

      console.log('Calling returnClaim with parameters:');
      console.log('- claimId:', claim._id);
      console.log('- returnReason:', returnReason.trim());
      
      setDebugInfo('Calling API...');

      // Fix: Pass returnReason as string directly, not as object
      const response = await insuranceApiService.returnClaim(claim._id, returnReason.trim());
      
      setDebugInfo('API call successful, processing response...');
      console.log('Return claim API Response:', response);

      // Call success callback
      if (onSuccess && typeof onSuccess === 'function') {
        onSuccess();
      } else {
        console.warn('onSuccess callback is not a function or is missing');
      }

      setDebugInfo('Return process completed successfully');

    } catch (error) {
      console.error('=== RETURN CLAIM ERROR ===');
      console.error('Error object:', error);
      console.error('Error message:', error.message);
      console.error('Error response:', error.response);
      console.error('Error status:', error.response?.status);
      console.error('Error data:', error.response?.data);

      setDebugInfo(`Error: ${error.message}`);

      // Enhanced error handling
      let errorMessage = 'Failed to return claim';
      
      if (error.response) {
        // Server responded with error status
        const status = error.response.status;
        const data = error.response.data;
        
        if (status === 404) {
          errorMessage = 'Claim not found or API endpoint missing';
        } else if (status === 403) {
          errorMessage = 'You do not have permission to return this claim';
        } else if (status === 401) {
          errorMessage = 'Authentication required - please log in again';
        } else if (status === 422) {
          errorMessage = data?.message || 'Invalid data provided';
        } else if (status === 500) {
          errorMessage = 'Server error - please contact system administrator';
        } else if (data?.message) {
          errorMessage = data.message;
        } else {
          errorMessage = `Server error (${status})`;
        }
      } else if (error.request) {
        // Network error
        errorMessage = 'Network error - please check your connection';
      } else {
        // Other error
        errorMessage = error.message || 'Unknown error occurred';
      }

      setErrors({
        submit: errorMessage
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePredefinedReasonClick = (reason) => {
    if (returnReason.includes(reason)) {
      // If reason is already included, don't add it again
      return;
    }
    
    if (returnReason.trim()) {
      setReturnReason(returnReason + '\n\n' + reason);
    } else {
      setReturnReason(reason);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Return Claim to Employee
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Claim ID: {claim?.claimId || 'N/A'} | Employee: {claim?.employeeId?.firstName || 'N/A'} {claim?.employeeId?.lastName || ''}
            </p>
            {/* Debug info for development */}
            {process.env.NODE_ENV === 'development' && debugInfo && (
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                Debug: {debugInfo}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Warning Notice */}
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
              <div>
                <h3 className="font-medium text-yellow-800 dark:text-yellow-200 mb-2">
                  Important Notice
                </h3>
                <p className="text-yellow-700 dark:text-yellow-300 text-sm">
                  Returning this claim will send it back to the employee for corrections or additional information. 
                  The employee will be able to update their submission and resubmit the claim.
                </p>
              </div>
            </div>
          </div>

          {/* Claim Validation Alert */}
          {(!claim || !claim._id) && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5" />
                <div>
                  <h3 className="font-medium text-red-800 dark:text-red-200 mb-2">
                    Invalid Claim Data
                  </h3>
                  <p className="text-red-700 dark:text-red-300 text-sm">
                    The claim data is invalid or missing. Please close this modal and try again.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Quick Reason Selection */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Common Return Reasons
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Click on any reason to add it to your return message:
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {predefinedReasons.map((reason, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handlePredefinedReasonClick(reason)}
                  className="text-left p-3 text-sm border border-gray-200 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-green-300 dark:hover:border-green-600 transition-colors"
                >
                  {reason}
                </button>
              ))}
            </div>
          </div>

          {/* Return Reason Text Area */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              <MessageSquare className="inline h-4 w-4 mr-1" />
              Return Reason *
            </label>
            <textarea
              value={returnReason}
              onChange={(e) => setReturnReason(e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:text-white ${
                errors.returnReason ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
              }`}
              rows="6"
              placeholder="Please provide a clear explanation of why this claim is being returned to the employee. Be specific about what needs to be corrected or what additional information is required..."
              maxLength={500}
            />
            <div className="flex justify-between text-sm">
              <span>
                {errors.returnReason && (
                  <span className="text-red-600 dark:text-red-400">{errors.returnReason}</span>
                )}
              </span>
              <span className={`${returnReason.length > 450 ? 'text-orange-600 dark:text-orange-400' : 'text-gray-500 dark:text-gray-400'}`}>
                {returnReason.length}/500 characters
              </span>
            </div>
          </div>

          {/* Additional Guidelines */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">
              Guidelines for Return Reasons
            </h4>
            <ul className="text-blue-700 dark:text-blue-300 text-sm space-y-1">
              <li>• Be specific about what needs to be corrected</li>
              <li>• Reference specific questions or documents if applicable</li>
              <li>• Provide clear instructions on what the employee should do</li>
              <li>• Be professional and constructive in your feedback</li>
            </ul>
          </div>

          {/* Submit Error */}
          {errors.submit && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-3">
              <div className="flex items-center">
                <AlertCircle className="h-4 w-4 text-red-400 mr-2" />
                <span className="text-red-800 dark:text-red-200 text-sm">{errors.submit}</span>
              </div>
            </div>
          )}

          {/* Debug Information for Development */}
          {process.env.NODE_ENV === 'development' && (
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-2">
                Debug Information (Development Only)
              </h4>
              <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                <p>Claim ID: {claim?._id || 'Missing'}</p>
                <p>Claim Object: {claim ? 'Present' : 'Missing'}</p>
                <p>API Service: {insuranceApiService ? 'Loaded' : 'Missing'}</p>
                <p>Return Method: {insuranceApiService?.returnClaim ? 'Available' : 'Missing'}</p>
                <p>onSuccess Callback: {typeof onSuccess === 'function' ? 'Valid' : 'Invalid'}</p>
                <p>Return Reason Length: {returnReason.trim().length}</p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            
            <button
              type="submit"
              disabled={isSubmitting || !claim || !claim._id}
              className="flex items-center space-x-2 px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 dark:bg-orange-700 dark:hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Returning...</span>
                </>
              ) : (
                <>
                  <ArrowLeft className="h-4 w-4" />
                  <span>Return to Employee</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};