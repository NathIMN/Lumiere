// src/utils/policyConstants.js

// Policy type labels
export const POLICY_TYPE_LABELS = {
  life: 'Life Insurance',
  vehicle: 'Vehicle Insurance'
};

// Policy status labels
export const POLICY_STATUS_LABELS = {
  active: 'Active',
  suspended: 'Suspended',
  cancelled: 'Cancelled',
  expired: 'Expired',
  pending: 'Pending',
  draft: 'Draft'
};

// Policy category labels
export const POLICY_CATEGORY_LABELS = {
  individual: 'Individual Policy',
  group: 'Group Policy'
};

// Premium frequency labels
export const PREMIUM_FREQUENCY_LABELS = {
  monthly: 'Monthly',
  quarterly: 'Quarterly',
  semi_annually: 'Semi-Annually',
  annually: 'Annually'
};

// Life insurance coverage type labels
export const LIFE_COVERAGE_LABELS = {
  life_cover: 'Life Cover',
  hospitalization: 'Hospitalization',
  surgical_benefits: 'Surgical Benefits',
  outpatient: 'Outpatient',
  prescription_drugs: 'Prescription Drugs',
  dental: 'Dental Coverage',
  vision: 'Vision Coverage',
  maternity: 'Maternity Coverage',
  critical_illness: 'Critical Illness',
  disability: 'Disability Coverage'
};

// Vehicle insurance coverage type labels
export const VEHICLE_COVERAGE_LABELS = {
  collision: 'Collision',
  liability: 'Liability',
  comprehensive: 'Comprehensive',
  personal_accident: 'Personal Accident',
  third_party: 'Third Party',
  theft: 'Theft Protection',
  fire: 'Fire Protection',
  natural_disaster: 'Natural Disaster',
  windscreen: 'Windscreen Coverage'
};

// Currency configuration
export const CURRENCY_CONFIG = {
  code: 'LKR',
  symbol: 'Rs.',
  locale: 'en-LK',
  name: 'Sri Lankan Rupee'
};

// Combined coverage labels for easier access
export const COVERAGE_LABELS = {
  life: LIFE_COVERAGE_LABELS,
  vehicle: VEHICLE_COVERAGE_LABELS
};

// Policy ID patterns
export const POLICY_ID_PATTERNS = {
  life_individual: 'LI',
  life_group: 'LG',
  vehicle_individual: 'VI',
  vehicle_group: 'VG'
};

// Status color mapping for UI
export const STATUS_COLORS = {
  active: {
    bg: 'bg-green-100 dark:bg-green-900/20',
    text: 'text-green-800 dark:text-green-200',
    border: 'border-green-200 dark:border-green-800'
  },
  suspended: {
    bg: 'bg-yellow-100 dark:bg-yellow-900/20',
    text: 'text-yellow-800 dark:text-yellow-200',
    border: 'border-yellow-200 dark:border-yellow-800'
  },
  cancelled: {
    bg: 'bg-red-100 dark:bg-red-900/20',
    text: 'text-red-800 dark:text-red-200',
    border: 'border-red-200 dark:border-red-800'
  },
  expired: {
    bg: 'bg-red-100 dark:bg-red-900/20',
    text: 'text-red-800 dark:text-red-200',
    border: 'border-red-200 dark:border-red-800'
  },
  pending: {
    bg: 'bg-blue-100 dark:bg-blue-900/20',
    text: 'text-blue-800 dark:text-blue-200',
    border: 'border-blue-200 dark:border-blue-800'
  },
  draft: {
    bg: 'bg-gray-100 dark:bg-gray-900/20',
    text: 'text-gray-800 dark:text-gray-200',
    border: 'border-gray-200 dark:border-gray-800'
  }
};

// Priority levels for policies
export const POLICY_PRIORITIES = {
  high: 'High Priority',
  medium: 'Medium Priority',
  low: 'Low Priority'
};

// Default values
export const DEFAULT_VALUES = {
  pagination: {
    page: 1,
    limit: 10,
    maxLimit: 100
  },
  search: {
    minLength: 3,
    debounceMs: 300
  },
  expiry: {
    warningDays: 30,
    criticalDays: 7
  }
};

// Validation rules
export const VALIDATION_RULES = {
  policyId: {
    pattern: /^[LV][IG]\d{4}$/,
    message: 'Policy ID must follow format: LI0001, LG0001, VI0001, or VG0001'
  },
  coverageAmount: {
    min: 1000,
    max: 10000000,
    message: 'Coverage amount must be between Rs. 1,000 and Rs. 10,000,000'
  },
  premiumAmount: {
    min: 100,
    max: 500000,
    message: 'Premium amount must be between Rs. 100 and Rs. 500,000'
  }
};

// Export types for TypeScript (if needed)
export const POLICY_TYPES = {
  LIFE: 'life',
  VEHICLE: 'vehicle'
};

export const POLICY_CATEGORIES = {
  INDIVIDUAL: 'individual',
  GROUP: 'group'
};

export const POLICY_STATUSES = {
  ACTIVE: 'active',
  SUSPENDED: 'suspended',
  CANCELLED: 'cancelled',
  EXPIRED: 'expired',
  PENDING: 'pending',
  DRAFT: 'draft'
};