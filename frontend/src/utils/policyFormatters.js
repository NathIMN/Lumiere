// src/utils/policyFormatter.js
import { 
  POLICY_TYPE_LABELS, 
  POLICY_STATUS_LABELS, 
  POLICY_CATEGORY_LABELS,
  PREMIUM_FREQUENCY_LABELS,
  LIFE_COVERAGE_LABELS,
  VEHICLE_COVERAGE_LABELS,
  CURRENCY_CONFIG 
} from './policyConstants';

// Format currency in Sri Lankan Rupees
export const formatCurrency = (amount) => {
  if (amount === null || amount === undefined) return 'N/A';
  
  const numAmount = Number(amount);
  if (isNaN(numAmount)) return 'N/A';
  
  return new Intl.NumberFormat('en-LK', {
    style: 'currency',
    currency: 'LKR',
    minimumFractionDigits: 2
  }).format(numAmount);
};

// Format currency without symbol (for inputs)
export const formatAmount = (amount) => {
  if (amount === null || amount === undefined) return '';
  
  const numAmount = Number(amount);
  if (isNaN(numAmount)) return '';
  
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2
  }).format(numAmount);
};

// Format date for display
export const formatDate = (date, format = 'short') => {
  if (!date) return 'N/A';
  
  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) return 'Invalid Date';
  
  const options = {
    short: { year: 'numeric', month: 'short', day: 'numeric' },
    long: { year: 'numeric', month: 'long', day: 'numeric' },
    full: { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      weekday: 'long' 
    }
  };
  
  return dateObj.toLocaleDateString('en-US', options[format] || options.short);
};

// Calculate days until expiry
export const getDaysUntilExpiry = (endDate) => {
  if (!endDate) return null;
  
  const today = new Date();
  const expiry = new Date(endDate);
  const diffTime = expiry.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
};

// Format expiry status
export const formatExpiryStatus = (endDate) => {
  const daysUntil = getDaysUntilExpiry(endDate);
  
  if (daysUntil === null) return { text: 'N/A', color: 'text-gray-500' };
  if (daysUntil < 0) return { text: `Expired ${Math.abs(daysUntil)} days ago`, color: 'text-red-600' };
  if (daysUntil === 0) return { text: 'Expires today', color: 'text-red-600' };
  if (daysUntil <= 7) return { text: `Expires in ${daysUntil} days`, color: 'text-red-600' };
  if (daysUntil <= 30) return { text: `Expires in ${daysUntil} days`, color: 'text-yellow-600' };
  
  return { text: `Expires in ${daysUntil} days`, color: 'text-green-600' };
};

// Format policy type label
export const formatPolicyType = (policyType) => {
  return POLICY_TYPE_LABELS[policyType] || policyType;
};

// Format policy status label
export const formatPolicyStatus = (status) => {
  return POLICY_STATUS_LABELS[status] || status;
};

// Format policy category label
export const formatPolicyCategory = (category) => {
  return POLICY_CATEGORY_LABELS[category] || category;
};

// Format premium frequency
export const formatPremiumFrequency = (frequency) => {
  return PREMIUM_FREQUENCY_LABELS[frequency] || frequency;
};

// Format coverage types
export const formatCoverageTypes = (policyType, coverageTypes) => {
  if (!coverageTypes || !Array.isArray(coverageTypes)) return 'N/A';
  
  const labels = policyType === 'life' ? LIFE_COVERAGE_LABELS : VEHICLE_COVERAGE_LABELS;
  
  return coverageTypes
    .map(type => labels[type] || type)
    .join(', ');
};

// Format beneficiaries list
export const formatBeneficiaries = (beneficiaries) => {
  if (!beneficiaries || !Array.isArray(beneficiaries)) return 'No beneficiaries';
  if (beneficiaries.length === 0) return 'No beneficiaries';
  
  if (beneficiaries.length === 1) {
    const beneficiary = beneficiaries[0];
    return `${beneficiary.firstName} ${beneficiary.lastName}`;
  }
  
  return `${beneficiaries.length} beneficiaries`;
};

// Format insurance agent name
export const formatAgentName = (agent) => {
  if (!agent) return 'N/A';
  return `${agent.firstName} ${agent.lastName}`;
};

// Calculate policy duration in months
export const calculatePolicyDuration = (startDate, endDate) => {
  if (!startDate || !endDate) return 0;
  
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  const months = (end.getFullYear() - start.getFullYear()) * 12 + 
                 (end.getMonth() - start.getMonth());
  
  return months;
};

// Format policy duration
export const formatPolicyDuration = (startDate, endDate) => {
  const months = calculatePolicyDuration(startDate, endDate);
  
  if (months === 0) return 'Less than a month';
  if (months < 12) return `${months} month${months !== 1 ? 's' : ''}`;
  
  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;
  
  let duration = `${years} year${years !== 1 ? 's' : ''}`;
  if (remainingMonths > 0) {
    duration += ` and ${remainingMonths} month${remainingMonths !== 1 ? 's' : ''}`;
  }
  
  return duration;
};

// Generate policy search terms for filtering
export const generateSearchTerms = (policy) => {
  const terms = [
    policy.policyId,
    policy.policyType,
    policy.policyCategory,
    policy.status,
    formatPolicyType(policy.policyType),
    formatPolicyStatus(policy.status),
    formatPolicyCategory(policy.policyCategory)
  ];
  
  // Add agent name
  if (policy.insuranceAgent) {
    terms.push(
      `${policy.insuranceAgent.firstName} ${policy.insuranceAgent.lastName}`,
      policy.insuranceAgent.firstName,
      policy.insuranceAgent.lastName,
      policy.insuranceAgent.email
    );
  }
  
  // Add beneficiary names
  if (policy.beneficiaries && Array.isArray(policy.beneficiaries)) {
    policy.beneficiaries.forEach(beneficiary => {
      terms.push(
        `${beneficiary.firstName} ${beneficiary.lastName}`,
        beneficiary.firstName,
        beneficiary.lastName,
        beneficiary.email,
        beneficiary.employeeId
      );
    });
  }
  
  return terms.filter(term => term).join(' ').toLowerCase();
};

// Validate policy ID format
export const validatePolicyId = (policyId) => {
  if (!policyId) return false;
  
  // Check format: LI0001, LG0001, VI0001, VG0001
  const regex = /^[LV][IG]\d{4}$/;
  return regex.test(policyId.toUpperCase());
};

// Parse policy ID to get type and category
export const parsePolicyId = (policyId) => {
  if (!validatePolicyId(policyId)) return null;
  
  const upperPolicyId = policyId.toUpperCase();
  const typeChar = upperPolicyId[0];
  const categoryChar = upperPolicyId[1];
  
  const policyType = typeChar === 'L' ? 'life' : 'vehicle';
  const policyCategory = categoryChar === 'I' ? 'individual' : 'group';
  
  return { policyType, policyCategory };
};

// Format policy summary for cards/tables
export const formatPolicySummary = (policy) => {
  return {
    id: policy._id,
    policyId: policy.policyId,
    type: formatPolicyType(policy.policyType),
    category: formatPolicyCategory(policy.policyCategory),
    status: formatPolicyStatus(policy.status),
    coverageAmount: formatCurrency(policy.coverage?.coverageAmount),
    premiumAmount: formatCurrency(policy.premium?.amount),
    premiumFrequency: formatPremiumFrequency(policy.premium?.frequency),
    startDate: formatDate(policy.validity?.startDate),
    endDate: formatDate(policy.validity?.endDate),
    expiryStatus: formatExpiryStatus(policy.validity?.endDate),
    agent: formatAgentName(policy.insuranceAgent),
    beneficiaries: formatBeneficiaries(policy.beneficiaries),
    duration: formatPolicyDuration(policy.validity?.startDate, policy.validity?.endDate)
  };
};