import React from 'react';
import { User, Plus, Trash2, AlertCircle } from 'lucide-react';

const relationships = [
  { value: 'spouse', label: 'Spouse' },
  { value: 'child', label: 'Child' }
];

const handleKeyPress = (e, type) => {
  const isControlKey = ['Backspace', 'Delete', 'Tab', 'Escape', 'ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key);
  
  // Prevent Enter key from submitting the form
  if (e.key === 'Enter') {
    e.preventDefault();
    return;
  }
  
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

const handleNicChange = (e, index, onUpdate) => {
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
  
  onUpdate(index, 'nic', value, 'nic');
};

const getNicValidationMessage = (nic) => {
  if (!nic) return null;
  
  if (nic.includes('V')) {
    if (nic.length === 10) {
      return { type: 'success', message: '✓ Valid old NIC format (9 digits + V)' };
    } else {
      return { type: 'warning', message: `Old NIC format: ${nic.length}/10 characters` };
    }
  } else {
    if (nic.length === 12) {
      return { type: 'success', message: '✓ Valid new NIC format (12 digits)' };
    } else {
      return { type: 'warning', message: `New NIC format: ${nic.length}/12 digits` };
    }
  }
};

// ✅ NEW: Calculate date range based on relationship
const getDateRange = (relationship, employeeDob, dependents) => {
  if (!employeeDob) {
    return { min: '1970-01-01', max: '2025-12-31' };
  }

  const empDate = new Date(employeeDob);
  
  if (relationship === 'spouse') {
    // Spouse: ±10 years from employee's birth date
    const minDate = new Date(empDate);
    minDate.setFullYear(empDate.getFullYear() - 10);
    
    const maxDate = new Date(empDate);
    maxDate.setFullYear(empDate.getFullYear() + 10);
    
    return {
      min: minDate.toISOString().split('T')[0],
      max: maxDate.toISOString().split('T')[0]
    };
  } else if (relationship === 'child') {
    // Child: Must be at least 18 years younger than employee
    const empMinDate = new Date(empDate);
    empMinDate.setFullYear(empDate.getFullYear() + 18);
    
    // Find spouse's DOB if exists
    const spouse = dependents.find(dep => dep.relationship === 'spouse' && dep.dateOfBirth);
    let spouseMinDate = null;
    
    if (spouse) {
      const spouseDate = new Date(spouse.dateOfBirth);
      spouseMinDate = new Date(spouseDate);
      spouseMinDate.setFullYear(spouseDate.getFullYear() + 18);
    }
    
    // Child must be 18 years younger than both employee and spouse (if exists)
    const minDate = spouseMinDate && spouseMinDate > empMinDate ? spouseMinDate : empMinDate;
    
    return {
      min: minDate.toISOString().split('T')[0],
      max: new Date().toISOString().split('T')[0] // Up to today
    };
  }
  
  return { min: '1970-01-01', max: '2025-12-31' };
};

// ✅ NEW: Validate dependent's date of birth
const validateDependentDob = (relationship, dependentDob, employeeDob, dependents) => {
  if (!dependentDob || !employeeDob) return null;
  
  const depDate = new Date(dependentDob);
  const empDate = new Date(employeeDob);
  
  if (relationship === 'spouse') {
    const yearsDiff = Math.abs(depDate.getFullYear() - empDate.getFullYear());
    
    if (yearsDiff > 10) {
      return {
        type: 'error',
        message: `⚠️ Spouse's age must be within 10 years of employee's age`
      };
    }
    return {
      type: 'success',
      message: '✓ Valid spouse date of birth'
    };
  } else if (relationship === 'child') {
    // Check against employee
    const empYearsDiff = empDate.getFullYear() - depDate.getFullYear();
    if (empYearsDiff < 18) {
      return {
        type: 'error',
        message: `⚠️ Child must be at least 18 years younger than employee`
      };
    }
    
    // Check against spouse if exists
    const spouse = dependents.find(dep => dep.relationship === 'spouse' && dep.dateOfBirth);
    if (spouse) {
      const spouseDate = new Date(spouse.dateOfBirth);
      const spouseYearsDiff = spouseDate.getFullYear() - depDate.getFullYear();
      if (spouseYearsDiff < 18) {
        return {
          type: 'error',
          message: `⚠️ Child must be at least 18 years younger than both parents`
        };
      }
    }
    
    return {
      type: 'success',
      message: '✓ Valid child date of birth'
    };
  }
  
  return null;
};

const Dependents = ({ dependents, onAdd, onRemove, onUpdate, employeeDateOfBirth }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <User className="w-5 h-5 text-purple-600" />
          <h3 className="text-lg font-semibold text-gray-900">Dependents</h3>
        </div>
        <button
          type="button"
          onClick={onAdd}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Dependent
        </button>
      </div>

      {/* ✅ NEW: Warning if employee DOB is not set */}
      {!employeeDateOfBirth && dependents.length > 0 && (
        <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2">
          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-amber-800">
            Please fill in the employee's date of birth in the Personal Information section first for proper dependent age validation.
          </p>
        </div>
      )}

      {dependents.length === 0 ? (
        <p className="text-gray-500 text-center py-4">No dependents added yet</p>
      ) : (
        <div className="space-y-4">
          {dependents.map((dependent, index) => {
            const nicValidation = getNicValidationMessage(dependent.nic);
            const dateRange = getDateRange(dependent.relationship, employeeDateOfBirth, dependents);
            const dobValidation = validateDependentDob(
              dependent.relationship, 
              dependent.dateOfBirth, 
              employeeDateOfBirth,
              dependents
            );
            
            return (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-medium text-gray-900">Dependent {index + 1}</h4>
                  <button
                    type="button"
                    onClick={() => onRemove(index)}
                    className="text-red-600 hover:text-red-800 p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                    <input
                      type="text"
                      value={dependent.name}
                      onChange={(e) => onUpdate(index, 'name', e.target.value, 'name')}
                      onKeyDown={(e) => handleKeyPress(e, 'name')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter dependent name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Relationship *</label>
                    <select
                      value={dependent.relationship}
                      onChange={(e) => onUpdate(index, 'relationship', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {relationships.map(rel => (
                        <option key={rel.value} value={rel.value}>{rel.label}</option>
                      ))}
                    </select>
                    {/* ✅ NEW: Show relationship info */}
                    <p className="text-xs text-gray-500 mt-1">
                      {dependent.relationship === 'spouse' 
                        ? 'Must be within ±10 years of employee age'
                        : 'Must be at least 18 years younger than parents'}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth *</label>
                    <input
                      type="date"
                      value={dependent.dateOfBirth}
                      onChange={(e) => onUpdate(index, 'dateOfBirth', e.target.value)}
                      onKeyDown={(e) => handleKeyPress(e, 'date')}
                      min={dateRange.min}
                      max={dateRange.max}
                      className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        dobValidation?.type === 'error' ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                    />
                    {/* ✅ NEW: Show DOB validation message */}
                    {dobValidation && (
                      <div className="text-sm mt-1">
                        <p className={`${
                          dobValidation.type === 'success' 
                            ? 'text-green-600' 
                            : 'text-red-600'
                        }`}>
                          {dobValidation.message}
                        </p>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">NIC (Optional)</label>
                    <input
                      type="text"
                      value={dependent.nic}
                      onChange={(e) => handleNicChange(e, index, onUpdate)}
                      onKeyDown={(e) => handleKeyPress(e, 'nic')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter NIC (e.g., 123456789V or 123456789012)"
                    />
                    {nicValidation && (
                      <div className="text-sm mt-1">
                        <p className={`${nicValidation.type === 'success' ? 'text-green-600' : 'text-amber-600'}`}>
                          {nicValidation.message}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Dependents;