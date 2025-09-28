// Get current date in YYYY-MM-DD format
const getCurrentDate = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
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