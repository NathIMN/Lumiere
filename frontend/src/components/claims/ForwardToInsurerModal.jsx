import React, { useState } from 'react';
import { X, Plus, Minus, DollarSign, AlertCircle, ArrowRight } from 'lucide-react';
import { claimService } from '../../services/claimService';

export const ForwardToInsurerModal = ({ claim, onClose, onSuccess }) => {
  const [coverageBreakdown, setCoverageBreakdown] = useState([
    { coverageType: '', requestedAmount: '', notes: '' }
  ]);
  const [hrNotes, setHrNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  // Predefined coverage types based on claim type
  const getCoverageTypes = () => {
    if (claim.claimType === 'life') {
      return {
        'Medical Expenses': 'Medical Expenses',
        'Hospitalization': 'Hospitalization',
        'Medication': 'Medication',
        'Channeling': 'Channeling',
        'Death Benefit': 'Death Benefit',
        'Disability Benefit': 'Disability Benefit'
      };
    } else {
      return {
        'Vehicle Repair': 'Vehicle Repair',
        'Vehicle Replacement': 'Vehicle Replacement',
        'Third Party Damage': 'Third Party Damage',
        'Personal Injury': 'Personal Injury',
        'Towing': 'Towing',
        'Rental Car': 'Rental Car'
      };
    }
  };

  const coverageTypes = getCoverageTypes();

  const addCoverageItem = () => {
    setCoverageBreakdown([...coverageBreakdown, { coverageType: '', requestedAmount: '', notes: '' }]);
  };

  const removeCoverageItem = (index) => {
    if (coverageBreakdown.length > 1) {
      const newBreakdown = coverageBreakdown.filter((_, i) => i !== index);
      setCoverageBreakdown(newBreakdown);
    }
  };

  const updateCoverageItem = (index, field, value) => {
    const newBreakdown = [...coverageBreakdown];
    newBreakdown[index][field] = value;
    setCoverageBreakdown(newBreakdown);
  };

  const validateForm = () => {
    const newErrors = {};

    // Validate coverage breakdown
    coverageBreakdown.forEach((item, index) => {
      if (!item.coverageType) {
        newErrors[`coverage_${index}_type`] = 'Coverage type is required';
      }
      if (!item.requestedAmount || item.requestedAmount <= 0) {
        newErrors[`coverage_${index}_amount`] = 'Valid amount is required';
      }
    });

    // Calculate total and validate against claim amount
    const totalRequested = coverageBreakdown.reduce((sum, item) => sum + (parseFloat(item.requestedAmount) || 0), 0);
    const claimAmount = claim.claimAmount?.requested || 0;

    if (totalRequested > claimAmount) {
      newErrors.total = `Total breakdown (${totalRequested.toLocaleString()}) cannot exceed claimed amount (${claimAmount.toLocaleString()})`;
    }

    if (totalRequested === 0) {
      newErrors.total = 'At least one coverage item with valid amount is required';
    }

    // Validate HR notes length
    if (hrNotes.length > 1000) {
      newErrors.hrNotes = 'HR notes cannot exceed 1000 characters';
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

    try {
      const payload = {
        coverageBreakdown: coverageBreakdown.map(item => ({
          coverageType: item.coverageType,
          requestedAmount: parseFloat(item.requestedAmount),
          notes: item.notes.trim()
        })),
        hrNotes: hrNotes.trim()
      };

      await claimService.forwardToInsurer(claim._id, payload);
      onSuccess();
    } catch (error) {
      setErrors({
        submit: error.response?.data?.message || 'Failed to forward claim to insurer'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const calculateTotal = () => {
    return coverageBreakdown.reduce((sum, item) => sum + (parseFloat(item.requestedAmount) || 0), 0);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Forward Claim to Insurer
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Claim ID: {claim.claimId} | Requested: ${claim.claimAmount?.requested?.toLocaleString()}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Coverage Breakdown Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Coverage Breakdown *
              </h3>
              <button
                type="button"
                onClick={addCoverageItem}
                className="flex items-center space-x-2 text-green-600 hover:text-green-700 dark:text-green-400 text-sm"
              >
                <Plus className="h-4 w-4" />
                <span>Add Coverage Item</span>
              </button>
            </div>

            {errors.total && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-3">
                <div className="flex items-center">
                  <AlertCircle className="h-4 w-4 text-red-400 mr-2" />
                  <span className="text-red-800 dark:text-red-200 text-sm">{errors.total}</span>
                </div>
              </div>
            )}

            <div className="space-y-4">
              {coverageBreakdown.map((item, index) => (
                <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Coverage Type */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Coverage Type *
                      </label>
                      <select
                        value={item.coverageType}
                        onChange={(e) => updateCoverageItem(index, 'coverageType', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white ${
                          errors[`coverage_${index}_type`] 
                            ? 'border-red-300 dark:border-red-600' 
                            : 'border-gray-300 dark:border-gray-600'
                        }`}
                      >
                        <option value="">Select coverage type</option>
                        {Object.entries(coverageTypes).map(([key, label]) => (
                          <option key={key} value={key}>{label}</option>
                        ))}
                      </select>
                      {errors[`coverage_${index}_type`] && (
                        <p className="text-red-600 dark:text-red-400 text-sm mt-1">
                          {errors[`coverage_${index}_type`]}
                        </p>
                      )}
                    </div>

                    {/* Requested Amount */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Requested Amount *
                      </label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.requestedAmount}
                          onChange={(e) => updateCoverageItem(index, 'requestedAmount', e.target.value)}
                          className={`w-full pl-10 pr-3 py-2 border rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white ${
                            errors[`coverage_${index}_amount`] 
                              ? 'border-red-300 dark:border-red-600' 
                              : 'border-gray-300 dark:border-gray-600'
                          }`}
                          placeholder="0.00"
                        />
                      </div>
                      {errors[`coverage_${index}_amount`] && (
                        <p className="text-red-600 dark:text-red-400 text-sm mt-1">
                          {errors[`coverage_${index}_amount`]}
                        </p>
                      )}
                    </div>

                    {/* Remove Button */}
                    <div className="flex items-end">
                      {coverageBreakdown.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeCoverageItem(index)}
                          className="w-full px-3 py-2 text-red-600 hover:text-red-700 dark:text-red-400 border border-red-300 dark:border-red-600 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20"
                        >
                          <Minus className="h-4 w-4 mx-auto" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Notes for this coverage item */}
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Coverage Notes
                    </label>
                    <textarea
                      value={item.notes}
                      onChange={(e) => updateCoverageItem(index, 'notes', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
                      rows="2"
                      placeholder="Additional notes for this coverage item..."
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Total Summary */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-900 dark:text-white">
                  Total Breakdown Amount:
                </span>
                <span className="text-xl font-bold text-gray-900 dark:text-white">
                  ${calculateTotal().toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center mt-2 text-sm">
                <span className="text-gray-600 dark:text-gray-400">
                  Original Claim Amount:
                </span>
                <span className="text-gray-600 dark:text-gray-400">
                  ${claim.claimAmount?.requested?.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* HR Notes */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              HR Notes
            </label>
            <textarea
              value={hrNotes}
              onChange={(e) => setHrNotes(e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white ${
                errors.hrNotes ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
              }`}
              rows="4"
              placeholder="Add any additional notes or comments for the insurer..."
              maxLength={1000}
            />
            <div className="flex justify-between text-sm">
              <span>
                {errors.hrNotes && (
                  <span className="text-red-600 dark:text-red-400">{errors.hrNotes}</span>
                )}
              </span>
              <span className="text-gray-500 dark:text-gray-400">
                {hrNotes.length}/1000 characters
              </span>
            </div>
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
              disabled={isSubmitting}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Forwarding...</span>
                </>
              ) : (
                <>
                  <ArrowRight className="h-4 w-4" />
                  <span>Forward to Insurer</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};