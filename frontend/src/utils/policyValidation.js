// Add these to your existing validation.js file

// Policy form validation
export const validatePolicyForm = (formData) => {
  const errors = {};
  
  // Basic policy information
  if (!formData.policyType) {
    errors.policyType = 'Policy type is required';
  } else if (!['life', 'vehicle'].includes(formData.policyType)) {
    errors.policyType = 'Policy type must be either life or vehicle';
  }
  
  if (!formData.policyCategory) {
    errors.policyCategory = 'Policy category is required';
  } else if (!['individual', 'group'].includes(formData.policyCategory)) {
    errors.policyCategory = 'Policy category must be either individual or group';
  }
  
  if (!formData.insuranceAgent) {
    errors.insuranceAgent = 'Insurance agent is required';
  }
  
  // Coverage validation
  if (!formData.coverage?.coverageAmount) {
    errors.coverageAmount = 'Coverage amount is required';
  } else if (isNaN(formData.coverage.coverageAmount) || Number(formData.coverage.coverageAmount) <= 0) {
    errors.coverageAmount = 'Please enter a valid coverage amount';
  } else if (Number(formData.coverage.coverageAmount) < 50000) {
    errors.coverageAmount = 'Minimum coverage amount is LKR 50,000';
  } else if (Number(formData.coverage.coverageAmount) > 50000000) {
    errors.coverageAmount = 'Maximum coverage amount is LKR 50,000,000';
  }
  
  if (formData.coverage?.deductible && isNaN(formData.coverage.deductible)) {
    errors.deductible = 'Deductible must be a valid number';
  } else if (formData.coverage?.deductible && Number(formData.coverage.deductible) < 0) {
    errors.deductible = 'Deductible cannot be negative';
  }
  
  // Policy type specific coverage validation
  if (formData.policyType === 'life') {
    if (!formData.coverage?.typeLife || formData.coverage.typeLife.length === 0) {
      errors.coverageTypeLife = 'At least one life coverage type is required';
    }
    
    if (formData.coverage?.typeVehicle && formData.coverage.typeVehicle.length > 0) {
      errors.coverageTypeVehicle = 'Life policy cannot have vehicle coverage types';
    }
  } else if (formData.policyType === 'vehicle') {
    if (!formData.coverage?.typeVehicle || formData.coverage.typeVehicle.length === 0) {
      errors.coverageTypeVehicle = 'At least one vehicle coverage type is required';
    }
    
    if (formData.coverage?.typeLife && formData.coverage.typeLife.length > 0) {
      errors.coverageTypeLife = 'Vehicle policy cannot have life coverage types';
    }
  }
  
  // Validity period validation
  if (!formData.validity?.startDate) {
    errors.startDate = 'Policy start date is required';
  } else {
    const startDate = new Date(formData.validity.startDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (startDate < today) {
      errors.startDate = 'Start date cannot be in the past';
    }
  }
  
  if (!formData.validity?.endDate) {
    errors.endDate = 'Policy end date is required';
  } else if (formData.validity?.startDate) {
    const startDate = new Date(formData.validity.startDate);
    const endDate = new Date(formData.validity.endDate);
    
    if (endDate <= startDate) {
      errors.endDate = 'End date must be after start date';
    }
    
    // Minimum policy duration of 1 year
    const oneYearLater = new Date(startDate);
    oneYearLater.setFullYear(startDate.getFullYear() + 1);
    
    if (endDate < oneYearLater) {
      errors.endDate = 'Minimum policy duration is 1 year';
    }
  }
  
  // Premium validation
  if (!formData.premium?.amount) {
    errors.premiumAmount = 'Premium amount is required';
  } else if (isNaN(formData.premium.amount) || Number(formData.premium.amount) <= 0) {
    errors.premiumAmount = 'Please enter a valid premium amount';
  } else if (Number(formData.premium.amount) < 1000) {
    errors.premiumAmount = 'Minimum premium amount is LKR 1,000';
  }
  
  if (!formData.premium?.frequency) {
    errors.premiumFrequency = 'Premium frequency is required';
  } else if (!['monthly', 'quarterly', 'semi-annual', 'annual'].includes(formData.premium.frequency)) {
    errors.premiumFrequency = 'Invalid premium frequency';
  }
  
  // Beneficiaries validation (optional but if provided must be valid)
  if (formData.beneficiaries && formData.beneficiaries.length > 0) {
    if (formData.beneficiaries.length > 10) {
      errors.beneficiaries = 'Maximum 10 beneficiaries allowed per policy';
    }
    
    // Check for duplicate beneficiaries
    const uniqueBeneficiaries = new Set(formData.beneficiaries);
    if (uniqueBeneficiaries.size !== formData.beneficiaries.length) {
      errors.beneficiaries = 'Duplicate beneficiaries are not allowed';
    }
  }
  
  // Notes validation
  if (formData.notes && formData.notes.length > 500) {
    errors.notes = 'Notes cannot exceed 500 characters';
  }
  
  return errors;
};

// Policy status validation
export const validatePolicyStatus = (status) => {
  const validStatuses = ['active', 'expired', 'cancelled', 'suspended', 'pending'];
  
  if (!status) {
    return { isValid: false, message: 'Policy status is required' };
  }
  
  if (!validStatuses.includes(status)) {
    return { isValid: false, message: 'Invalid policy status' };
  }
  
  return { isValid: true, message: 'Valid policy status' };
};

// Policy ID validation
export const validatePolicyId = (policyId) => {
  if (!policyId) {
    return { isValid: false, message: 'Policy ID is required' };
  }
  
  // Policy ID format: LI0001, LG0001, VI0001, VG0001
  const policyIdRegex = /^[LV][IG]\d{4}$/;
  
  if (!policyIdRegex.test(policyId.toUpperCase())) {
    return { isValid: false, message: 'Policy ID must be in format: LI0001, LG0001, VI0001, or VG0001' };
  }
  
  return { isValid: true, message: 'Valid policy ID format' };
};

// Coverage amount validation helper
export const validateCoverageAmount = (amount, policyType) => {
  if (!amount) {
    return { isValid: false, message: 'Coverage amount is required' };
  }
  
  const numAmount = Number(amount);
  
  if (isNaN(numAmount) || numAmount <= 0) {
    return { isValid: false, message: 'Coverage amount must be a positive number' };
  }
  
  // Type-specific limits
  if (policyType === 'life') {
    if (numAmount < 100000) {
      return { isValid: false, message: 'Minimum life insurance coverage is LKR 100,000' };
    }
    if (numAmount > 100000000) {
      return { isValid: false, message: 'Maximum life insurance coverage is LKR 100,000,000' };
    }
  } else if (policyType === 'vehicle') {
    if (numAmount < 50000) {
      return { isValid: false, message: 'Minimum vehicle insurance coverage is LKR 50,000' };
    }
    if (numAmount > 20000000) {
      return { isValid: false, message: 'Maximum vehicle insurance coverage is LKR 20,000,000' };
    }
  }
  
  return { isValid: true, message: 'Valid coverage amount' };
};

// Premium calculation helper
export const calculateAnnualPremium = (amount, frequency) => {
  const multipliers = {
    'monthly': 12,
    'quarterly': 4,
    'semi-annual': 2,
    'annual': 1
  };
  
  return Number(amount) * (multipliers[frequency] || 1);
};

// Key press handlers for policy forms
export const handlePolicyKeyPress = (e, type) => {
  const isControlKey = ['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 'ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key);
  
  if (isControlKey) {
    return;
  }

  if (type === 'amount') {
    // Allow numbers and decimal point only
    if (!/[0-9.]/.test(e.key)) {
      e.preventDefault();
    }
    
    // Prevent multiple decimal points
    const currentValue = e.target.value;
    if (e.key === '.' && currentValue.includes('.')) {
      e.preventDefault();
    }
  } else if (type === 'policyId') {
    // Allow letters and numbers only for policy ID
    if (!/[A-Za-z0-9]/.test(e.key)) {
      e.preventDefault();
    }
  } else if (type === 'percentage') {
    // Allow numbers and decimal point only, max 100
    if (!/[0-9.]/.test(e.key)) {
      e.preventDefault();
    }
  }
};

// Filter validation
export const validatePolicyFilters = (filters) => {
  const errors = {};
  
  // Policy type filter
  if (filters.policyType && !['life', 'vehicle'].includes(filters.policyType)) {
    errors.policyType = 'Invalid policy type filter';
  }
  
  // Policy category filter
  if (filters.policyCategory && !['individual', 'group'].includes(filters.policyCategory)) {
    errors.policyCategory = 'Invalid policy category filter';
  }
  
  // Status filter
  if (filters.status && !['active', 'expired', 'cancelled', 'suspended', 'pending'].includes(filters.status)) {
    errors.status = 'Invalid status filter';
  }
  
  // Pagination validation
  if (filters.page && (isNaN(filters.page) || Number(filters.page) < 1)) {
    errors.page = 'Page number must be a positive integer';
  }
  
  if (filters.limit && (isNaN(filters.limit) || Number(filters.limit) < 1 || Number(filters.limit) > 100)) {
    errors.limit = 'Limit must be between 1 and 100';
  }
  
  // Search validation
  if (filters.search && filters.search.length > 100) {
    errors.search = 'Search term cannot exceed 100 characters';
  }
  
  return errors;
};