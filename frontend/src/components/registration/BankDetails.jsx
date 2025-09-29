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
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center gap-3 mb-6">
        <CreditCard className="w-5 h-5 text-green-600" />
        <h3 className="text-lg font-semibold text-gray-900">Bank Details</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Account Holder Name *</label>
          <input
            type="text"
            name="accountHolderName"
            value={formData.accountHolderName || ''}
            onChange={(e) => onChange(e, 'bankDetails', 'name')}
            onKeyDown={(e) => handleKeyPress(e, 'name')}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.accountHolderName ? 'border-red-500' : 'border-gray-300'}`}
            placeholder="Enter account holder name"
          />
          {errors.accountHolderName && <p className="text-red-500 text-sm mt-1">{errors.accountHolderName}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Bank Name *</label>
          <input
            type="text"
            name="bankName"
            value={formData.bankName || ''}
            onChange={(e) => onChange(e, 'bankDetails', 'name')}
            onKeyDown={(e) => handleKeyPress(e, 'name')}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.bankName ? 'border-red-500' : 'border-gray-300'}`}
            placeholder="Enter bank name"
          />
          {errors.bankName && <p className="text-red-500 text-sm mt-1">{errors.bankName}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Branch Name *</label>
          <input
            type="text"
            name="branchName"
            value={formData.branchName || ''}
            onChange={(e) => onChange(e, 'bankDetails', 'name')}
            onKeyDown={(e) => handleKeyPress(e, 'name')}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.branchName ? 'border-red-500' : 'border-gray-300'}`}
            placeholder="Enter branch name"
          />
          {errors.branchName && <p className="text-red-500 text-sm mt-1">{errors.branchName}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Account Number *</label>
          <input
            type="text"
            name="accountNumber"
            value={formData.accountNumber || ''}
            onChange={(e) => onChange(e, 'bankDetails', 'accountNumber')}
            onKeyDown={(e) => handleKeyPress(e, 'accountNumber')}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.accountNumber ? 'border-red-500' : 'border-gray-300'}`}
            placeholder="Enter account number (8-20 digits)"
            maxLength="20"
          />
          {(() => {
            const accountNumber = formData.accountNumber || '';
            const length = accountNumber.length;
            const isValid = length >= 8 && length <= 20 && /^\d+$/.test(accountNumber);
            const isInProgress = length > 0 && length < 8;
            
            let statusColor = 'text-gray-500';
            let statusText = 'Account number must be 8-20 digits';
            
            if (isValid) {
              statusColor = 'text-green-600';
              statusText = `✓ Valid account number (${length}/20 digits)`;
            } else if (isInProgress) {
              statusColor = 'text-yellow-600';
              statusText = `${length}/20 digits (minimum 8 required, ${8 - length} more needed)`;
            } else if (length > 20) {
              statusColor = 'text-red-600';
              statusText = `Too long (${length}/20 digits, ${length - 20} over limit)`;
            } else if (length > 0 && !/^\d+$/.test(accountNumber)) {
              statusColor = 'text-red-600';
              statusText = 'Only digits are allowed';
            }
            
            return (
              <p className={`${statusColor} text-xs mt-1`}>{statusText}</p>
            );
          })()}
          {errors.accountNumber && <p className="text-red-500 text-sm mt-1">{errors.accountNumber}</p>}
        </div>
      </div>
    </div>
  );
};

export default BankDetails;