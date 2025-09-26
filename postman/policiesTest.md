# Policy Routes - Postman Test Payloads

## Authentication Setup
For all requests, add to Headers:
```
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
```

## 1. Create Policy
**POST** `{{baseUrl}}/api/v1/policies`
**Role Required:** Admin

### Life Insurance Policy - Individual
```json
{
  "policyType": "life",
  "policyCategory": "individual",
  "insuranceAgent": "64f123456789abcdef123456",
  "coverage": {
    "coverageAmount": 100000,
    "deductible": 1000,
    "typeLife": ["life_cover", "hospitalization", "surgical_benefits"],
    "coverageDetails": [
      {
        "type": "life_cover",
        "description": "Life insurance coverage for natural death",
        "limit": 100000
      },
      {
        "type": "hospitalization",
        "description": "Hospital expenses coverage",
        "limit": 50000
      }
    ]
  },
  "validity": {
    "startDate": "2024-01-01",
    "endDate": "2025-01-01"
  },
  "premium": {
    "amount": 2400,
    "frequency": "annual"
  },
  "beneficiaries": ["64f123456789abcdef123457", "64f123456789abcdef123458"],
  "notes": "Standard life insurance policy for employee"
}
```

### Vehicle Insurance Policy - Group
```json
{
  "policyType": "vehicle",
  "policyCategory": "group",
  "insuranceAgent": "64f123456789abcdef123456",
  "coverage": {
    "coverageAmount": 50000,
    "deductible": 500,
    "typeVehicle": ["collision", "liability", "comprehensive"],
    "coverageDetails": [
      {
        "type": "collision",
        "description": "Collision damage coverage",
        "limit": 25000
      },
      {
        "type": "liability",
        "description": "Third party liability coverage",
        "limit": 30000
      }
    ]
  },
  "validity": {
    "startDate": "2024-01-01",
    "endDate": "2025-01-01"
  },
  "premium": {
    "amount": 1200,
    "frequency": "annual"
  },
  "beneficiaries": ["64f123456789abcdef123457"],
  "notes": "Corporate vehicle insurance policy"
}
```

## 2. Get All Policies
**GET** `{{baseUrl}}/api/v1/policies`
**Role Required:** Admin, HR Officer

### Query Parameters (all optional):
```
?policyType=life
&policyCategory=individual
&status=active
&insuranceAgent=64f123456789abcdef123456
&page=1
&limit=10
&search=LI0001
```

## 3. Get Policy by ID
**GET** `{{baseUrl}}/api/v1/policies/64f123456789abcdef123459`
**Role Required:** Admin, HR Officer, Insurance Agent

## 4. Get Policy by Policy ID
**GET** `{{baseUrl}}/api/v1/policies/policy-id/LI0001`
**Role Required:** Admin, HR Officer, Insurance Agent

## 5. Update Policy
**PATCH** `{{baseUrl}}/api/v1/policies/64f123456789abcdef123459`
**Role Required:** Admin

```json
{
  "coverage": {
    "coverageAmount": 120000,
    "deductible": 1200
  },
  "premium": {
    "amount": 2800,
    "frequency": "annual"
  },
  "notes": "Updated coverage amount and premium"
}
```

## 6. Delete Policy
**DELETE** `{{baseUrl}}/api/v1/policies/64f123456789abcdef123459`
**Role Required:** Admin

No body required.

## 7. Update Policy Status
**PATCH** `{{baseUrl}}/api/v1/policies/64f123456789abcdef123459/status`
**Role Required:** Admin, HR Officer

```json
{
  "status": "suspended"
}
```

Valid statuses: `active`, `expired`, `cancelled`, `suspended`, `pending`

## 8. Renew Policy
**PATCH** `{{baseUrl}}/api/v1/policies/64f123456789abcdef123459/renew`
**Role Required:** Admin

```json
{
  "newEndDate": "2026-01-01",
  "newPremiumAmount": 2600
}
```

## 9. Add Beneficiary
**PATCH** `{{baseUrl}}/api/v1/policies/64f123456789abcdef123459/beneficiaries/add`
**Role Required:** Admin, HR Officer

```json
{
  "beneficiaryId": "64f123456789abcdef123460"
}
```

## 10. Remove Beneficiary
**PATCH** `{{baseUrl}}/api/v1/policies/64f123456789abcdef123459/beneficiaries/remove`
**Role Required:** Admin, HR Officer

```json
{
  "beneficiaryId": "64f123456789abcdef123460"
}
```

## 11. Get My Policies (User)
**GET** `{{baseUrl}}/api/v1/policies/my-policies`
**Role Required:** Any authenticated user

### Query Parameters (optional):
```
?status=active
&policyType=life
```

## 12. Get My Agent Policies
**GET** `{{baseUrl}}/api/v1/policies/my-agent-policies`
**Role Required:** Insurance Agent

### Query Parameters (optional):
```
?status=active
&policyType=life
&policyCategory=individual
```

## 13. Get Policy Statistics
**GET** `{{baseUrl}}/api/v1/policies/stats/overview`
**Role Required:** Admin, HR Officer

No body required. Returns comprehensive policy statistics.

## 14. Get Expiring Policies
**GET** `{{baseUrl}}/api/v1/policies/stats/expiring`
**Role Required:** Admin, HR Officer

### Query Parameters (optional):
```
?days=30
```

## 15. Get Policy Usage
**GET** `{{baseUrl}}/api/v1/policies/64f123456789abcdef123459/usage`
**Role Required:** Admin, HR Officer

No body required. Returns policy usage summary.

## 16. Get Policies by Agent
**GET** `{{baseUrl}}/api/v1/policies/agent/64f123456789abcdef123456`
**Role Required:** Admin, HR Officer

### Query Parameters (optional):
```
?status=active
&policyType=life
```

## 17. Check Policy Eligibility
**GET** `{{baseUrl}}/api/v1/policies/eligibility/life`
**GET** `{{baseUrl}}/api/v1/policies/eligibility/vehicle`
**Role Required:** Any authenticated user

No body required. Checks if current user is eligible for the specified policy type.

## 18. Bulk Update Status
**PATCH** `{{baseUrl}}/api/v1/policies/bulk/status`
**Role Required:** Admin

```json
{
  "policyIds": [
    "64f123456789abcdef123459",
    "64f123456789abcdef123460",
    "64f123456789abcdef123461"
  ],
  "status": "suspended"
}
```

## Environment Variables
Set up these variables in Postman:

```
baseUrl: http://localhost:5000
adminToken: YOUR_ADMIN_JWT_TOKEN
hrToken: YOUR_HR_OFFICER_JWT_TOKEN
agentToken: YOUR_INSURANCE_AGENT_JWT_TOKEN
userToken: YOUR_USER_JWT_TOKEN
```

## Sample Object IDs
Use these sample MongoDB ObjectIds for testing:

```
Insurance Agent ID: 64f123456789abcdef123456
Employee ID 1: 64f123456789abcdef123457
Employee ID 2: 64f123456789abcdef123458
Policy ID: 64f123456789abcdef123459
Document ID: 64f123456789abcdef123461
```

## Error Response Examples
### 400 Bad Request
```json
{
  "success": false,
  "msg": "One or more beneficiaries are invalid"
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "msg": "Authentication invalid"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "msg": "Access denied. Insufficient permissions"
}
```

### 404 Not Found
```json
{
  "success": false,
  "msg": "No policy with id: 64f123456789abcdef123459"
}
```

## Success Response Examples
### Policy Created
```json
{
  "success": true,
  "message": "Policy created successfully",
  "policy": {
    "_id": "64f123456789abcdef123459",
    "policyId": "LI0001",
    "policyType": "life",
    "policyCategory": "individual",
    "insuranceAgent": {
      "_id": "64f123456789abcdef123456",
      "firstName": "John",
      "lastName": "Agent",
      "email": "agent@company.com",
      "role": "insurance_agent"
    },
    "beneficiaries": [
      {
        "_id": "64f123456789abcdef123457",
        "firstName": "Jane",
        "lastName": "Doe",
        "email": "jane@company.com",
        "employeeId": "EMP001"
      }
    ],
    "status": "active",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

## Testing Notes
1. Replace all ObjectIds with actual IDs from your database
2. Ensure users have appropriate roles for testing different endpoints
3. Test both success and error scenarios
4. Verify that auto-generated policyIds follow the correct format (LI0001, VG0001, etc.)
5. Test pagination and filtering parameters thoroughly
6. Verify that policy validation rules are working (e.g., life policies can't have vehicle coverage types)