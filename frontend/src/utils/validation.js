export const validateForm = (formData) => {
  const errors = {};

  // Basic validation
  if (!formData.email) errors.email = 'Email is required';
  if (!formData.password) errors.password = 'Password is required';
  if (formData.password.length < 8) errors.password = 'Password must be at least 8 characters';
  if (formData.password !== formData.confirmPassword) errors.confirmPassword = 'Passwords do not match';

  // Profile validation
  if (!formData.profile.firstName) errors.firstName = 'First name is required';
  if (!formData.profile.lastName) errors.lastName = 'Last name is required';
  if (!formData.profile.dateOfBirth) errors.dateOfBirth = 'Date of birth is required';
  if (!formData.profile.nic) errors.nic = 'NIC is required';
  if (!formData.profile.phoneNumber) errors.phoneNumber = 'Phone number is required';
  if (!formData.profile.address) errors.address = 'Address is required';

  // Role-specific validation
  if (formData.role === 'employee') {
    if (!formData.employment.department) errors.department = 'Department is required';
    if (!formData.employment.designation) errors.designation = 'Designation is required';
    if (!formData.employment.joinDate) errors.joinDate = 'Join date is required';
    if (!formData.employment.salary) errors.salary = 'Salary is required';
    if (!formData.bankDetails.accountHolderName) errors.accountHolderName = 'Account holder name is required';
    if (!formData.bankDetails.bankName) errors.bankName = 'Bank name is required';
    if (!formData.bankDetails.branchName) errors.branchName = 'Branch name is required';
    if (!formData.bankDetails.accountNumber) errors.accountNumber = 'Account number is required';
  }

  if (formData.role === 'insurance_agent') {
    if (!formData.insuranceProvider.companyName) errors.companyName = 'Company name is required';
    if (!formData.insuranceProvider.agentId) errors.agentId = 'Agent ID is required';
    if (!formData.insuranceProvider.licenseNumber) errors.licenseNumber = 'License number is required';
    if (!formData.insuranceProvider.contactEmail) errors.contactEmail = 'Contact email is required';
    if (!formData.insuranceProvider.contactPhone) errors.contactPhone = 'Contact phone is required';
  }

  return errors;
};

export const handleKeyPress = (e, type) => {
  if (type === 'name') {
    // Allow letters, space, backspace, delete, tab, escape, enter
    if (!/[a-zA-Z\s]/.test(e.key) && !['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
      e.preventDefault();
    }
  } else if (type === 'phone') {
    // Allow numbers, backspace, delete, tab, escape, enter, arrow keys
    if (!/[0-9]/.test(e.key) && !['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
      e.preventDefault();
    }
  }
};