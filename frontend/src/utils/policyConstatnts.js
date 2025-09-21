// src/utils/policyConstants.js

export const POLICY_TYPES = {
  LIFE: 'life',
  VEHICLE: 'vehicle'
};

export const POLICY_CATEGORIES = {
  INDIVIDUAL: 'individual',
  GROUP: 'group'
};

export const POLICY_STATUS = {
  ACTIVE: 'active',
  EXPIRED: 'expired',
  CANCELLED: 'cancelled',
  SUSPENDED: 'suspended',
  PENDING: 'pending'
};

export const PREMIUM_FREQUENCY = {
  MONTHLY: 'monthly',
  QUARTERLY: 'quarterly',
  SEMI_ANNUAL: 'semi-annual',
  ANNUAL: 'annual'
};

export const LIFE_COVERAGE_TYPES = {
  LIFE_COVER: 'life_cover',
  HOSPITALIZATION: 'hospitalization',
  SURGICAL_BENEFITS: 'surgical_benefits',
  OUTPATIENT: 'outpatient',
  PRESCRIPTION_DRUGS: 'prescription_drugs'
};

export const VEHICLE_COVERAGE_TYPES = {
  COLLISION: 'collision',
  LIABILITY: 'liability',
  COMPREHENSIVE: 'comprehensive',
  PERSONAL_ACCIDENT: 'personal_accident'
};

// Display labels for UI
export const POLICY_TYPE_LABELS = {
  [POLICY_TYPES.LIFE]: 'Life Insurance',
  [POLICY_TYPES.VEHICLE]: 'Vehicle Insurance'
};

export const POLICY_CATEGORY_LABELS = {
  [POLICY_CATEGORIES.INDIVIDUAL]: 'Individual',
  [POLICY_CATEGORIES.GROUP]: 'Group'
};

export const POLICY_STATUS_LABELS = {
  [POLICY_STATUS.ACTIVE]: 'Active',
  [POLICY_STATUS.EXPIRED]: 'Expired',
  [POLICY_STATUS.CANCELLED]: 'Cancelled',
  [POLICY_STATUS.SUSPENDED]: 'Suspended',
  [POLICY_STATUS.PENDING]: 'Pending'
};

export const PREMIUM_FREQUENCY_LABELS = {
  [PREMIUM_FREQUENCY.MONTHLY]: 'Monthly',
  [PREMIUM_FREQUENCY.QUARTERLY]: 'Quarterly',
  [PREMIUM_FREQUENCY.SEMI_ANNUAL]: 'Semi-Annual',
  [PREMIUM_FREQUENCY.ANNUAL]: 'Annual'
};

export const LIFE_COVERAGE_LABELS = {
  [LIFE_COVERAGE_TYPES.LIFE_COVER]: 'Life Cover',
  [LIFE_COVERAGE_TYPES.HOSPITALIZATION]: 'Hospitalization',
  [LIFE_COVERAGE_TYPES.SURGICAL_BENEFITS]: 'Surgical Benefits',
  [LIFE_COVERAGE_TYPES.OUTPATIENT]: 'Outpatient',
  [LIFE_COVERAGE_TYPES.PRESCRIPTION_DRUGS]: 'Prescription Drugs'
};

export const VEHICLE_COVERAGE_LABELS = {
  [VEHICLE_COVERAGE_TYPES.COLLISION]: 'Collision',
  [VEHICLE_COVERAGE_TYPES.LIABILITY]: 'Liability',
  [VEHICLE_COVERAGE_TYPES.COMPREHENSIVE]: 'Comprehensive',
  [VEHICLE_COVERAGE_TYPES.PERSONAL_ACCIDENT]: 'Personal Accident'
};

// Status colors for UI
export const STATUS_COLORS = {
  [POLICY_STATUS.ACTIVE]: 'bg-green-100 text-green-800 border-green-200',
  [POLICY_STATUS.EXPIRED]: 'bg-red-100 text-red-800 border-red-200',
  [POLICY_STATUS.CANCELLED]: 'bg-red-100 text-red-800 border-red-200',
  [POLICY_STATUS.SUSPENDED]: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  [POLICY_STATUS.PENDING]: 'bg-blue-100 text-blue-800 border-blue-200'
};

// Policy type colors for UI
export const TYPE_COLORS = {
  [POLICY_TYPES.LIFE]: 'bg-blue-100 text-blue-800 border-blue-200',
  [POLICY_TYPES.VEHICLE]: 'bg-purple-100 text-purple-800 border-purple-200'
};

// Category colors for UI
export const CATEGORY_COLORS = {
  [POLICY_CATEGORIES.INDIVIDUAL]: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  [POLICY_CATEGORIES.GROUP]: 'bg-teal-100 text-teal-800 border-teal-200'
};

// HR allowed status changes
export const HR_ALLOWED_STATUS_CHANGES = {
  [POLICY_STATUS.ACTIVE]: [POLICY_STATUS.SUSPENDED, POLICY_STATUS.CANCELLED],
  [POLICY_STATUS.SUSPENDED]: [POLICY_STATUS.ACTIVE, POLICY_STATUS.CANCELLED],
  [POLICY_STATUS.PENDING]: [POLICY_STATUS.ACTIVE, POLICY_STATUS.CANCELLED],
  [POLICY_STATUS.CANCELLED]: [], // Cannot change from cancelled
  [POLICY_STATUS.EXPIRED]: [] // Cannot change from expired
};

// Filter options for dropdowns
export const POLICY_TYPE_OPTIONS = Object.entries(POLICY_TYPE_LABELS).map(([value, label]) => ({
  value,
  label
}));

export const POLICY_CATEGORY_OPTIONS = Object.entries(POLICY_CATEGORY_LABELS).map(([value, label]) => ({
  value,
  label
}));

export const POLICY_STATUS_OPTIONS = Object.entries(POLICY_STATUS_LABELS).map(([value, label]) => ({
  value,
  label
}));

export const PREMIUM_FREQUENCY_OPTIONS = Object.entries(PREMIUM_FREQUENCY_LABELS).map(([value, label]) => ({
  value,
  label
}));

// Default pagination settings
export const PAGINATION_DEFAULTS = {
  PAGE: 1,
  LIMIT: 10,
  LIMITS: [5, 10, 20, 50]
};

// Search configuration
export const SEARCH_CONFIG = {
  DEBOUNCE_DELAY: 300,
  MIN_SEARCH_LENGTH: 2
};

// Date format settings
export const DATE_FORMATS = {
  DISPLAY: 'MMM DD, YYYY',
  INPUT: 'YYYY-MM-DD',
  FULL: 'MMMM DD, YYYY',
  SHORT: 'MM/DD/YYYY'
};

// Currency configuration
export const CURRENCY_CONFIG = {
  LOCALE: 'en-US',
  CURRENCY: 'LKR', // Sri Lankan Rupee
  SYMBOL: 'Rs.'
};