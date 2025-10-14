import React from 'react';
import { User } from 'lucide-react';

const PersonalInformation = ({ formData, errors, onChange }) => {
  const handleNicChange = (e) => {
    let value = e.target.value.toUpperCase();
    
    // Remove any invalid characters
    value = value.replace(/[^0-9V]/g, '');
    
    if (value.includes('V')) {
      const vIndex = value.indexOf('V');
      if (vIndex === 9 && value.length <= 10) {
        value = value.substring(0, 10);
      } else if (vIndex < 9) {
        value = value.replace('V', '');
      } else {
        value = value.substring(0, 9) + 'V';
      }
    } else {
      value = value.substring(0, 12);
    }
    
    // Create synthetic event
    const syntheticEvent = {
      ...e,
      target: {
        ...e.target,
        name: 'nic',
        value: value
      }
    };
    
    onChange(syntheticEvent, 'profile', 'nic');
  };

  const handlePhoneChange = (e) => {
    let value = e.target.value;
    
    // Remove any non-numeric characters
    value = value.replace(/[^0-9]/g, '');
    
    // Limit to exactly 10 digits only
    value = value.substring(0, 10);
    
    // Create synthetic event
    const syntheticEvent = {
      ...e,
      target: {
        ...e.target,
        name: 'phoneNumber',
        value: value
      }
    };
    
    onChange(syntheticEvent, 'profile', 'phone');
  };

  const handleKeyPress = (e, type) => {
    const isControlKey = ['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 'ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key);
    
    // Always allow control keys
    if (isControlKey) {
      return;
    }

    if (type === 'name') {
      // Allow letters and space only
      if (!/[a-zA-Z\s]/.test(e.key)) {
        e.preventDefault();
      }
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center gap-3 mb-6">
        <User className="w-5 h-5 text-indigo-600" />
        <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">First Name *</label>
          <input
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={(e) => onChange(e, 'profile', 'name')}
            onKeyDown={(e) => handleKeyPress(e, 'name')}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.firstName ? 'border-red-500' : 'border-gray-300'}`}
            placeholder="Enter first name"
          />
          {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Last Name *</label>
          <input
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={(e) => onChange(e, 'profile', 'name')}
            onKeyDown={(e) => handleKeyPress(e, 'name')}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.lastName ? 'border-red-500' : 'border-gray-300'}`}
            placeholder="Enter last name"
          />
          {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth *</label>
          <input
            type="date"
            name="dateOfBirth"
            value={formData.dateOfBirth}
            onChange={(e) => onChange(e, 'profile')}
            min="1970-01-01"
            max="2007-10-13"
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.dateOfBirth ? 'border-red-500' : 'border-gray-300'}`}
          />
          {errors.dateOfBirth && <p className="text-red-500 text-sm mt-1">{errors.dateOfBirth}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">NIC Number *</label>
          <input
            type="text"
            name="nic"
            value={formData.nic}
            onChange={handleNicChange}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.nic ? 'border-red-500' : 'border-gray-300'}`}
            placeholder="Enter NIC (e.g., 123456789V or 123456789012)"
          />
          {formData.nic && (
            <div className="text-sm mt-1">
              {formData.nic.includes('V') ? (
                formData.nic.length === 10 ? (
                  <p className="text-green-600">✓ Valid old NIC format (9 digits + V)</p>
                ) : (
                  <p className="text-amber-600">
                    Old NIC format: {formData.nic.length}/10 characters
                  </p>
                )
              ) : (
                formData.nic.length === 12 ? (
                  <p className="text-green-600">✓ Valid new NIC format (12 digits)</p>
                ) : (
                  <p className="text-amber-600">
                    New NIC format: {formData.nic.length}/12 digits
                  </p>
                )
              )}
            </div>
          )}
          {errors.nic && <p className="text-red-500 text-sm mt-1">{errors.nic}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
          <input
            type="tel"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handlePhoneChange}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.phoneNumber ? 'border-red-500' : 'border-gray-300'}`}
            placeholder="Enter 10-digit phone number"
          />
          {formData.phoneNumber && (
            <div className="text-sm mt-1">
              {formData.phoneNumber.length === 10 ? (
                <p className="text-green-600">✓ Valid phone number (10 digits)</p>
              ) : (
                <p className="text-amber-600">
                  Phone number: {formData.phoneNumber.length}/10 digits
                </p>
              )}
            </div>
          )}
          {errors.phoneNumber && <p className="text-red-500 text-sm mt-1">{errors.phoneNumber}</p>}
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">Address *</label>
          <textarea
            name="address"
            value={formData.address}
            onChange={(e) => onChange(e, 'profile')}
            rows={3}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none ${errors.address ? 'border-red-500' : 'border-gray-300'}`}
            placeholder="Enter full address"
          />
          {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
        </div>
      </div>
    </div>
  );
};

export default PersonalInformation;