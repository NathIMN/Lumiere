/* eslint-disable no-unused-vars */
import { useState, useCallback } from 'react';
import { 
  validateCoverageBreakdown,
  validateHRNotes,
  validateReturnReason,
  validateForwardToInsurer,
  validateClaimForReturn
} from '../utils/claimValidators';

/**
 * Custom hook for claim validation
 */
export const useClaimValidation = () => {
  const [validationErrors, setValidationErrors] = useState({});
  const [isValidating, setIsValidating] = useState(false);

  const validateCoverage = useCallback((coverageBreakdown) => {
    const result = validateCoverageBreakdown(coverageBreakdown);
    if (!result.isValid) {
      setValidationErrors(prev => ({ ...prev, coverage: result.errors }));
    } else {
      setValidationErrors(prev => {
        const { coverage, ...rest } = prev;
        return rest;
      });
    }
    return result;
  }, []);

  const validateNotes = useCallback((notes) => {
    const result = validateHRNotes(notes);
    if (!result.isValid) {
      setValidationErrors(prev => ({ ...prev, notes: result.errors }));
    } else {
      setValidationErrors(prev => {
        const { notes, ...rest } = prev;
        return rest;
      });
    }
    return result;
  }, []);

  const validateReturn = useCallback((reason) => {
    const result = validateReturnReason(reason);
    if (!result.isValid) {
      setValidationErrors(prev => ({ ...prev, returnReason: result.errors }));
    } else {
      setValidationErrors(prev => {
        const { returnReason, ...rest } = prev;
        return rest;
      });
    }
    return result;
  }, []);

  const validateForwardForm = useCallback((data, claim) => {
    setIsValidating(true);
    const result = validateForwardToInsurer(data, claim);
    if (!result.isValid) {
      setValidationErrors(result.errors);
    } else {
      setValidationErrors({});
    }
    setIsValidating(false);
    return result;
  }, []);

  const validateReturnForm = useCallback((claim, userRole) => {
    const result = validateClaimForReturn(claim, userRole);
    if (!result.isValid) {
      setValidationErrors(prev => ({ ...prev, claim: result.errors }));
    } else {
      setValidationErrors(prev => {
        const { claim, ...rest } = prev;
        return rest;
      });
    }
    return result;
  }, []);

  const clearValidationErrors = useCallback(() => {
    setValidationErrors({});
  }, []);

  const clearValidationError = useCallback((errorKey) => {
    setValidationErrors(prev => {
      const { [errorKey]: _, ...rest } = prev;
      return rest;
    });
  }, []);

  const getValidationError = useCallback((field) => {
    return validationErrors[field] || null;
  }, [validationErrors]);

  const hasValidationErrors = useCallback(() => {
    return Object.keys(validationErrors).length > 0;
  }, [validationErrors]);

  const validateField = useCallback((field, value, additionalData = {}) => {
    switch (field) {
      case 'coverageBreakdown':
        return validateCoverage(value);
      case 'hrNotes':
        return validateNotes(value);
      case 'returnReason':
        return validateReturn(value);
      case 'coverageItem': {
        const itemValidation = validateCoverageBreakdown([value]);
        const error = itemValidation.errors?.items?.[0];
        if (error) {
          setValidationErrors(prev => ({
            ...prev,
            [`coverageItem_${additionalData.index}`]: error
          }));
        } else {
          setValidationErrors(prev => {
            const { [`coverageItem_${additionalData.index}`]: _, ...rest } = prev;
            return rest;
          });
        }
        return { isValid: !error, errors: error || {} };
      }
      default:
        console.warn(`Unknown validation field: ${field}`);
        return { isValid: true, errors: {} };
    }
  }, [validateCoverage, validateNotes, validateReturn]);

  return {
    validationErrors,
    isValidating,
    validateCoverage,
    validateNotes,
    validateReturn,
    validateForwardForm,
    validateReturnForm,
    validateField,
    clearValidationErrors,
    clearValidationError,
    getValidationError,
    hasValidationErrors,
    isValid: !hasValidationErrors(),
    errorCount: Object.keys(validationErrors).length,
  };
};

/**
 * Custom hook for real-time form validation
 */
export const useFormValidation = (initialValues = {}, validationRules = {}) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouchedState] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Update field value
  const setValue = useCallback((field, value) => {
    setValues(prev => ({ ...prev, [field]: value }));

    if (errors[field]) {
      setErrors(prev => {
        const { [field]: _, ...rest } = prev;
        return rest;
      });
    }
  }, [errors]);

  // Mark a single field as touched
  const markFieldTouched = useCallback((field) => {
    setTouchedState(prev => ({ ...prev, [field]: true }));
  }, []);

  // Validate single field
  const validateSingleField = useCallback((field, value) => {
    const rule = validationRules[field];
    if (!rule) return null;

    let error = null;

    if (rule.required && (!value || value.toString().trim() === '')) {
      error = rule.requiredMessage || `${field} is required`;
    }
    if (!error && rule.minLength && value && value.toString().length < rule.minLength) {
      error = rule.minLengthMessage || `${field} must be at least ${rule.minLength} characters`;
    }
    if (!error && rule.maxLength && value && value.toString().length > rule.maxLength) {
      error = rule.maxLengthMessage || `${field} cannot exceed ${rule.maxLength} characters`;
    }
    if (!error && rule.min && value && Number(value) < rule.min) {
      error = rule.minMessage || `${field} must be at least ${rule.min}`;
    }
    if (!error && rule.max && value && Number(value) > rule.max) {
      error = rule.maxMessage || `${field} cannot exceed ${rule.max}`;
    }
    if (!error && rule.pattern && value && !rule.pattern.test(value)) {
      error = rule.patternMessage || `${field} format is invalid`;
    }
    if (!error && rule.validate && typeof rule.validate === 'function') {
      error = rule.validate(value, values);
    }

    return error;
  }, [validationRules, values]);

  // Validate all fields
  const validateAllFields = useCallback(() => {
    const newErrors = {};
    Object.keys(validationRules).forEach(field => {
      const error = validateSingleField(field, values[field]);
      if (error) {
        newErrors[field] = error;
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [validationRules, values, validateSingleField]);

  // Handle blur
  const handleBlur = useCallback((field) => {
    markFieldTouched(field);
    const error = validateSingleField(field, values[field]);
    if (error) {
      setErrors(prev => ({ ...prev, [field]: error }));
    }
  }, [validateSingleField, values, markFieldTouched]);

  // Handle submit
  const handleSubmit = useCallback((onSubmit) => {
    return async (e) => {
      e.preventDefault();
      setIsSubmitting(true);

      // Mark all fields as touched
      const allFields = Object.keys(validationRules);
      setTouchedState(allFields.reduce((acc, field) => ({ ...acc, [field]: true }), {}));

      const isValid = validateAllFields();
      if (isValid) {
        try {
          await onSubmit(values);
        } catch (error) {
          console.error('Form submission error:', error);
        }
      }
      setIsSubmitting(false);
    };
  }, [validationRules, validateAllFields, values]);

  // Reset form
  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouchedState({});
    setIsSubmitting(false);
  }, [initialValues]);

  return {
    values,
    errors,
    touched,
    isSubmitting,
    setValue,
    markFieldTouched,
    handleBlur,
    handleSubmit,
    reset,
    validateAllFields,
    validateSingleField,
    isValid: Object.keys(errors).length === 0,
    isDirty: JSON.stringify(values) !== JSON.stringify(initialValues),
    canSubmit: Object.keys(errors).length === 0 && !isSubmitting,
  };
};
