# Lumiere Claims Process - Postman Testing Guide

This guide provides comprehensive Postman payloads to test the entire claims process from creation to final decision.

## Base Configuration

**Base URL:** `http://localhost:5000/api/v1`
**Authentication:** Bearer Token (obtain from login endpoint)

### Prerequisites
1. Set up environment variables in Postman:
   - `base_url`: `http://localhost:5000/api/v1`
   - `auth_token`: Your JWT token (obtained from user login)
   - `employee_id`: User ID of an employee
   - `policy_id`: Valid policy ID
   - `claim_id`: Claim ID (will be obtained from create claim response)

---

## 1. User Authentication

### Login as Employee
```http
POST {{base_url}}/users/login
```
**Body (JSON):**
```json
{
  "email": "employee@example.com",
  "password": "password123"
}
```
**Expected Response:**
```json
{
  "success": true,
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "role": "employee",
    "firstName": "John",
    "lastName": "Doe"
  }
}
```

### Login as HR Officer
```http
POST {{base_url}}/users/login
```
**Body (JSON):**
```json
{
  "email": "hr@example.com",
  "password": "password123"
}
```

### Login as Insurance Agent
```http
POST {{base_url}}/users/login
```
**Body (JSON):**
```json
{
  "email": "agent@example.com",
  "password": "password123"
}
```

---

## 2. Claims Creation & Management

### Create New Claim (Draft Status)
```http
POST {{base_url}}/claims
Authorization: Bearer {{auth_token}}
```
**Body (JSON):**
```json
{
  "policy": "{{policy_id}}",
  "claimType": "life",
  "claimOption": "hospitalization"
}
```
**Alternative for Vehicle Claim:**
```json
{
  "policy": "{{policy_id}}",
  "claimType": "vehicle",
  "claimOption": "accident"
}
```
**Expected Response:**
```json
{
  "success": true,
  "message": "Claim created and questionnaire loaded successfully",
  "claim": {
    "_id": "claim_id_here",
    "claimId": "LUM-CLM-001",
    "claimStatus": "draft",
    "claimType": "life",
    "lifeClaimOption": "hospitalization",
    "questionnaire": {
      "isComplete": false,
      "sections": []
    }
  },
  "nextStep": "complete_questionnaire_and_submit"
}
```

### Get All Claims
```http
GET {{base_url}}/claims
Authorization: Bearer {{auth_token}}
```
**Query Parameters (Optional):**
```
?claimStatus=draft
&claimType=life
&page=1
&limit=10
&sortBy=createdAt
&sortOrder=desc
```

### Get Claim by ID
```http
GET {{base_url}}/claims/{{claim_id}}
Authorization: Bearer {{auth_token}}
```

### Get Claim Statistics
```http
GET {{base_url}}/claims/stats/overview
Authorization: Bearer {{auth_token}}
```

### Get Claims Requiring Action
```http
GET {{base_url}}/claims/actions/pending
Authorization: Bearer {{auth_token}}
```

---

## 3. Questionnaire Management

### Get Questionnaire Questions
```http
GET {{base_url}}/claims/{{claim_id}}/questionnaire
Authorization: Bearer {{auth_token}}
```

### Get Section-Specific Questions
```http
GET {{base_url}}/claims/{{claim_id}}/questionnaire/section/{{section_id}}
Authorization: Bearer {{auth_token}}
```

### Update Single Questionnaire Answer
```http
PATCH {{base_url}}/claims/{{claim_id}}/questionnaire/answer
Authorization: Bearer {{auth_token}}
```
**Body (JSON):**
```json
{
  "questionId": "q1",
  "answer": {
    "textValue": "Patient experienced chest pain"
  }
}
```

**Different Answer Types Examples:**
```json
// Text Answer
{
  "questionId": "q1",
  "answer": {
    "textValue": "Detailed description here"
  }
}

// Number Answer
{
  "questionId": "q2",
  "answer": {
    "numberValue": 5000
  }
}

// Boolean Answer
{
  "questionId": "q3",
  "answer": {
    "booleanValue": true
  }
}

// Date Answer
{
  "questionId": "q4",
  "answer": {
    "dateValue": "2024-01-15"
  }
}

// Select Answer
{
  "questionId": "q5",
  "answer": {
    "selectValue": "option1"
  }
}

// Multi-select Answer
{
  "questionId": "q6",
  "answer": {
    "multiselectValue": ["option1", "option3"]
  }
}

// File Answer (document ID)
{
  "questionId": "q7",
  "answer": {
    "fileValue": "document_id_here"
  }
}
```

### Submit Section Answers
```http
PATCH {{base_url}}/claims/{{claim_id}}/questionnaire/section/{{section_id}}/submit-answers
Authorization: Bearer {{auth_token}}
```
**Body (JSON):**
```json
{
  "answers": [
    {
      "questionId": "q1",
      "answer": {
        "textValue": "Patient details"
      }
    },
    {
      "questionId": "q2",
      "answer": {
        "numberValue": 2500
      }
    }
  ]
}
```

### Submit All Questionnaire Answers
```http
PATCH {{base_url}}/claims/{{claim_id}}/questionnaire/submit-answers
Authorization: Bearer {{auth_token}}
```
**Body (JSON):**
```json
{
  "answers": [
    {
      "questionId": "q1",
      "answer": {
        "textValue": "Complete medical history"
      }
    },
    {
      "questionId": "q2",
      "answer": {
        "numberValue": 15000
      }
    },
    {
      "questionId": "q3",
      "answer": {
        "booleanValue": false
      }
    }
  ]
}
```

---

## 4. Document Upload

### Upload Single Document to Claim
```http
POST {{base_url}}/claims/{{claim_id}}/documents/upload
Authorization: Bearer {{auth_token}}
Content-Type: multipart/form-data
```
**Form Data:**
- `document`: [file] - The file to upload
- `docType`: medical_bill
- `description`: Hospital bill for emergency treatment

### Upload Multiple Documents to Claim
```http
POST {{base_url}}/claims/{{claim_id}}/documents/upload/multiple
Authorization: Bearer {{auth_token}}
Content-Type: multipart/form-data
```
**Form Data:**
- `documents`: [file1, file2, file3] - Multiple files
- `docTypes`: ["medical_bill", "prescription", "discharge_summary"]
- `description`: Supporting medical documents

### Get Claim Documents
```http
GET {{base_url}}/claims/{{claim_id}}/documents
Authorization: Bearer {{auth_token}}
```

---

## 5. Claim Submission & Processing

### Submit Claim (Employee Action)
```http
PATCH {{base_url}}/claims/{{claim_id}}/submit
Authorization: Bearer {{auth_token}}
```
**Body (JSON):**
```json
{
  "claimAmount": 15000,
  "documents": ["document_id_1", "document_id_2"]
}
```
**Expected Response:**
```json
{
  "success": true,
  "message": "Claim submitted to HR successfully",
  "claim": {
    "_id": "claim_id",
    "claimStatus": "hr",
    "claimAmount": {
      "requested": 15000
    }
  },
  "nextStep": "await_hr_review"
}
```

### Forward Claim to Insurer (HR Action)
```http
PATCH {{base_url}}/claims/{{claim_id}}/forward
Authorization: Bearer {{auth_token}}
```
**Body (JSON):**
```json
{
  "coverageBreakdown": [
    {
      "category": "medical_expenses",
      "amount": 12000,
      "description": "Hospital bills and medication"
    },
    {
      "category": "consultation_fees",
      "amount": 3000,
      "description": "Doctor consultation charges"
    }
  ],
  "hrNotes": "All documents verified. Patient treatment was necessary and covered under policy terms."
}
```
**Expected Response:**
```json
{
  "success": true,
  "message": "Claim forwarded to insurer successfully",
  "claim": {
    "claimStatus": "insurer",
    "hrForwardingDetails": {
      "forwardedAt": "2024-01-15T10:30:00Z",
      "coverageBreakdown": [...],
      "hrNotes": "All documents verified..."
    }
  },
  "nextStep": "await_insurer_decision"
}
```

### Make Final Decision (Insurance Agent Action)

#### Approve Claim
```http
PATCH {{base_url}}/claims/{{claim_id}}/decision
Authorization: Bearer {{auth_token}}
```
**Body (JSON):**
```json
{
  "status": "approved",
  "approvedAmount": 13500,
  "insurerNotes": "Claim approved. Minor deduction for non-covered items."
}
```

#### Reject Claim
```http
PATCH {{base_url}}/claims/{{claim_id}}/decision
Authorization: Bearer {{auth_token}}
```
**Body (JSON):**
```json
{
  "status": "rejected",
  "rejectionReason": "Treatment not covered under policy terms",
  "insurerNotes": "Cosmetic procedure not covered as per policy clause 4.2"
}
```

### Return Claim to Previous Stage

#### HR Returns to Employee
```http
PATCH {{base_url}}/claims/{{claim_id}}/return
Authorization: Bearer {{auth_token}}
```
**Body (JSON):**
```json
{
  "returnReason": "Missing medical reports. Please upload discharge summary and lab reports."
}
```

#### Insurance Agent Returns to HR
```http
PATCH {{base_url}}/claims/{{claim_id}}/return
Authorization: Bearer {{auth_token}}
```
**Body (JSON):**
```json
{
  "returnReason": "Need additional verification for high-value claim. Please provide policy audit report."
}
```

### Update Claim Status
```http
PATCH {{base_url}}/claims/{{claim_id}}/status
Authorization: Bearer {{auth_token}}
```
**Body (JSON):**
```json
{
  "status": "employee",
  "reason": "Additional documents required"
}
```

---

## 6. Claim Deletion

### Delete Claim (Employee Only - Draft/Employee Status)
```http
DELETE {{base_url}}/claims/by-id/{{claim_id}}
Authorization: Bearer {{auth_token}}
```

---

## 7. Complete Claims Testing Workflow

### Scenario 1: Successful Life Insurance Claim

1. **Create Claim:**
```json
POST /claims
{
  "policy": "policy_id",
  "claimType": "life",
  "claimOption": "hospitalization"
}
```

2. **Complete Questionnaire:**
```json
PATCH /claims/{id}/questionnaire/submit-answers
{
  "answers": [
    {
      "questionId": "patient_name",
      "answer": { "textValue": "John Doe" }
    },
    {
      "questionId": "treatment_cost",
      "answer": { "numberValue": 15000 }
    },
    {
      "questionId": "emergency_treatment",
      "answer": { "booleanValue": true }
    }
  ]
}
```

3. **Upload Documents:**
```http
POST /claims/{id}/documents/upload/multiple
Form Data:
- documents: [medical_bill.pdf, discharge_summary.pdf]
- docTypes: ["medical_bill", "discharge_summary"]
```

4. **Submit Claim:**
```json
PATCH /claims/{id}/submit
{
  "claimAmount": 15000
}
```

5. **HR Forward:**
```json
PATCH /claims/{id}/forward
{
  "coverageBreakdown": [
    {
      "category": "medical_expenses",
      "amount": 15000,
      "description": "Emergency treatment"
    }
  ],
  "hrNotes": "Valid emergency claim"
}
```

6. **Insurance Agent Approve:**
```json
PATCH /claims/{id}/decision
{
  "status": "approved",
  "approvedAmount": 15000,
  "insurerNotes": "Approved in full"
}
```

### Scenario 2: Vehicle Insurance Claim with Return

1. **Create Vehicle Claim:**
```json
POST /claims
{
  "policy": "policy_id",
  "claimType": "vehicle",
  "claimOption": "accident"
}
```

2. **Submit with Missing Info:**
```json
PATCH /claims/{id}/submit
{
  "claimAmount": 25000
}
```

3. **HR Returns:**
```json
PATCH /claims/{id}/return
{
  "returnReason": "Police report missing"
}
```

4. **Upload Missing Document:**
```http
POST /claims/{id}/documents/upload
Form Data:
- document: police_report.pdf
- docType: police_report
```

5. **Resubmit:**
```json
PATCH /claims/{id}/submit
{
  "claimAmount": 25000
}
```

6. **Continue with normal flow...**

---

## 8. Valid Document Types by Claim Type

### Life Insurance Claims
- **hospitalization**: medical_bill, discharge_summary, prescription, lab_report
- **channelling**: channelling_receipt, doctor_report
- **medication**: prescription, pharmacy_receipt, medical_report
- **death**: death_certificate, medical_report, police_report

### Vehicle Insurance Claims
- **accident**: police_report, damage_assessment, repair_estimate, photos
- **theft**: police_report, fir_copy, vehicle_registration
- **fire**: fire_department_report, damage_assessment, photos
- **naturalDisaster**: weather_report, damage_assessment, photos

### Common Document Types (All Claims)
- supporting
- identification
- proof_of_policy

---

## 9. Error Handling Examples

### Invalid Claim Type
```json
POST /claims
{
  "policy": "policy_id",
  "claimType": "invalid_type",
  "claimOption": "hospitalization"
}
// Response: 400 - "Claim type must be either 'life' or 'vehicle'"
```

### Unauthorized Action
```json
PATCH /claims/{id}/forward
Authorization: Bearer employee_token
// Response: 403 - "Access denied. HR officer role required"
```

### Invalid Document Type
```http
POST /claims/{id}/documents/upload
Form Data:
- document: file.pdf
- docType: invalid_doc_type
// Response: 400 - "Invalid document type 'invalid_doc_type' for this claim type"
```

---

## 10. Tips for Testing

1. **Set up Postman Environment Variables** for easier testing
2. **Test role-based permissions** by switching between user tokens
3. **Validate claim status transitions** - ensure proper workflow
4. **Test error scenarios** to verify proper error handling
5. **Check document upload validation** with different file types
6. **Test pagination and filtering** on list endpoints

---

## 11. Common HTTP Status Codes

- **200**: Success (GET, PATCH operations)
- **201**: Created (POST operations)
- **400**: Bad Request (Invalid data/validation errors)
- **401**: Unauthorized (Missing/invalid token)
- **403**: Forbidden (Insufficient permissions)
- **404**: Not Found (Resource doesn't exist)
- **500**: Internal Server Error

---

This comprehensive guide covers all aspects of the claims process testing. Make sure to update the environment variables and user credentials according to your test setup.