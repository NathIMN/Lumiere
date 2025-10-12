// Enhanced BankDetails component with bank-specific account number validation
import React from 'react';
import { CreditCard } from 'lucide-react';

// Bank-specific account number configurations
const BANK_CONFIGS = {
  'Bank of Ceylon': { digits: 10, abbr: 'BOC' },
  'Hatton National Bank': { digits: 12, abbr: 'HNB' },
  'Commercial Bank': { digits: 10, abbr: 'Commercial' },
  'Sampath Bank': { digits: 12, abbr: 'Sampath' },
  'Peoples Bank': { digits: 15, abbr: 'Peoples' },
  'Nations Trust Bank': { digits: 12, abbr: 'NTB' },
  'DFCC Bank': { digits: 12, abbr: 'DFCC' },
  'NDB Bank': { digits: 12, abbr: 'NDB' }
};

const BANK_LIST = [
  { value: '', label: 'Select Bank' },
  { value: 'Bank of Ceylon', label: 'Bank of Ceylon (BOC)' },
  { value: 'Hatton National Bank', label: 'Hatton National Bank (HNB)' },
  { value: 'Commercial Bank', label: 'Commercial Bank' },
  { value: 'Sampath Bank', label: 'Sampath Bank' },
  { value: 'Peoples Bank', label: 'Peoples Bank' },
  { value: 'Nations Trust Bank', label: 'Nations Trust Bank (NTB)' },
  { value: 'DFCC Bank', label: 'DFCC Bank' },
  { value: 'NDB Bank', label: 'NDB Bank' }
];

const handleKeyPress = (e, type) => {
  if (type === 'name') {
    if (!/[a-zA-Z\s]/.test(e.key) && !['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
      e.preventDefault();
    }
  } else if (type === 'accountNumber') {
    if (!/[0-9]/.test(e.key) && !['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
      e.preventDefault();
    }
  }
};

const BankDetails = ({ formData, errors, onChange }) => {
  // Get required digits for selected bank
  const getRequiredDigits = () => {
    if (!formData.bankName || !BANK_CONFIGS[formData.bankName]) {
      return null;
    }
    return BANK_CONFIGS[formData.bankName].digits;
  };

  const requiredDigits = getRequiredDigits();

  // Validate account number based on selected bank
  const validateAccountNumber = () => {
    const accountNumber = formData.accountNumber || '';
    const length = accountNumber.length;

    if (!accountNumber) {
      return {
        color: 'text-gray-500',
        text: requiredDigits 
          ? `Account number must be exactly ${requiredDigits} digits for ${formData.bankName}`
          : 'Please select a bank first'
      };
    }

    if (!formData.bankName) {
      return {
        color: 'text-red-600',
        text: 'Please select a bank first to validate account number'
      };
    }

    if (!/^\d+$/.test(accountNumber)) {
      return {
        color: 'text-red-600',
        text: 'Only digits are allowed'
      };
    }

    if (!requiredDigits) {
      return {
        color: 'text-gray-500',
        text: 'Unknown bank configuration'
      };
    }

    if (length === requiredDigits) {
      return {
        color: 'text-green-600',
        text: `✓ Valid ${formData.bankName} account number (${length} digits)`
      };
    } else if (length < requiredDigits) {
      return {
        color: 'text-yellow-600',
        text: `${length}/${requiredDigits} digits (${requiredDigits - length} more needed for ${formData.bankName})`
      };
    } else {
      return {
        color: 'text-red-600',
        text: `Too long (${length}/${requiredDigits} digits, ${length - requiredDigits} over limit for ${formData.bankName})`
      };
    }
  };

  const accountStatus = validateAccountNumber();

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
          <select
            name="bankName"
            value={formData.bankName || ''}
            onChange={(e) => {
              // Clear account number when bank changes
              const bankChangeEvent = {
                target: {
                  name: 'accountNumber',
                  value: ''
                }
              };
              onChange(bankChangeEvent, 'bankDetails', 'accountNumber');
              onChange(e, 'bankDetails', 'name');
            }}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.bankName ? 'border-red-500' : 'border-gray-300'}`}
          >
            {BANK_LIST.map(bank => (
              <option key={bank.value} value={bank.value}>{bank.label}</option>
            ))}
          </select>
          {errors.bankName && <p className="text-red-500 text-sm mt-1">{errors.bankName}</p>}
          {formData.bankName && requiredDigits && (
            <p className="text-blue-600 text-xs mt-1">
              ℹ Account number must be {requiredDigits} digits
            </p>
          )}
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
            placeholder={requiredDigits ? `Enter ${requiredDigits}-digit account number` : "Select bank first"}
            maxLength={requiredDigits || 20}
            disabled={!formData.bankName}
          />
          <p className={`${accountStatus.color} text-xs mt-1`}>{accountStatus.text}</p>
          {errors.accountNumber && <p className="text-red-500 text-sm mt-1">{errors.accountNumber}</p>}
        </div>
      </div>
    </div>
  );
};

export default BankDetails;