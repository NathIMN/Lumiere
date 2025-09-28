# Lumiere Insurance Management System - API Documentation

## Table of Contents
1. [Overview](#overview)
2. [Authentication](#authentication)
3. [Base URL & Headers](#base-url--headers)
4. [User Management API](#user-management-api)
5. [Policy Management API](#policy-management-api)
6. [Claims Management API](#claims-management-api)
7. [Document Management API](#document-management-api)
8. [File Upload API](#file-upload-api)
9. [Messaging API](#messaging-api)
10. [Notifications API](#notifications-api)
11. [Questionnaire Templates API](#questionnaire-templates-api)
12. [Reports API](#reports-api)
13. [Error Responses](#error-responses)
14. [WebSocket Events](#websocket-events)

## Overview

The Lumiere Insurance Management System provides a RESTful API for managing insurance policies, claims, users, and related operations. The system supports different user roles: `employee`, `hr_officer`, `insurance_agent`, and `admin`.

### Supported Features
- User registration and authentication
- Policy management (Life & Vehicle insurance)
- Claims processing workflow
- Document management and file uploads
- Real-time messaging system
- Notification system
- Questionnaire templates for claims
- Comprehensive reporting system

## Authentication

The API uses JWT (JSON Web Token) based authentication.

### Authentication Flow
1. Register or login to get a JWT token
2. Include the token in the `Authorization` header for protected endpoints
3. Token format: `Bearer <your-jwt-token>`

### User Roles & Permissions
- **employee**: Can manage own profile, view own policies, create and submit claims
- **hr_officer**: Employee permissions + manage users, review claims, generate reports
- **insurance_agent**: Can review claims, manage policies assigned to them
- **admin**: Full system access, all CRUD operations

## Base URL & Headers

### Base URL
```
http://localhost:5000/api/v1
```

### Required Headers
```http
Content-Type: application/json
Authorization: Bearer <jwt-token>  # For protected endpoints
```

### CORS Configuration
The API accepts requests from:
- `http://localhost:5173`
- `http://10.36.228.250:5173`
- Environment variable `CLIENT_URL`

## User Management API

### Register User
```http
POST /users/register
```

**Request Body:**
```json
{
  "email": "john.doe@company.com",
  "password": "securePassword123",
  "role": "employee",
  "profile": {
    "firstName": "John",
    "lastName": "Doe",
    "dateOfBirth": "1990-05-15",
    "nic": "901234567V",
    "phoneNumber": "0771234567",
    "address": "123 Main St, Colombo"
  },
  "employment": {
    "department": "IT",
    "designation": "Software Engineer",
    "employmentType": "permanent",
    "joinDate": "2024-01-01",
    "salary": 75000
  },
  "dependents": [
    {
      "name": "Jane Doe",
      "relationship": "spouse",
      "dateOfBirth": "1992-03-20"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "user": {
    "userId": "EMP0001",
    "_id": "65f7d123456789abcdef0123",
    "email": "john.doe@company.com",
    "role": "employee",
    "profile": { ... },
    "employment": { ... },
    "status": "active",
    "createdAt": "2024-03-18T10:30:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Login User
```http
POST /users/login
```

**Request Body:**
```json
{
  "email": "john.doe@company.com",
  "password": "securePassword123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "userId": "EMP0001",
    "_id": "65f7d123456789abcdef0123",
    "email": "john.doe@company.com",
    "role": "employee",
    "profile": { ... },
    "lastLogin": "2024-03-18T10:30:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Get User Profile
```http
GET /users/profile
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "user": {
    "userId": "EMP0001",
    "_id": "65f7d123456789abcdef0123",
    "email": "john.doe@company.com",
    "role": "employee",
    "profile": { ... },
    "employment": { ... }
  }
}
```

### Update User Profile
```http
PATCH /users/profile
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "profile": {
    "phoneNumber": "0779876543",
    "address": "456 New Address, Kandy"
  }
}
```

### Change Password
```http
PATCH /users/change-password
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "currentPassword": "oldPassword123",
  "newPassword": "newSecurePassword456"
}
```

### Get All Users (Admin/HR)
```http
GET /users?page=1&limit=10&role=employee&status=active&search=john
Authorization: Bearer <token>
```

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `role`: Filter by role
- `status`: Filter by status
- `search`: Search in name/email

### Create User (Admin/HR)
```http
POST /users
Authorization: Bearer <token>
```

### Get User by ID (Admin/HR)
```http
GET /users/:id
Authorization: Bearer <token>
```

### Update User (Admin/HR)
```http
PATCH /users/:id
Authorization: Bearer <token>
```

### Delete User (Admin)
```http
DELETE /users/:id
Authorization: Bearer <token>
```

### Update User Status (Admin/HR)
```http
PATCH /users/:id/status
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "status": "suspended",
  "reason": "Policy violation"
}
```

### Reset User Password (Admin/HR)
```http
PATCH /users/:id/reset-password
Authorization: Bearer <token>
```

### Get User Statistics (Admin/HR)
```http
GET /users/stats/overview
Authorization: Bearer <token>
```

## Policy Management API

### Get All Policies (Admin/HR)
```http
GET /policies?page=1&limit=10&policyType=life&status=active
Authorization: Bearer <token>
```

**Query Parameters:**
- `page`, `limit`: Pagination
- `policyType`: life, vehicle
- `status`: active, inactive, expired
- `search`: Search in policy details

### Create Policy (Admin)
```http
POST /policies
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "policyType": "life",
  "policyCategory": "individual",
  "insuranceAgent": "65f7d123456789abcdef0124",
  "coverage": {
    "coverageAmount": 1000000,
    "deductible": 5000,
    "typeLife": ["life_cover", "hospitalization"],
    "coverageDetails": [
      {
        "type": "life_cover",
        "description": "Basic life insurance coverage",
        "limit": 1000000
      }
    ]
  },
  "validity": {
    "startDate": "2024-01-01",
    "endDate": "2025-01-01"
  },
  "premium": {
    "amount": 5000,
    "frequency": "monthly"
  },
  "termsAndConditions": "Standard life insurance terms...",
  "eligibility": {
    "minAge": 18,
    "maxAge": 65,
    "employmentTypes": ["permanent", "contract"]
  }
}
```

### Get User's Policies
```http
GET /policies/my-policies
Authorization: Bearer <token>
```

### Get Agent's Policies
```http
GET /policies/my-agent-policies
Authorization: Bearer <token>
```

### Get Policy by ID
```http
GET /policies/:id
Authorization: Bearer <token>
```

### Get Policy by Policy ID
```http
GET /policies/policy-id/:policyId
Authorization: Bearer <token>
```

### Update Policy (Admin)
```http
PATCH /policies/:id
Authorization: Bearer <token>
```

### Delete Policy (Admin)
```http
DELETE /policies/:id
Authorization: Bearer <token>
```

### Update Policy Status (Admin/HR)
```http
PATCH /policies/:id/status
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "status": "inactive",
  "reason": "Customer request"
}
```

### Renew Policy (Admin)
```http
PATCH /policies/:id/renew
Authorization: Bearer <token>
```

### Add Beneficiary (Admin/HR)
```http
PATCH /policies/:id/beneficiaries/add
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "name": "Jane Doe",
  "relationship": "spouse",
  "percentage": 100,
  "contactInfo": {
    "phone": "0771234567",
    "email": "jane@email.com"
  }
}
```

### Remove Beneficiary (Admin/HR)
```http
PATCH /policies/:id/beneficiaries/remove
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "beneficiaryId": "65f7d123456789abcdef0125"
}
```

### Check Policy Eligibility
```http
GET /policies/eligibility/:policyType
Authorization: Bearer <token>
```

### Get Policy Statistics (Admin/HR)
```http
GET /policies/stats/overview
Authorization: Bearer <token>
```

### Get Expiring Policies (Admin/HR)
```http
GET /policies/stats/expiring?days=30
Authorization: Bearer <token>
```

## Claims Management API

### Get All Claims
```http
GET /claims?page=1&limit=10&status=employee&claimType=life
Authorization: Bearer <token>
```

### Create Claim
```http
POST /claims
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "policy": "65f7d123456789abcdef0126",
  "claimType": "life",
  "lifeClaimOption": "hospitalization"
}
```

### Get Claim by ID
```http
GET /claims/:id
Authorization: Bearer <token>
```

### Get Questionnaire Questions
```http
GET /claims/:id/questionnaire
Authorization: Bearer <token>
```

### Submit Questionnaire Answer
```http
PATCH /claims/:id/questionnaire/answer
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "questionId": "q1",
  "answer": {
    "textValue": "Hospital visit for chest pain"
  }
}
```

### Submit All Questionnaire Answers
```http
PATCH /claims/:id/questionnaire/submit-answers
Authorization: Bearer <token>
```

### Submit Claim
```http
PATCH /claims/:id/submit
Authorization: Bearer <token>
```

### Forward Claim to Insurer (HR)
```http
PATCH /claims/:id/forward
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "comments": "All documents verified and complete"
}
```

### Make Decision on Claim (Insurance Agent)
```http
PATCH /claims/:id/decision
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "decision": "approved",
  "amount": 50000,
  "comments": "Claim approved as per policy terms"
}
```

### Return Claim
```http
PATCH /claims/:id/return
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "returnTo": "employee",
  "reason": "Additional documentation required"
}
```

### Get Claims Requiring Action
```http
GET /claims/actions/pending
Authorization: Bearer <token>
```

### Get Claim Statistics
```http
GET /claims/stats/overview
Authorization: Bearer <token>
```

## Document Management API

### Get All Documents
```http
GET /documents?page=1&limit=10&type=policy&status=verified
```

### Create Document
```http
POST /documents
```

**Request Body:**
```json
{
  "name": "Policy Document",
  "type": "policy",
  "referenceType": "policy",
  "referenceId": "65f7d123456789abcdef0126",
  "filePath": "/uploads/documents/policy_doc.pdf",
  "fileSize": 1024576,
  "mimeType": "application/pdf",
  "description": "Official policy document"
}
```

### Get Document by ID
```http
GET /documents/:id
```

### Update Document
```http
PATCH /documents/:id
```

### Delete Document
```http
DELETE /documents/:id
```

### Get Documents by Reference
```http
GET /documents/reference/:type/:refId
```

### Get User Documents
```http
GET /documents/user/:userId
```

### Verify Document
```http
PATCH /documents/:id/verify
```

**Request Body:**
```json
{
  "status": "verified",
  "verifiedBy": "65f7d123456789abcdef0123",
  "comments": "Document verified successfully"
}
```

### Archive Document
```http
PATCH /documents/:id/archive
```

### Get Document Statistics
```http
GET /documents/stats/overview
```

## File Upload API

### Upload Single File
```http
POST /files/upload
Content-Type: multipart/form-data
```

**Form Data:**
- `document`: File to upload
- `type`: Document type
- `referenceType`: Reference type (policy, claim, user)
- `referenceId`: Reference ID

### Upload Multiple Files
```http
POST /files/upload/multiple
Content-Type: multipart/form-data
```

**Form Data:**
- `documents`: Array of files (max 10)
- `type`: Document type
- `referenceType`: Reference type
- `referenceId`: Reference ID

### Download Document
```http
GET /files/:id/download
```

### Delete Document File
```http
DELETE /files/:id/delete
```

## Messaging API

### Get Conversations
```http
GET /messages/conversations
Authorization: Bearer <token>
```

### Get Available Contacts
```http
GET /messages/contacts
Authorization: Bearer <token>
```

### Get Unread Message Count
```http
GET /messages/unread-count
Authorization: Bearer <token>
```

### Search Messages
```http
GET /messages/search?q=hello&conversationId=123
Authorization: Bearer <token>
```

### Get Conversation with User
```http
GET /messages/conversation/:recipientId
Authorization: Bearer <token>
```

### Send Message (HTTP Fallback)
```http
POST /messages/send
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "recipientId": "65f7d123456789abcdef0124",
  "content": "Hello, how are you?",
  "type": "text"
}
```

### Mark Conversation as Read
```http
PATCH /messages/conversation/:recipientId/read
Authorization: Bearer <token>
```

## Notifications API

### Send In-App Notification
```http
POST /notifications/send/in-app
```

**Request Body:**
```json
{
  "userId": "65f7d123456789abcdef0123",
  "title": "New Policy Created",
  "message": "Your life insurance policy has been created",
  "type": "policy",
  "priority": "medium"
}
```

### Send Email Notification
```http
POST /notifications/send/email
```

**Request Body:**
```json
{
  "email": "user@company.com",
  "subject": "Policy Update",
  "message": "Your policy has been updated",
  "type": "policy"
}
```

### Send Combined Notification
```http
POST /notifications/send/combined
```

**Request Body:**
```json
{
  "userId": "65f7d123456789abcdef0123",
  "email": "user@company.com",
  "title": "Claim Approved",
  "subject": "Claim Approved",
  "message": "Your claim has been approved",
  "type": "claim",
  "priority": "high"
}
```

### Send Bulk Notification
```http
POST /notifications/send/bulk
```

**Request Body:**
```json
{
  "userIds": ["id1", "id2", "id3"],
  "title": "System Maintenance",
  "message": "Scheduled maintenance tonight",
  "type": "system",
  "channels": ["in-app", "email"]
}
```

### Get User Notifications
```http
GET /notifications?page=1&limit=10&type=policy&read=false
Authorization: Bearer <token>
```

### Get Unread Notification Count
```http
GET /notifications/unread-count
Authorization: Bearer <token>
```

### Mark Notification as Read
```http
PATCH /notifications/:notificationId/read
Authorization: Bearer <token>
```

### Mark All Notifications as Read
```http
PATCH /notifications/mark-all-read
Authorization: Bearer <token>
```

### Delete Notification
```http
DELETE /notifications/:notificationId
Authorization: Bearer <token>
```

## Questionnaire Templates API

### Get Valid Combinations
```http
GET /questionnaireTemplates/combinations/valid
Authorization: Bearer <token>
```

### Get Missing Combinations (Admin/HR)
```http
GET /questionnaireTemplates/combinations/missing
Authorization: Bearer <token>
```

### Validate Template (Admin/HR)
```http
POST /questionnaireTemplates/validate
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "claimType": "life",
  "claimOption": "hospitalization",
  "questions": [
    {
      "questionId": "q1",
      "questionText": "What was the reason for hospitalization?",
      "questionType": "text",
      "isRequired": true
    }
  ]
}
```

### Get Template by Type and Option
```http
GET /questionnaireTemplates/by-type/:claimType/:claimOption
Authorization: Bearer <token>
```

### Get All Templates
```http
GET /questionnaireTemplates?page=1&limit=10&claimType=life&status=active
Authorization: Bearer <token>
```

### Create Template (Admin/HR)
```http
POST /questionnaireTemplates
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "claimType": "life",
  "claimOption": "hospitalization",
  "templateName": "Hospitalization Questionnaire",
  "description": "Questions for hospitalization claims",
  "questions": [
    {
      "questionId": "q1",
      "questionText": "What was the reason for hospitalization?",
      "questionType": "text",
      "isRequired": true,
      "validationRules": {
        "minLength": 10,
        "maxLength": 500
      }
    },
    {
      "questionId": "q2",
      "questionText": "Date of admission",
      "questionType": "date",
      "isRequired": true
    }
  ]
}
```

### Get Template by ID
```http
GET /questionnaireTemplates/:id
Authorization: Bearer <token>
```

### Update Template (Admin/HR)
```http
PATCH /questionnaireTemplates/:id
Authorization: Bearer <token>
```

### Delete Template (Admin/HR)
```http
DELETE /questionnaireTemplates/:id
Authorization: Bearer <token>
```

### Clone Template (Admin/HR)
```http
POST /questionnaireTemplates/:id/clone
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "newClaimType": "vehicle",
  "newClaimOption": "accident",
  "newTemplateName": "Vehicle Accident Questionnaire"
}
```

### Toggle Template Status (Admin/HR)
```http
PATCH /questionnaireTemplates/:id/toggle-status
Authorization: Bearer <token>
```

### Hard Delete Template (Admin)
```http
DELETE /questionnaireTemplates/:id/hard-delete
Authorization: Bearer <token>
```

## Reports API

### Get Report Templates
```http
GET /reports/templates
Authorization: Bearer <token>
```

### Generate Users Report (Admin/HR)
```http
GET /reports/users?role=employee&dateFrom=2024-01-01&dateTo=2024-12-31&department=IT&status=active&format=pdf
Authorization: Bearer <token>
```

**Query Parameters:**
- `role`: Filter by user role
- `dateFrom`, `dateTo`: Date range
- `department`: Filter by department
- `status`: Filter by status
- `format`: pdf, excel, csv (default: pdf)

### Generate Policies Report (Admin/HR/Agent)
```http
GET /reports/policies?policyType=life&status=active&dateFrom=2024-01-01&dateTo=2024-12-31&agent=60f7d123456789&premium_min=1000&premium_max=5000&format=pdf
Authorization: Bearer <token>
```

### Generate Claims Report (Admin/HR/Agent)
```http
GET /reports/claims?status=approved&claimType=vehicle&dateFrom=2024-01-01&dateTo=2024-12-31&agent=60f7d123456789&amount_min=500&amount_max=10000&format=pdf
Authorization: Bearer <token>
```

### Generate Financial Report (Admin)
```http
GET /reports/financial?dateFrom=2024-01-01&dateTo=2024-12-31&period=monthly&format=pdf
Authorization: Bearer <token>
```

### Generate Custom Report (Admin)
```http
POST /reports/custom
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "reportName": "Custom Claims Analysis",
  "reportType": "claims",
  "filters": {
    "status": "approved",
    "dateFrom": "2024-01-01",
    "dateTo": "2024-12-31"
  },
  "columns": ["claimId", "employeeId", "amount", "status"],
  "groupBy": "claimType",
  "sortBy": "amount",
  "format": "excel"
}
```

### Schedule Report (Admin)
```http
POST /reports/schedule
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "reportType": "financial",
  "filters": {
    "period": "monthly"
  },
  "schedule": {
    "frequency": "monthly",
    "dayOfMonth": 1,
    "time": "09:00"
  },
  "recipients": ["admin@company.com", "finance@company.com"],
  "format": "pdf"
}
```

## Error Responses

### Standard Error Format
```json
{
  "success": false,
  "message": "Error description",
  "statusCode": 400
}
```

### Common HTTP Status Codes
- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `409`: Conflict
- `422`: Validation Error
- `423`: Locked (Account locked)
- `500`: Internal Server Error

### Validation Errors
```json
{
  "success": false,
  "message": "Validation failed",
  "statusCode": 422,
  "errors": [
    {
      "field": "email",
      "message": "Please enter a valid email"
    },
    {
      "field": "password",
      "message": "Password must be at least 8 characters"
    }
  ]
}
```

## WebSocket Events

The API supports real-time communication through Socket.IO.

### Connection
```javascript
const socket = io('http://localhost:5000', {
  auth: {
    token: 'your-jwt-token'
  }
});
```

### Message Events
- `join_conversation`: Join a conversation room
- `send_message`: Send a message
- `receive_message`: Receive a message
- `typing_start`: User started typing
- `typing_stop`: User stopped typing
- `message_read`: Message marked as read

### Notification Events
- `notification`: Receive real-time notification
- `notification_read`: Notification marked as read

### System Events
- `user_online`: User came online
- `user_offline`: User went offline
- `connection_error`: Connection error occurred

### Example Usage
```javascript
// Send message
socket.emit('send_message', {
  recipientId: 'user123',
  content: 'Hello!',
  type: 'text'
});

// Receive message
socket.on('receive_message', (message) => {
  console.log('New message:', message);
});

// Receive notification
socket.on('notification', (notification) => {
  console.log('New notification:', notification);
});
```

---

## Environment Variables

Required environment variables for the backend:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/lumiere
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173

# Azure Storage (for file uploads)
AZURE_STORAGE_ACCOUNT_NAME=your-account
AZURE_STORAGE_ACCOUNT_KEY=your-key
AZURE_STORAGE_CONTAINER_NAME=documents

# Email Service
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

---

## Postman Collection

Import the provided Postman collections for testing:
- `backend/postman/employee_login.json`
- `backend/postman/hr_login.json`

---

## Rate Limiting

The API implements rate limiting to prevent abuse:
- Login endpoint: 5 attempts per 15 minutes per IP
- General API endpoints: 100 requests per 15 minutes per user
- File upload endpoints: 10 uploads per hour per user

---

*Last Updated: September 16, 2025*