import React from 'react';
import { CreditCard } from 'lucide-react';

const handleKeyPress = (e, type) => {
  if (type === 'name') {
    // Allow letters, space, backspace, delete, tab, escape, enter, arrow keys
    if (!/[a-zA-Z\s]/.test(e.key) && !['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
      e.preventDefault();
    }
  } else if (type === 'accountNumber') {
    // Allow numbers, backspace, delete, tab, escape, enter, arrow keys
    if (!/[0-9]/.test(e.key) && !['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
      e.preventDefault();
    }
  }
};

const BankDetails = ({ formData, errors, onChange }) => {
  const handleAccountNumberChange = (e) => {
    const { value } = e.target;
    
    // Only allow numbers
    if (!/^\d*$/.test(value)) {
      return;
    }

    onChange(e, 'bankDetails', 'accountNumber');

    // Show validation message immediately
    if (value.length > 0 && value.length < 8) {
      e.target.setCustomValidity('Account number must be at least 8 digits');
    } else if (value.length > 20) {
      e.target.setCustomValidity('Account number cannot exceed 20 digits');
    } else {
      e.target.setCustomValidity('');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center mb-6">
        <CreditCard className="w-6 h-6 text-blue-600 mr-3" />
        <h3 className="text-lg font-semibold text-gray-900">Bank Details</h3>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Account Holder Name *
          </label>
          <input
            type="text"
            name="accountHolderName"
            value={formData.accountHolderName || ''}
            onChange={(e) => onChange(e, 'bankDetails', 'name')}
            onKeyDown={(e) => handleKeyPress(e, 'name')}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.accountHolderName ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Enter account holder name"
          />
          {errors.accountHolderName && (
            <p className="text-red-500 text-sm mt-1">{errors.accountHolderName}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Bank Name *
          </label>
          <input
            type="text"
            name="bankName"
            value={formData.bankName || ''}
            onChange={(e) => onChange(e, 'bankDetails', 'name')}
            onKeyDown={(e) => handleKeyPress(e, 'name')}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.bankName ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Enter bank name"
          />
          {errors.bankName && (
            <p className="text-red-500 text-sm mt-1">{errors.bankName}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Branch Name *
          </label>
          <input
            type="text"
            name="branchName"
            value={formData.branchName || ''}
            onChange={(e) => onChange(e, 'bankDetails', 'name')}
            onKeyDown={(e) => handleKeyPress(e, 'name')}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.branchName ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Enter branch name"
          />
          {errors.branchName && (
            <p className="text-red-500 text-sm mt-1">{errors.branchName}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Account Number *
          </label>
          <input
            type="text"
            name="accountNumber"
            value={formData.accountNumber || ''}
            onChange={handleAccountNumberChange}
            onKeyDown={(e) => handleKeyPress(e, 'accountNumber')}
            minLength={8}
            maxLength={20}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.accountNumber ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Enter account number (8-20 digits)"
          />
          {errors.accountNumber && (
            <p className="text-red-500 text-sm mt-1">{errors.accountNumber}</p>
          )}
          {formData.accountNumber && formData.accountNumber.length > 0 && formData.accountNumber.length < 8 && (
            <p className="text-orange-500 text-sm mt-1">
              Account number must be at least 8 digits
            </p>
          )}
          <p className="text-gray-500 text-sm mt-1">
            Account number must be between 8 and 20 digits
          </p>
        </div>
      </div>
    </div>
  );
};

export default BankDetails;