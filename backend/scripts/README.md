# Claimed Amounts Tracking System - Test Scripts

This directory contains comprehensive test scripts to validate the claimed amounts tracking functionality in the Lumiere insurance system.

## Overview

The claimed amounts tracking system allows you to:
- Track how much each employee has claimed from their allowed coverage amounts
- Validate claim approvals against remaining coverage limits
- Maintain accurate utilization records per coverage type per employee
- Automatically sync claimed amounts with beneficiary changes

## Test Scripts

### 1. Basic Seed Script
**File:** `seed-test-data.js`  
**Command:** `npm run seed` (when script is added to package.json)

Creates minimal test data:
- 5 user accounts (one per role: admin, hr_officer, insurance_agent, employee, executive)
- 1 life insurance policy with 4 coverage types
- 1 questionnaire template for hospitalization claims
- Fresh database ready for testing

**Usage:**
```bash
node scripts/seed-test-data.js
```

### 2. Advanced Seed Script with Sample Claims
**File:** `seed-with-sample-claims.js`  
**Command:** `npm run seed-with-claims` (when script is added to package.json)

Creates comprehensive test data including:
- All basic seed data (users, policy, template)
- 3 sample claims in different states:
  - ✅ Approved hospitalization claim ($4,500) 
  - ✅ Approved surgical_benefits claim ($7,000)
  - ⏳ Pending multi-coverage claim ($3,000)
- Pre-populated claimed amounts to test the tracking system

**Usage:**
```bash
node scripts/seed-with-sample-claims.js
```

### 3. Test Validation Script
**File:** `test-claimed-amounts.js`

Validates the claimed amounts system functionality:
- Tests array structure consistency
- Validates individual beneficiary tracking
- Tests claim amount validation logic
- Checks coverage utilization calculations
- Simulates adding new claims

**Usage:**
```bash
node scripts/test-claimed-amounts.js
```

## Test Accounts

All scripts create these test accounts:

| Email | Password | Role | Purpose |
|-------|----------|------|---------|
| `admin@lumiere.com` | `password123` | admin | Full system access |
| `hr@lumiere.com` | `password123` | hr_officer | Manage policies, forward claims |
| `agent@lumiere.com` | `password123` | insurance_agent | Approve/reject claims |
| `employee@lumiere.com` | `password123` | employee | Submit claims, check own amounts |
| `executive@lumiere.com` | `password123` | executive | Submit claims, check own amounts |

## Sample Policy Structure

The scripts create a life insurance policy with these coverage types:

| Coverage Type | Individual Limit | Description |
|---------------|------------------|-------------|
| `hospitalization` | $20,000 | Hospital stays and room charges |
| `surgical_benefits` | $15,000 | Surgical procedures |
| `outpatient` | $8,000 | Outpatient treatments |
| `prescription_drugs` | $7,000 | Prescription medications |

## Testing Workflow

### 1. Basic Testing (Fresh Database)
```bash
# 1. Run basic seed
node scripts/seed-test-data.js

# 2. Start the server
npm start

# 3. Test API endpoints:
# - Login as employee@lumiere.com
# - Check claimed amounts (should be all zeros)
# - Create a new claim
# - Progress through workflow: submit → hr forward → agent approve
# - Check claimed amounts again (should show approved amount)
```

### 2. Advanced Testing (Pre-populated Data)
```bash
# 1. Run advanced seed with claims
node scripts/seed-with-sample-claims.js

# 2. Run validation tests
node scripts/test-claimed-amounts.js

# 3. Start server and test APIs with existing data
npm start
```

### 3. API Endpoints to Test

**Get Individual Claimed Amounts:**
```http
GET /api/policies/{policyId}/claimed-amounts?beneficiaryId={userId}
Authorization: Bearer {token}
```

**Get Policy Summary (Admin/HR/Agent only):**
```http
GET /api/policies/{policyId}/claimed-amounts/summary
Authorization: Bearer {token}
```

**Create and Approve Claims:**
```http
POST /api/claims
PATCH /api/claims/{claimId}/forward
PATCH /api/claims/{claimId}/decision
```

## Expected Test Results

### After Advanced Seed:

**Employee (John Employee) Claimed Amounts:**
- hospitalization: $4,500 used / $20,000 limit (22.5% utilized)
- surgical_benefits: $7,000 used / $15,000 limit (46.7% utilized)
- outpatient: $0 used / $8,000 limit (0% utilized)
- prescription_drugs: $0 used / $7,000 limit (0% utilized)

**Executive (Jane Executive) Claimed Amounts:**
- All coverage types: $0 used (full coverage available)

### Validation Testing Scenarios:

1. **Valid Claim:** Employee requests $5,000 hospitalization (should pass - $15,500 remaining)
2. **Invalid Claim:** Employee requests $25,000 hospitalization (should fail - exceeds limit)
3. **Multi-Coverage Claim:** Approve pending executive claim (should pass)
4. **Limit Exceeded:** Try to approve more than remaining coverage (should fail)

## Troubleshooting

### Common Issues:

1. **MongoDB Connection:** Ensure MongoDB is running and connection string is correct
2. **Missing Dependencies:** Run `npm install` if bcrypt or mongoose errors occur
3. **Port Conflicts:** Stop existing server processes before testing
4. **Authentication Errors:** Use the exact email/password combinations provided

### Database Reset:

To start fresh:
```bash
# Clear database manually or run:
node scripts/seed-test-data.js  # This clears existing data first
```

### Viewing Data:

Use MongoDB Compass or CLI to inspect:
- `users` collection - Test accounts
- `policies` collection - Check `claimedAmounts` array
- `claims` collection - Sample claims and their status
- `questionnairetemplates` collection - Form structure

## Integration with Frontend

The frontend services (`insurance-api.js` and `policyService.js`) have been updated with methods to:
- `getBeneficiaryClaimedAmounts(policyId, beneficiaryId)`
- `getPolicyClaimedAmountsSummary(policyId)`
- `validateClaimAmount(policyId, beneficiaryId, coverageType, amount)`
- `previewClaimApproval(claimId, proposedAmount)`

Test these methods with the seeded data to ensure full system functionality.

## Next Steps

1. Run the scripts to set up test data
2. Test the API endpoints using Postman or your frontend
3. Validate the claimed amounts tracking through the complete claim workflow
4. Test edge cases like exceeding coverage limits
5. Verify that beneficiary changes properly sync the `claimedAmounts` array

The system is designed to be non-breaking and will work with existing policies while providing the new claimed amounts tracking functionality.