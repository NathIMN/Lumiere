// Get current date in YYYY-MM-DD format (ensures it's not in the future)
const getCurrentDate = () => {
  const now = new Date();
  // Set to local timezone to avoid any timezone issues
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  return now.toISOString().split('T')[0];
};

export const initialFormData = {
  email: '',
  password: '',
  confirmPassword: '',
  role: 'employee',
  profile: {
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    nic: '',
    phoneNumber: '',
    address: ''
  },
  employment: {
    department: '',
    designation: '',
    employmentType: 'permanent',
    joinDate: getCurrentDate(),
    salary: ''
  },
  bankDetails: {
    accountHolderName: '',
    bankName: '',
    branchName: '',
    accountNumber: ''
  },
  dependents: [],
};

export const employmentTypes = [
  { value: 'permanent', label: 'Permanent' },
  { value: 'contract', label: 'Contract' },
  { value: 'probation', label: 'Probation' },
  { value: 'executive', label: 'Executive' }
];

export const relationships = [
  { value: 'spouse', label: 'Spouse' },
  { value: 'child', label: 'Child' }
];