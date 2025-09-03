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
    joinDate: '',
    salary: ''
  },
  dependents: [],
  bankDetails: {
    accountHolderName: '',
    bankName: '',
    branchName: '',
    accountNumber: ''
  },
  insuranceProvider: {
    companyName: '',
    agentId: '',
    licenseNumber: '',
    contactEmail: '',
    contactPhone: ''
  }
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

export const userRoles = [
  { value: 'employee', label: 'Employee' },
  { value: 'hr_officer', label: 'HR Officer' },
  { value: 'insurance_agent', label: 'Insurance Agent' },
  { value: 'admin', label: 'Admin' }
];