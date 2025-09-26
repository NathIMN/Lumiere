# Postman Payloads for Insurance Claim System

## 1. Create Questionnaire Template for Life - Hospitalization

**Method:** POST  
**URL:** `/api/questionnaire-templates`  
**Headers:**
```
Content-Type: application/json
Authorization: Bearer <admin_or_hr_token>
```

**Body:**
```json
{
  "claimType": "life",
  "claimOption": "hospitalization",
  "title": "Life Insurance - Hospitalization Claim Questionnaire",
  "description": "Complete questionnaire for hospitalization claims under life insurance policy",
  "questions": [
    {
      "questionId": "hospital_name",
      "questionText": "Name of the hospital where treatment was received",
      "questionType": "text",
      "isRequired": true,
      "order": 1,
      "helpText": "Enter the full name of the hospital"
    },
    {
      "questionId": "admission_date",
      "questionText": "Date of hospital admission",
      "questionType": "date",
      "isRequired": true,
      "order": 2,
      "validation": {
        "message": "Admission date cannot be in the future"
      }
    },
    {
      "questionId": "discharge_date",
      "questionText": "Date of hospital discharge",
      "questionType": "date",
      "isRequired": true,
      "order": 3,
      "validation": {
        "message": "Discharge date must be after admission date"
      }
    },
    {
      "questionId": "reason_for_hospitalization",
      "questionText": "Reason for hospitalization (diagnosis)",
      "questionType": "text",
      "isRequired": true,
      "order": 4,
      "helpText": "Provide the medical diagnosis or reason for hospitalization"
    },
    {
      "questionId": "treatment_type",
      "questionText": "Type of treatment received",
      "questionType": "select",
      "options": ["Surgery", "Medical Treatment", "Emergency Care", "Observation", "Other"],
      "isRequired": true,
      "order": 5
    },
    {
      "questionId": "doctor_name",
      "questionText": "Name of attending physician",
      "questionType": "text",
      "isRequired": true,
      "order": 6
    },
    {
      "questionId": "total_bill_amount",
      "questionText": "Total hospital bill amount (LKR)",
      "questionType": "number",
      "isRequired": true,
      "order": 7,
      "validation": {
        "min": 1,
        "message": "Bill amount must be greater than 0"
      }
    },
    {
      "questionId": "insurance_coverage_elsewhere",
      "questionText": "Do you have any other insurance coverage for this claim?",
      "questionType": "boolean",
      "isRequired": true,
      "order": 8
    },
    {
      "questionId": "other_insurance_details",
      "questionText": "If yes, provide details of other insurance coverage",
      "questionType": "text",
      "isRequired": false,
      "order": 9,
      "helpText": "Only fill if you answered 'Yes' to the previous question"
    },
    {
      "questionId": "medical_reports",
      "questionText": "Upload medical reports and discharge summary",
      "questionType": "file",
      "isRequired": true,
      "order": 10,
      "helpText": "Upload all relevant medical documents"
    }
  ]
}
```

---

## 2. Multi-Step Claim Creation Process

### Step 1: Create Initial Claim (Draft)

**Method:** POST  
**URL:** `/api/claims`  
**Headers:**
```
Content-Type: application/json
Authorization: Bearer <employee_token>
```

**Body:**
```json
{
  "employeeId": "EMP001", 
  "policy": "60b8d295f8d4e8a1c8e4b123",
  "claimType": "life"
}
```

**Expected Response:**
- Claim created with status "draft"
- Returns `claimId` and `nextStep: "select_claim_option"`

---

### Step 2: Load Questionnaire Template

**Method:** POST  
**URL:** `/api/claims/{claimId}/load-questionnaire`  
**Headers:**
```
Content-Type: application/json
Authorization: Bearer <employee_token>
```

**Body:**
```json
{
  "claimOption": "hospitalization"
}
```

**Expected Response:**
- Claim status updated to "questionnaire_pending"
- Questionnaire template loaded with all questions
- Returns `nextStep: "complete_questionnaire"`

---

### Step 3: Answer Questionnaire Questions (Multiple Calls)

**Method:** POST  
**URL:** `/api/claims/{claimId}/questionnaire-answer`  
**Headers:**
```
Content-Type: application/json
Authorization: Bearer <employee_token>
```

**Bodies for each question:**

**Question 1 - Hospital Name:**
```json
{
  "questionId": "hospital_name",
  "answer": "Colombo National Hospital"
}
```

**Question 2 - Admission Date:**
```json
{
  "questionId": "admission_date",
  "answer": "2024-01-15"
}
```

**Question 3 - Discharge Date:**
```json
{
  "questionId": "discharge_date",
  "answer": "2024-01-20"
}
```

**Question 4 - Reason:**
```json
{
  "questionId": "reason_for_hospitalization",
  "answer": "Acute appendicitis requiring emergency surgery"
}
```

**Question 5 - Treatment Type:**
```json
{
  "questionId": "treatment_type",
  "answer": "Surgery"
}
```

**Question 6 - Doctor Name:**
```json
{
  "questionId": "doctor_name",
  "answer": "Dr. Priya Fernando"
}
```

**Question 7 - Bill Amount:**
```json
{
  "questionId": "total_bill_amount",
  "answer": 150000
}
```

**Question 8 - Other Insurance:**
```json
{
  "questionId": "insurance_coverage_elsewhere",
  "answer": false
}
```

**Question 9 - Other Insurance Details (optional):**
```json
{
  "questionId": "other_insurance_details",
  "answer": ""
}
```

**Question 10 - Medical Reports (file upload):**
```json
{
  "questionId": "medical_reports",
  "answer": "60b8d295f8d4e8a1c8e4b456"
}
```

**After all required questions answered:**
- Claim status automatically updates to "questionnaire_completed"
- Returns `nextStep: "set_claim_amount"`

---

### Step 4: Set Claim Amount and Documents

**Method:** POST  
**URL:** `/api/claims/{claimId}/set-amount`  
**Headers:**
```
Content-Type: application/json
Authorization: Bearer <employee_token>
```

**Body:**
```json
{
  "requestedAmount": 150000,
  "documents": [
    "60b8d295f8d4e8a1c8e4b456",
    "60b8d295f8d4e8a1c8e4b789"
  ]
}
```

**Expected Response:**
- Claim amount set
- Documents attached
- Returns `isReadyForSubmission: true` and `nextStep: "submit_claim"`

---

### Step 5: Submit Claim

**Method:** POST  
**URL:** `/api/claims/{claimId}/submit`  
**Headers:**
```
Content-Type: application/json
Authorization: Bearer <employee_token>
```

**Body:**
```json
{}
```

**Expected Response:**
- Claim status updated to "submitted"
- Current location changed to "hr"
- Status flags updated for HR review
- Returns `nextStep: "await_hr_review"`

---

## Additional Helper Endpoints

### Get Claim Details
**Method:** GET  
**URL:** `/api/claims/{claimId}`  
**Headers:**
```
Authorization: Bearer <token>
```

### Get All Templates
**Method:** GET  
**URL:** `/api/questionnaire-templates`  
**Headers:**
```
Authorization: Bearer <token>
```

### Get Valid Combinations
**Method:** GET  
**URL:** `/api/questionnaire-templates/valid-combinations`  
**Headers:**
```
Authorization: Bearer <token>
```

---

## Notes

1. Replace `{claimId}` with the actual claim ID returned from Step 1
2. Replace document IDs (like `60b8d295f8d4e8a1c8e4b456`) with actual uploaded document IDs
3. Replace `EMP001` with actual employee ID
4. Replace policy ObjectId with actual policy ID from your database
5. Make sure to use appropriate authentication tokens based on user roles
6. The system automatically generates `templateId` as "LT_H" for life-hospitalization
7. Questions are answered one by one, and completion is checked after each answer
8. File uploads for documents should be handled separately through a file upload endpoint first

## Expected Workflow Status Flow
```
draft → questionnaire_pending → questionnaire_completed → submitted → under_hr_review → forwarded_to_insurer → approved/rejected
```