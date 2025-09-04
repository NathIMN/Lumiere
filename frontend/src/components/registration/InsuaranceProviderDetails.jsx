import React from 'react';
import { Shield } from 'lucide-react';

const handleKeyPress = (e, type) => {
  if (type === 'phone') {
    // Allow numbers, backspace, delete, tab, escape, enter, arrow keys
    if (!/[0-9]/.test(e.key) && !['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
      e.preventDefault();
    }
  }
};

const InsuranceProviderDetails = ({ formData, errors, onChange }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center gap-3 mb-6">
        <Shield className="w-5 h-5 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-900">Insurance Provider Details</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Company Name *</label>
          <input
            type="text"
            name="companyName"
            value={formData.companyName}
            onChange={(e) => onChange(e, 'insuranceProvider')}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.companyName ? 'border-red-500' : 'border-gray-300'}`}
            placeholder="Enter company name"
          />
          {errors.companyName && <p className="text-red-500 text-sm mt-1">{errors.companyName}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Agent ID *</label>
          <input
            type="text"
            name="agentId"
            value={formData.agentId}
            onChange={(e) => onChange(e, 'insuranceProvider')}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.agentId ? 'border-red-500' : 'border-gray-300'}`}
            placeholder="Enter agent ID"
          />
          {errors.agentId && <p className="text-red-500 text-sm mt-1">{errors.agentId}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">License Number *</label>
          <input
            type="text"
            name="licenseNumber"
            value={formData.licenseNumber}
            onChange={(e) => onChange(e, 'insuranceProvider')}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.licenseNumber ? 'border-red-500' : 'border-gray-300'}`}
            placeholder="Enter license number"
          />
          {errors.licenseNumber && <p className="text-red-500 text-sm mt-1">{errors.licenseNumber}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Contact Email *</label>
          <input
            type="email"
            name="contactEmail"
            value={formData.contactEmail}
            onChange={(e) => onChange(e, 'insuranceProvider')}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.contactEmail ? 'border-red-500' : 'border-gray-300'}`}
            placeholder="Enter contact email"
          />
          {errors.contactEmail && <p className="text-red-500 text-sm mt-1">{errors.contactEmail}</p>}
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">Contact Phone *</label>
          <input
            type="tel"
            name="contactPhone"
            value={formData.contactPhone}
            onChange={(e) => onChange(e, 'insuranceProvider', 'phone')}
            onKeyDown={(e) => handleKeyPress(e, 'phone')}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.contactPhone ? 'border-red-500' : 'border-gray-300'}`}
            placeholder="Enter contact phone number (numbers only)"
          />
          {errors.contactPhone && <p className="text-red-500 text-sm mt-1">{errors.contactPhone}</p>}
        </div>
      </div>
    </div>
  );
};

export default InsuranceProviderDetails;