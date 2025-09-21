// Application constants for HR Claim Review system

export const CLAIM_STATUSES = {
  DRAFT: 'draft',
  EMPLOYEE: 'employee',
  HR: 'hr',
  INSURER: 'insurer',
  APPROVED: 'approved',
  REJECTED: 'rejected'
};

export const CLAIM_STATUS_LABELS = {
  [CLAIM_STATUSES.DRAFT]: 'Draft',
  [CLAIM_STATUSES.EMPLOYEE]: 'With Employee',
  [CLAIM_STATUSES.HR]: 'Pending HR Review',
  [CLAIM_STATUSES.INSURER]: 'With Insurer',
  [CLAIM_STATUSES.APPROVED]: 'Approved',
  [CLAIM_STATUSES.REJECTED]: 'Rejected'
};

export const CLAIM_STATUS_COLORS = {
  [CLAIM_STATUSES.DRAFT]: {
    bg: 'bg-gray-100 dark:bg-gray-900',
    text: 'text-gray-800 dark:text-gray-200',
    border: 'border-gray-200 dark:border-gray-700'
  },
  [CLAIM_STATUSES.EMPLOYEE]: {
    bg: 'bg-blue-100 dark:bg-blue-900',
    text: 'text-blue-800 dark:text-blue-200',
    border: 'border-blue-200 dark:border-blue-700'
  },
  [CLAIM_STATUSES.HR]: {
    bg: 'bg-yellow-100 dark:bg-yellow-900',
    text: 'text-yellow-800 dark:text-yellow-200',
    border: 'border-yellow-200 dark:border-yellow-700'
  },
  [CLAIM_STATUSES.INSURER]: {
    bg: 'bg-purple-100 dark:bg-purple-900',
    text: 'text-purple-800 dark:text-purple-200',
    border: 'border-purple-200 dark:border-purple-700'
  },
  [CLAIM_STATUSES.APPROVED]: {
    bg: 'bg-green-100 dark:bg-green-900',
    text: 'text-green-800 dark:text-green-200',
    border: 'border-green-200 dark:border-green-700'
  },
  [CLAIM_STATUSES.REJECTED]: {
    bg: 'bg-red-100 dark:bg-red-900',
    text: 'text-red-800 dark:text-red-200',
    border: 'border-red-200 dark:border-red-700'
  }
};

export const CLAIM_TYPES = {
  LIFE: 'life',
  VEHICLE: 'vehicle'
};

export const CLAIM_TYPE_LABELS = {
  [CLAIM_TYPES.LIFE]: 'Life Insurance',
  [CLAIM_TYPES.VEHICLE]: 'Vehicle Insurance'
};

export const LIFE_CLAIM_OPTIONS = {
  HOSPITALIZATION: 'hospitalization',
  CHANNELLING: 'channelling',
  MEDICATION: 'medication',
  DEATH: 'death'
};

export const LIFE_CLAIM_OPTION_LABELS = {
  [LIFE_CLAIM_OPTIONS.HOSPITALIZATION]: 'Hospitalization',
  [LIFE_CLAIM_OPTIONS.CHANNELLING]: 'Channeling',
  [LIFE_CLAIM_OPTIONS.MEDICATION]: 'Medication',
  [LIFE_CLAIM_OPTIONS.DEATH]: 'Death Benefit'
};

export const VEHICLE_CLAIM_OPTIONS = {
  ACCIDENT: 'accident',
  THEFT: 'theft',
  FIRE: 'fire',
  NATURAL_DISASTER: 'naturalDisaster'
};

export const VEHICLE_CLAIM_OPTION_LABELS = {
  [VEHICLE_CLAIM_OPTIONS.ACCIDENT]: 'Accident',
  [VEHICLE_CLAIM_OPTIONS.THEFT]: 'Theft',
  [VEHICLE_CLAIM_OPTIONS.FIRE]: 'Fire Damage',
  [VEHICLE_CLAIM_OPTIONS.NATURAL_DISASTER]: 'Natural Disaster'
};

export const COVERAGE_TYPES = {
  LIFE: {
    MEDICAL_EXPENSES: 'Medical Expenses',
    HOSPITALIZATION: 'Hospitalization',
    MEDICATION: 'Medication',
    CHANNELING: 'Channeling',
    DEATH_BENEFIT: 'Death Benefit',
    DISABILITY_BENEFIT: 'Disability Benefit'
  },
  VEHICLE: {
    VEHICLE_REPAIR: 'Vehicle Repair',
    VEHICLE_REPLACEMENT: 'Vehicle Replacement',
    THIRD_PARTY_DAMAGE: 'Third Party Damage',
    PERSONAL_INJURY: 'Personal Injury',
    TOWING: 'Towing',
    RENTAL_CAR: 'Rental Car'
  }
};

export const USER_ROLES = {
  EMPLOYEE: 'employee',
  HR_OFFICER: 'hr_officer',
  INSURANCE_AGENT: 'insurance_agent',
  ADMIN: 'admin'
};

export const QUESTION_TYPES = {
  TEXT: 'text',
  NUMBER: 'number',
  DATE: 'date',
  BOOLEAN: 'boolean',
  SELECT: 'select',
  MULTISELECT: 'multiselect',
  FILE: 'file'
};

export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [5, 10, 20, 50],
  MAX_PAGE_SIZE: 100
};

export const VALIDATION_LIMITS = {
  CLAIM_AMOUNT: {
    MIN: 1,
    MAX: 1000000
  },
  TEXT_FIELDS: {
    HR_NOTES: 1000,
    RETURN_REASON: 500,
    INSURER_NOTES: 1000,
    REJECTION_REASON: 1000,
    COVERAGE_NOTES: 200
  },
  RETURN_REASON_MIN_LENGTH: 10,
  FILE_SIZE: {
    MAX_SIZE: 10 * 1024 * 1024, // 10MB
    ALLOWED_TYPES: [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/gif',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ]
  }
};

export const DATE_FORMATS = {
  DISPLAY: 'MMM dd, yyyy',
  DISPLAY_WITH_TIME: 'MMM dd, yyyy hh:mm a',
  INPUT: 'yyyy-MM-dd',
  API: 'yyyy-MM-ddTHH:mm:ss.sssZ'
};

export const COMMON_RETURN_REASONS = [
  'Incomplete documentation',
  'Missing required information in questionnaire',
  'Invalid or unclear supporting documents',
  'Claim amount requires justification',
  'Additional medical reports needed',
  'Policy coverage verification required',
  'Inconsistent information provided',
  'Duplicate claim submission detected',
  'Policy not active during incident period',
  'Exceeded policy coverage limits',
  'Other (please specify in details below)'
];

export const PRIORITY_LEVELS = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent'
};

export const PRIORITY_COLORS = {
  [PRIORITY_LEVELS.LOW]: {
    bg: 'bg-gray-100',
    text: 'text-gray-600',
    dot: 'bg-gray-400'
  },
  [PRIORITY_LEVELS.MEDIUM]: {
    bg: 'bg-blue-100',
    text: 'text-blue-600',
    dot: 'bg-blue-400'
  },
  [PRIORITY_LEVELS.HIGH]: {
    bg: 'bg-yellow-100',
    text: 'text-yellow-600',
    dot: 'bg-yellow-400'
  },
  [PRIORITY_LEVELS.URGENT]: {
    bg: 'bg-red-100',
    text: 'text-red-600',
    dot: 'bg-red-400'
  }
};

export const SORT_OPTIONS = {
  CLAIM_ID: 'claimId',
  EMPLOYEE_NAME: 'employeeId',
  CLAIM_TYPE: 'claimType',
  CLAIM_AMOUNT: 'claimAmount.requested',
  STATUS: 'claimStatus',
  SUBMITTED_AT: 'submittedAt',
  CREATED_AT: 'createdAt',
  UPDATED_AT: 'updatedAt'
};

export const SORT_DIRECTIONS = {
  ASC: 'asc',
  DESC: 'desc'
};

export const API_ENDPOINTS = {
  CLAIMS: '/claims',
  CLAIMS_REQUIRING_ACTION: '/claims/requiring-action',
  CLAIM_STATISTICS: '/claims/statistics',
  QUESTIONNAIRE: (claimId) => `/claims/${claimId}/questionnaire`,
  SUBMIT_CLAIM: (claimId) => `/claims/${claimId}/submit`,
  FORWARD_CLAIM: (claimId) => `/claims/${claimId}/forward`,
  RETURN_CLAIM: (claimId) => `/claims/${claimId}/return`,
  MAKE_DECISION: (claimId) => `/claims/${claimId}/decision`,
  DOCUMENTS: '/documents',
  UPLOAD_DOCUMENT: '/documents/upload',
  DOWNLOAD_DOCUMENT: (docId) => `/documents/${docId}/download`
};

export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection and try again.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  FORBIDDEN: 'Access denied. Please contact your administrator.',
  NOT_FOUND: 'The requested resource was not found.',
  SERVER_ERROR: 'An unexpected server error occurred. Please try again later.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  FILE_TOO_LARGE: 'File size exceeds the maximum limit of 10MB.',
  INVALID_FILE_TYPE: 'Invalid file type. Please upload a supported file format.',
  CLAIM_NOT_FOUND: 'Claim not found or you do not have permission to view it.',
  INVALID_CLAIM_STATUS: 'Cannot perform this action on the current claim status.',
  QUESTIONNAIRE_INCOMPLETE: 'Questionnaire must be completed before submission.'
};

export const SUCCESS_MESSAGES = {
  CLAIM_CREATED: 'Claim created successfully',
  CLAIM_SUBMITTED: 'Claim submitted for HR review',
  CLAIM_FORWARDED: 'Claim forwarded to insurer successfully',
  CLAIM_RETURNED: 'Claim returned to employee successfully',
  DECISION_MADE: 'Decision recorded successfully',
  ANSWER_UPDATED: 'Answer updated successfully',
  DOCUMENT_UPLOADED: 'Document uploaded successfully',
  FILTERS_APPLIED: 'Filters applied successfully',
  DATA_REFRESHED: 'Data refreshed successfully'
};

export const LOADING_MESSAGES = {
  LOADING_CLAIMS: 'Loading claims...',
  SUBMITTING_CLAIM: 'Submitting claim...',
  FORWARDING_CLAIM: 'Forwarding to insurer...',
  RETURNING_CLAIM: 'Returning to employee...',
  MAKING_DECISION: 'Recording decision...',
  UPLOADING_DOCUMENT: 'Uploading document...',
  LOADING_STATISTICS: 'Loading statistics...',
  REFRESHING_DATA: 'Refreshing data...'
};

export const TABLE_CONFIG = {
  DEFAULT_SORT: {
    field: SORT_OPTIONS.CREATED_AT,
    direction: SORT_DIRECTIONS.DESC
  },
  COLUMNS: {
    CLAIM_ID: { key: 'claimId', label: 'Claim ID', sortable: true, width: '120px' },
    EMPLOYEE: { key: 'employee', label: 'Employee', sortable: true, width: '200px' },
    TYPE: { key: 'claimType', label: 'Type', sortable: true, width: '150px' },
    AMOUNT: { key: 'claimAmount', label: 'Amount', sortable: true, width: '120px' },
    STATUS: { key: 'claimStatus', label: 'Status', sortable: true, width: '150px' },
    SUBMITTED: { key: 'submittedAt', label: 'Submitted', sortable: true, width: '120px' },
    ACTIONS: { key: 'actions', label: 'Actions', sortable: false, width: '120px' }
  }
};

export const MODAL_SIZES = {
  SMALL: 'max-w-md',
  MEDIUM: 'max-w-2xl',
  LARGE: 'max-w-4xl',
  EXTRA_LARGE: 'max-w-6xl'
};

export const BREAKPOINTS = {
  SM: '640px',
  MD: '768px',
  LG: '1024px',
  XL: '1280px',
  '2XL': '1536px'
};

// Utility functions for working with constants
export const getClaimStatusColor = (status) => {
  return CLAIM_STATUS_COLORS[status] || CLAIM_STATUS_COLORS[CLAIM_STATUSES.DRAFT];
};

export const getClaimStatusLabel = (status) => {
  return CLAIM_STATUS_LABELS[status] || status;
};

export const getClaimTypeLabel = (type) => {
  return CLAIM_TYPE_LABELS[type] || type;
};

export const getClaimOptionLabel = (claimType, option) => {
  if (claimType === CLAIM_TYPES.LIFE) {
    return LIFE_CLAIM_OPTION_LABELS[option] || option;
  } else if (claimType === CLAIM_TYPES.VEHICLE) {
    return VEHICLE_CLAIM_OPTION_LABELS[option] || option;
  }
  return option;
};

export const getCoverageTypes = (claimType) => {
  return COVERAGE_TYPES[claimType.toUpperCase()] || {};
};

export const isValidFileType = (fileType) => {
  return VALIDATION_LIMITS.FILE_SIZE.ALLOWED_TYPES.includes(fileType);
};

export const isValidFileSize = (fileSize) => {
  return fileSize <= VALIDATION_LIMITS.FILE_SIZE.MAX_SIZE;
};

export const canPerformAction = (userRole, claimStatus, action) => {
  const permissions = {
    [USER_ROLES.HR_OFFICER]: {
      view: [CLAIM_STATUSES.HR, CLAIM_STATUSES.INSURER, CLAIM_STATUSES.APPROVED, CLAIM_STATUSES.REJECTED],
      forward: [CLAIM_STATUSES.HR],
      return: [CLAIM_STATUSES.HR]
    },
    [USER_ROLES.INSURANCE_AGENT]: {
      view: [CLAIM_STATUSES.INSURER, CLAIM_STATUSES.APPROVED, CLAIM_STATUSES.REJECTED],
      approve: [CLAIM_STATUSES.INSURER],
      reject: [CLAIM_STATUSES.INSURER],
      return: [CLAIM_STATUSES.INSURER]
    },
    [USER_ROLES.EMPLOYEE]: {
      view: [CLAIM_STATUSES.EMPLOYEE],
      submit: [CLAIM_STATUSES.EMPLOYEE]
    },
    [USER_ROLES.ADMIN]: {
      view: Object.values(CLAIM_STATUSES),
      forward: [CLAIM_STATUSES.HR],
      return: [CLAIM_STATUSES.HR, CLAIM_STATUSES.INSURER],
      approve: [CLAIM_STATUSES.INSURER],
      reject: [CLAIM_STATUSES.INSURER]
    }
  };

  const userPermissions = permissions[userRole];
  if (!userPermissions) return false;

  const actionStatuses = userPermissions[action];
  if (!actionStatuses) return false;

  return actionStatuses.includes(claimStatus);
};