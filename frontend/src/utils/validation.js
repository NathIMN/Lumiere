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
  } else if (!/^\d+$/.test(formData.profile.nic)) {
    errors.nic = 'NIC must contain only numbers';
  }
  
  if (!formData.profile.phoneNumber) {
    errors.phoneNumber = 'Phone number is required';
  } else if (!/^\d+$/.test(formData.profile.phoneNumber)) {
    errors.phoneNumber = 'Phone number must contain only numbers';
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
    } else if (!/^\d+$/.test(formData.bankDetails.accountNumber)) {
      errors.accountNumber = 'Account number must contain only numbers';
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
    } else if (!/^\d+$/.test(formData.insuranceProvider.contactPhone)) {
      errors.contactPhone = 'Contact phone must contain only numbers';
    }
  }
  
  return errors;
};

export const handleKeyPress = (e, type) => {
  if (type === 'name') {
    // Allow letters, space, backspace, delete, tab, escape, enter, arrow keys
    if (!/[a-zA-Z\s]/.test(e.key) && !['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
      e.preventDefault();
    }
  } else if (type === 'phone' || type === 'nic' || type === 'accountNumber') {
    // Allow numbers, backspace, delete, tab, escape, enter, arrow keys
    if (!/[0-9]/.test(e.key) && !['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
      e.preventDefault();
    }
  }
};