# Postman Test Payloads for Policy Routes

## Authentication Setup
First, ensure you have the JWT token from login in your Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

## 1. Create Policy (Admin Only)
**POST** `/api/policies`

### Life Insurance Policy (Group)
```json
{
  "policyType": "life",
  "policyCategory": "group",
  "insuranceAgent": "64f1a2b3c4d5e6f7g8h9i0j1",
  "coverage": {
    "coverageAmount": 1000000,
    "deductible": 5000,
    "typeLife": ["life_cover", "hospitalization", "surgical_benefits"],
    "coverageDetails": [
      {
        "type": "life_cover",
        "description": "Basic life insurance coverage",
        "limit": 500000
      },
      {
        "type": "hospitalization",
        "description": "Hospital stay coverage",
        "limit": 300000
      },
      {
        "type": "surgical_benefits",
        "description": "Surgical procedure coverage",
        "limit": 200000
      }
    ]
  },
  "validity": {
    "startDate": "2025-01-01",
    "endDate": "2025-12-31"
  },
  "premium": {
    "amount": 25000,
    "frequency": "annual"
  },
  "beneficiaries": [
    "64f1a2b3c4d5e6f7g8h9i0j2",
    "64f1a2b3c4d5e6f7g8h9i0j3"
  ],
  "notes": "Group life insurance policy for Janashakthi employees"
}
```

### Vehicle Insurance Policy (Individual)
```json
{
  "policyType": "vehicle",
  "policyCategory": "individual",
  "insuranceAgent": "64f1a2b3c4d5e6f7g8h9i0j1",
  "coverage": {
    "coverageAmount": 2000000,
    "deductible": 25000,
    "typeVehicle": ["collision", "liability", "comprehensive"],
    "coverageDetails": [
      {
        "type": "collision",
        "description": "Vehicle collision damage coverage",
        "limit": 800000
      },
      {
        "type": "liability",
        "description": "Third party liability coverage",
        "limit": 1000000
      },
      {
        "type": "comprehensive",
        "description": "Comprehensive damage coverage",
        "limit": 200000
      }
    ]
  },
  "validity": {
    "startDate": "2025-01-01",
    "endDate": "2025-12-31"
  },
  "premium": {
    "amount": 45000,
    "frequency": "annual"
  },
  "beneficiaries": [
    "64f1a2b3c4d5e6f7g8h9i0j4"
  ],
  "notes": "Executive vehicle insurance policy"
}
```

## 2. Get All Policies (Admin/HR)
**GET** `/api/policies`

### Query Parameters Examples:
```
/api/policies?policyType=life
/api/policies?status=active&policyCategory=group
/api/policies?page=1&limit=5
/api/policies?search=LG0001
/api/policies?insuranceAgent=64f1a2b3c4d5e6f7g8h9i0j1
```

## 3. Get Policy by ID (Admin/HR/Agent)
**GET** `/api/policies/64f1a2b3c4d5e6f7g8h9i0j5`

**GET** `/api/policies/policy-id/LG0001`

## 4. Update Policy (Admin Only)
**PATCH** `/api/policies/64f1a2b3c4d5e6f7g8h9i0j5`

```json
{
  "coverage": {
    "coverageAmount": 1200000,
    "deductible": 6000
  },
  "premium": {
    "amount": 28000,
    "frequency": "annual"
  },
  "notes": "Updated coverage amount for 2025"
}
```

## 5. Update Policy Status (Admin/HR)
**PATCH** `/api/policies/64f1a2b3c4d5e6f7g8h9i0j5/status`

```json
{
  "status": "suspended"
}
```

### Valid status values:
- `"active"`
- `"expired"`
- `"cancelled"`
- `"suspended"`
- `"pending"`

## 6. Add Beneficiary (Admin/HR)
**PATCH** `/api/policies/64f1a2b3c4d5e6f7g8h9i0j5/beneficiaries/add`

```json
{
  "beneficiaryId": "64f1a2b3c4d5e6f7g8h9i0j6"
}
```

## 7. Remove Beneficiary (Admin/HR)
**PATCH** `/api/policies/64f1a2b3c4d5e6f7g8h9i0j5/beneficiaries/remove`

```json
{
  "beneficiaryId": "64f1a2b3c4d5e6f7g8h9i0j6"
}
```

## 8. Renew Policy (Admin Only)
**PATCH** `/api/policies/64f1a2b3c4d5e6f7g8h9i0j5/renew`

```json
{
  "newEndDate": "2026-12-31",
  "newPremiumAmount": 30000
}
```

## 9. Get User's Own Policies (Any authenticated user)
**GET** `/api/policies/my-policies`

### Query Parameters:
```
/api/policies/my-policies?policyType=life
/api/policies/my-policies?status=active
```

## 10. Get Agent's Policies (Insurance Agent only)
**GET** `/api/policies/my-agent-policies`

### Query Parameters:
```
/api/policies/my-agent-policies?status=active
/api/policies/my-agent-policies?policyType=vehicle&policyCategory=individual
```

## 11. Check Policy Eligibility (Any authenticated user)
**GET** `/api/policies/eligibility/life`
**GET** `/api/policies/eligibility/vehicle`

## 12. Get Policy Statistics (Admin/HR)
**GET** `/api/policies/stats/overview`

## 13. Get Expiring Policies (Admin/HR)
**GET** `/api/policies/stats/expiring`

### Query Parameters:
```
/api/policies/stats/expiring?days=30
/api/policies/stats/expiring?days=7
```

## 14. Get Policy Usage (Admin/HR)
**GET** `/api/policies/64f1a2b3c4d5e6f7g8h9i0j5/usage`

## 15. Get Policies by Agent (Admin/HR)
**GET** `/api/policies/agent/64f1a2b3c4d5e6f7g8h9i0j1`

### Query Parameters:
```
/api/policies/agent/64f1a2b3c4d5e6f7g8h9i0j1?status=active
/api/policies/agent/64f1a2b3c4d5e6f7g8h9i0j1?policyType=life
```

## 16. Bulk Update Status (Admin Only)
**PATCH** `/api/policies/bulk/status`

```json
{
  "policyIds": [
    "64f1a2b3c4d5e6f7g8h9i0j5",
    "64f1a2b3c4d5e6f7g8h9i0j6",
    "64f1a2b3c4d5e6f7g8h9i0j7"
  ],
  "status": "expired"
}
```

## Error Response Examples

### 401 Unauthorized (Missing/Invalid Token)
```json
{
  "success": false,
  "message": "Access token is required"
}
```

### 403 Forbidden (Wrong Role)
```json
{
  "success": false,
  "message": "Access denied. Insufficient permissions"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "No policy with id: 64f1a2b3c4d5e6f7g8h9i0j5"
}
```

### 400 Bad Request (Validation Error)
```json
{
  "success": false,
  "message": "Life policy must have at least one life coverage type"
}
```

## Testing Notes

1. **Authentication Required**: All routes require a valid JWT token in the Authorization header
2. **Role-Based Access**: Make sure to test with different user roles (admin, hr_officer, insurance_agent, employee, executive)
3. **ObjectId Format**: Replace the example ObjectIds with actual MongoDB ObjectIds from your database
4. **Date Format**: Use ISO 8601 format for dates (YYYY-MM-DD)
5. **Enum Values**: Ensure you use exact enum values as defined in your Policy model