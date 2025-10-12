// Bank-specific account number configurations
const BANK_CONFIGS = {
  'Bank of Ceylon': { digits: 10 },
  'Hatton National Bank': { digits: 12 },
  'Commercial Bank': { digits: 10 },
  'Sampath Bank': { digits: 12 },
  'Peoples Bank': { digits: 15 },
  'Nations Trust Bank': { digits: 12 },
  'DFCC Bank': { digits: 12 },
  'NDB Bank': { digits: 12 }
};

export const validateForm = (formData) => {
  const errors = {};
  
  // Basic validation
  if (!formData.email) {
    errors.email = 'Email is required';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
    errors.email = 'Please enter a valid email address';
  }
  
  if (!formData.password) {
    errors.password = 'Password is required';
  } else if (formData.password.length < 8) {
    errors.password = 'Password must be at least 8 characters';
  }
  
  if (formData.password !== formData.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match';
  }
  
  // Profile validation
  if (!formData.profile.firstName) {
    errors.firstName = 'First name is required';
  }
  
  if (!formData.profile.lastName) {
    errors.lastName = 'Last name is required';
  }
  
  if (!formData.profile.dateOfBirth) {
    errors.dateOfBirth = 'Date of birth is required';
  }
  
  if (!formData.profile.nic) {
    errors.nic = 'NIC is required';
  } else {
    const nic = formData.profile.nic.toUpperCase();
    
    if (nic.includes('V')) {
      if (!/^\d{9}V$/.test(nic)) {
        errors.nic = 'Invalid old NIC format. Must be 9 digits followed by V (e.g., 123456789V)';
      }
    } else {
      if (!/^\d{12}$/.test(nic)) {
        errors.nic = 'Invalid new NIC format. Must be exactly 12 digits (e.g., 123456789012)';
      }
    }
  }
  
  if (!formData.profile.phoneNumber) {
    errors.phoneNumber = 'Phone number is required';
  } else if (!/^\d{10}$/.test(formData.profile.phoneNumber)) {
    errors.phoneNumber = 'Phone number must be exactly 10 digits';
  }
  
  if (!formData.profile.address) {
    errors.address = 'Address is required';
  }
  
  // Role-specific validation
  if (formData.role === 'employee') {
    // Employment validation
    if (!formData.employment.department) {
      errors.department = 'Department is required';
    }
    
    if (!formData.employment.designation) {
      errors.designation = 'Designation is required';
    }
    
    if (!formData.employment.joinDate) {
      errors.joinDate = 'Join date is required';
    }
    
    if (!formData.employment.salary) {
      errors.salary = 'Salary is required';
    } else if (isNaN(formData.employment.salary) || Number(formData.employment.salary) <= 0) {
      errors.salary = 'Please enter a valid salary amount';
    }
    
    // Bank details validation
    if (!formData.bankDetails.accountHolderName) {
      errors.accountHolderName = 'Account holder name is required';
    }
    
    if (!formData.bankDetails.bankName) {
      errors.bankName = 'Bank name is required';
    }
    
    if (!formData.bankDetails.branchName) {
      errors.branchName = 'Branch name is required';
    }
    
    if (!formData.bankDetails.accountNumber) {
      errors.accountNumber = 'Account number is required';
    } else {
      const accountNumber = formData.bankDetails.accountNumber;
      const bankName = formData.bankDetails.bankName;
      
      // Check if account number contains only digits
      if (!/^\d+$/.test(accountNumber)) {
        errors.accountNumber = 'Account number must contain only digits';
      } 
      // Validate against bank-specific requirements
      else if (bankName && BANK_CONFIGS[bankName]) {
        const requiredDigits = BANK_CONFIGS[bankName].digits;
        if (accountNumber.length !== requiredDigits) {
          errors.accountNumber = `Invalid account number for ${bankName}`;
        }
      }
    }
  }
  
  if (formData.role === 'insurance_agent') {
    if (!formData.insuranceProvider.companyName) {
      errors.companyName = 'Company name is required';
    }
    
    if (!formData.insuranceProvider.agentId) {
      errors.agentId = 'Agent ID is required';
    }
    
    if (!formData.insuranceProvider.licenseNumber) {
      errors.licenseNumber = 'License number is required';
    }
    
    if (!formData.insuranceProvider.contactEmail) {
      errors.contactEmail = 'Contact email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.insuranceProvider.contactEmail)) {
      errors.contactEmail = 'Please enter a valid email address';
    }
    
    if (!formData.insuranceProvider.contactPhone) {
      errors.contactPhone = 'Contact phone is required';
    } else if (!/^\d{10}$/.test(formData.insuranceProvider.contactPhone)) {
      errors.contactPhone = 'Contact phone must be exactly 10 digits';
    }
  }
  
  return errors;
};

// Helper function to validate NIC format
export const validateNIC = (nic) => {
  if (!nic) return { isValid: false, message: 'NIC is required' };
  
  const nicUpper = nic.toUpperCase();
  
  if (nicUpper.includes('V')) {
    if (/^\d{9}V$/.test(nicUpper)) {
      return { isValid: true, message: 'Valid old NIC format' };
    } else {
      return { isValid: false, message: 'Invalid old NIC format. Must be 9 digits followed by V' };
    }
  } else {
    if (/^\d{12}$/.test(nicUpper)) {
      return { isValid: true, message: 'Valid new NIC format' };
    } else {
      return { isValid: false, message: 'Invalid new NIC format. Must be exactly 12 digits' };
    }
  }
};

// Helper function to validate account number for a specific bank
export const validateAccountNumberForBank = (accountNumber, bankName) => {
  if (!accountNumber) {
    return { isValid: false, message: 'Account number is required' };
  }
  
  if (!/^\d+$/.test(accountNumber)) {
    return { isValid: false, message: 'Account number must contain only digits' };
  }
  
  if (!bankName) {
    return { isValid: false, message: 'Please select a bank first' };
  }
  
  const bankConfig = BANK_CONFIGS[bankName];
  if (!bankConfig) {
    // Fallback validation for unknown banks
    if (accountNumber.length >= 8 && accountNumber.length <= 20) {
      return { isValid: true, message: 'Valid account number' };
    }
    return { isValid: false, message: 'Account number must be 8-20 digits' };
  }
  
  if (accountNumber.length === bankConfig.digits) {
    return { isValid: true, message: `Valid ${bankName} account number` };
  }
  
  return { 
    isValid: false, 
    message: `Account number must be exactly ${bankConfig.digits} digits for ${bankName}` 
  };
};

export const handleKeyPress = (e, type) => {
  const isControlKey = ['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 'ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key);
  
  if (isControlKey) {
    return;
  }

  if (type === 'name') {
    if (!/[a-zA-Z\s]/.test(e.key)) {
      e.preventDefault();
    }
  } else if (type === 'phone' || type === 'accountNumber') {
    if (!/[0-9]/.test(e.key)) {
      e.preventDefault();
    }
  } else if (type === 'nic') {
    if (!/[0-9V]/.test(e.key.toUpperCase())) {
      e.preventDefault();
    }
  }
};

// Export bank configurations for use in components
export { BANK_CONFIGS };