/* eslint-disable no-undef */
// Validation utilities for HR Claim Review system

export const validators = {
  // Required field validation
  required: (value, fieldName = 'Field') => {
    if (!value || (typeof value === 'string' && value.trim().length === 0)) {
      return `${fieldName} is required`;
    }
    return null;
  },

  // Email validation
  email: (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return 'Invalid email format';
    }
    return null;
  },

  // Minimum length validation
  minLength: (value, minLength, fieldName = 'Field') => {
    if (value && value.length < minLength) {
      return `${fieldName} must be at least ${minLength} characters`;
    }
    return null;
  },

  // Maximum length validation
  maxLength: (value, maxLength, fieldName = 'Field') => {
    if (value && value.length > maxLength) {
      return `${fieldName} cannot exceed ${maxLength} characters`;
    }
    return null;
  },

  // Positive number validation
  positiveNumber: (value, fieldName = 'Amount') => {
    const num = parseFloat(value);
    if (isNaN(num) || num <= 0) {
      return `${fieldName} must be a positive number`;
    }
    return null;
  },

  // Maximum amount validation
  maxAmount: (value, maxAmount, fieldName = 'Amount') => {
    const num = parseFloat(value);
    if (num > maxAmount) {
      return `${fieldName} cannot exceed $${maxAmount.toLocaleString()}`;
    }
    return null;
  },

  // Date validation
  validDate: (dateString, fieldName = 'Date') => {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return `Invalid ${fieldName.toLowerCase()} format`;
    }
    return null;
  },

  // Date range validation
  dateRange: (startDate, endDate) => {
    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      return 'Start date must be before end date';
    }
    return null;
  },

  // Coverage breakdown validation
  coverageBreakdown: (coverageItems, claimAmount) => {
    const errors = {};

    if (!coverageItems || coverageItems.length === 0) {
      errors.general = 'At least one coverage item is required';
      return errors;
    }

    let totalAmount = 0;

    coverageItems.forEach((item, index) => {
      // Validate coverage type
      if (!item.coverageType || item.coverageType.trim().length === 0) {
        errors[`item_${index}_type`] = 'Coverage type is required';
      }

      // Validate amount
      const amount = parseFloat(item.requestedAmount);
      if (!item.requestedAmount || isNaN(amount) || amount <= 0) {
        errors[`item_${index}_amount`] = 'Valid amount is required';
      } else {
        totalAmount += amount;
      }

      // Validate notes length if provided
      if (item.notes && item.notes.length > 200) {
        errors[`item_${index}_notes`] = 'Notes cannot exceed 200 characters';
      }
    });

    // Validate total against claim amount
    if (totalAmount > claimAmount) {
      errors.total = `Total breakdown ($${totalAmount.toLocaleString()}) cannot exceed claim amount ($${claimAmount.toLocaleString()})`;
    }

    return errors;
  }
};

// Comprehensive form validation
export const validateForm = (data, rules) => {
  const errors = {};

  Object.keys(rules).forEach(field => {
    const fieldRules = Array.isArray(rules[field]) ? rules[field] : [rules[field]];
    const value = data[field];

    for (const rule of fieldRules) {
      let error = null;

      if (typeof rule === 'function') {
        error = rule(value);
      } else if (typeof rule === 'object') {
        const { validator, message, ...params } = rule;
        error = validators[validator] 
          ? validators[validator](value, params.fieldName || field, ...Object.values(params))
          : message || `Invalid ${field}`;
      }

      if (error) {
        errors[field] = error;
        break; // Stop at first error for this field
      }
    }
  });

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Specific validation functions for claim system
export const claimValidations = {
  // Validate claim creation data
  validateClaimCreation: (claimData) => {
    const rules = {
      employeeId: { validator: 'required', fieldName: 'Employee ID' },
      policy: { validator: 'required', fieldName: 'Policy' },
      claimType: { validator: 'required', fieldName: 'Claim Type' },
      claimOption: { validator: 'required', fieldName: 'Claim Option' }
    };

    const validation = validateForm(claimData, rules);

    // Additional custom validations
    if (claimData.claimType && !['life', 'vehicle'].includes(claimData.claimType)) {
      validation.errors.claimType = 'Claim type must be either life or vehicle';
      validation.isValid = false;
    }

    return validation;
  },

  // Validate claim submission
  validateClaimSubmission: (submitData) => {
    const rules = {
      claimAmount: [
        { validator: 'required', fieldName: 'Claim Amount' },
        { validator: 'positiveNumber', fieldName: 'Claim Amount' },
        { validator: 'maxAmount', maxAmount: 1000000, fieldName: 'Claim Amount' }
      ]
    };

    return validateForm(submitData, rules);
  },

  // Validate forwarding to insurer
  validateForwardToInsurer: (forwardData, claimAmount) => {
    const errors = {};

    // Validate HR notes
    if (forwardData.hrNotes && forwardData.hrNotes.length > 1000) {
      errors.hrNotes = 'HR notes cannot exceed 1000 characters';
    }

    // Validate coverage breakdown
    const coverageErrors = validators.coverageBreakdown(forwardData.coverageBreakdown, claimAmount);
    Object.assign(errors, coverageErrors);

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  },

  // Validate return to employee
  validateReturnClaim: (returnData) => {
    const rules = {
      returnReason: [
        { validator: 'required', fieldName: 'Return Reason' },
        { validator: 'minLength', minLength: 10, fieldName: 'Return Reason' },
        { validator: 'maxLength', maxLength: 500, fieldName: 'Return Reason' }
      ]
    };

    return validateForm(returnData, rules);
  },

  // Validate insurer decision
  validateInsurerDecision: (decisionData) => {
    const errors = {};

    // Validate status
    if (!decisionData.status || !['approved', 'rejected'].includes(decisionData.status)) {
      errors.status = 'Decision status must be either approved or rejected';
    }

    // Validate approved amount for approved claims
    if (decisionData.status === 'approved') {
      if (!decisionData.approvedAmount || decisionData.approvedAmount <= 0) {
        errors.approvedAmount = 'Approved amount is required for approved claims';
      }
    }

    // Validate rejection reason for rejected claims
    if (decisionData.status === 'rejected') {
      if (!decisionData.rejectionReason || decisionData.rejectionReason.trim().length === 0) {
        errors.rejectionReason = 'Rejection reason is required for rejected claims';
      } else if (decisionData.rejectionReason.length > 1000) {
        errors.rejectionReason = 'Rejection reason cannot exceed 1000 characters';
      }
    }

    // Validate insurer notes
    if (decisionData.insurerNotes && decisionData.insurerNotes.length > 1000) {
      errors.insurerNotes = 'Insurer notes cannot exceed 1000 characters';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }
};

// Real-time validation hook for forms
export const useFormValidation = (initialData, validationRules) => {
  const [data, setData] = useState(initialData);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const validateField = (fieldName, value) => {
    const rules = validationRules[fieldName];
    if (!rules) return null;

    const fieldRules = Array.isArray(rules) ? rules : [rules];
    
    for (const rule of fieldRules) {
      let error = null;

      if (typeof rule === 'function') {
        error = rule(value);
      } else if (typeof rule === 'object') {
        const { validator, ...params } = rule;
        error = validators[validator] 
          ? validators[validator](value, params.fieldName || fieldName, ...Object.values(params))
          : null;
      }

      if (error) return error;
    }

    return null;
  };

  const updateField = (fieldName, value) => {
    setData(prev => ({ ...prev, [fieldName]: value }));
    
    if (touched[fieldName]) {
      const error = validateField(fieldName, value);
      setErrors(prev => ({
        ...prev,
        [fieldName]: error
      }));
    }
  };

  const touchField = (fieldName) => {
    setTouched(prev => ({ ...prev, [fieldName]: true }));
    const error = validateField(fieldName, data[fieldName]);
    setErrors(prev => ({
      ...prev,
      [fieldName]: error
    }));
  };

  const validateAll = () => {
    const newErrors = {};
    const allTouched = {};

    Object.keys(validationRules).forEach(fieldName => {
      allTouched[fieldName] = true;
      const error = validateField(fieldName, data[fieldName]);
      if (error) {
        newErrors[fieldName] = error;
      }
    });

    setTouched(allTouched);
    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  return {
    data,
    errors,
    touched,
    updateField,
    touchField,
    validateAll,
    isValid: Object.keys(errors).length === 0
  };
};