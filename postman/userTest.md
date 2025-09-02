# Postman API Test Payloads for User Routes

## Base URL
```
http://localhost:5000/api/v1/users
```

## Environment Variables
Set these in your Postman environment:
- `baseUrl`: `http://localhost:5000/api/v1`
- `token`: (will be set after login)

---

## 1. Authentication Routes (Public)

### POST /register - Register Employee
```json
{
  "email": "john.doe@company.com",
  "password": "SecurePass123!",
  "role": "employee",
  "profile": {
    "firstName": "John",
    "lastName": "Doe",
    "dateOfBirth": "1990-05-15",
    "nic": "901234567V",
    "phoneNumber": "0771234567",
    "address": "123 Main Street, Colombo 03, Sri Lanka"
  },
  "employment": {
    "department": "Information Technology",
    "designation": "Software Engineer",
    "employmentType": "permanent",
    "joinDate": "2023-01-15",
    "salary": 120000
  },
  "dependents": [
    {
      "name": "Jane Doe",
      "relationship": "spouse",
      "dateOfBirth": "1992-08-20",
      "nic": "921234567V"
    },
    {
      "name": "Jimmy Doe",
      "relationship": "child",
      "dateOfBirth": "2015-03-10"
    }
  ],
  "bankDetails": {
    "accountHolderName": "John Doe",
    "bankName": "Commercial Bank",
    "branchName": "Colombo Main",
    "accountNumber": "12345678901"
  }
}
```

### POST /register - Register HR Officer
```json
{
  "email": "hr.manager@company.com",
  "password": "SecurePass123!",
  "role": "hr_officer",
  "profile": {
    "firstName": "Sarah",
    "lastName": "Wilson",
    "dateOfBirth": "1985-12-10",
    "nic": "851234567V",
    "phoneNumber": "0779876543",
    "address": "456 Business Park, Colombo 02, Sri Lanka"
  }
}
```

### POST /register - Register Insurance Agent
```json
{
  "email": "agent@insurance.com",
  "password": "SecurePass123!",
  "role": "insurance_agent",
  "profile": {
    "firstName": "Mike",
    "lastName": "Johnson",
    "dateOfBirth": "1988-07-22",
    "nic": "881234567V",
    "phoneNumber": "0765432109",
    "address": "789 Insurance Plaza, Colombo 01, Sri Lanka"
  },
  "insuranceProvider": {
    "companyName": "ABC Insurance Ltd",
    "agentId": "AGT001",
    "licenseNumber": "LIC123456",
    "contactEmail": "contact@abcinsurance.com",
    "contactPhone": "0112345678"
  }
}
```

### POST /register - Register Admin
```json
{
  "email": "admin@company.com",
  "password": "SecurePass123!",
  "role": "admin",
  "profile": {
    "firstName": "Admin",
    "lastName": "User",
    "dateOfBirth": "1980-01-01",
    "nic": "801234567V",
    "phoneNumber": "0701234567",
    "address": "Admin Office, Colombo, Sri Lanka"
  }
}
```

### POST /login
```json
{
  "email": "john.doe@company.com",
  "password": "SecurePass123!"
}
```

**Test Script for Login (Tests tab in Postman):**
```javascript
if (pm.response.code === 200) {
    const response = pm.response.json();
    pm.environment.set("token", response.token);
}
```

---

## 2. User Profile Routes (Protected - User's Own Data)

**Headers for all protected routes:**
```
Authorization: Bearer {{token}}
```

### GET /profile
No body required.

### PATCH /profile
```json
{
  "profile": {
    "firstName": "John Updated",
    "lastName": "Doe Updated",
    "phoneNumber": "0771234999",
    "address": "Updated Address, Colombo 05, Sri Lanka"
  }
}
```

### PATCH /change-password
```json
{
  "currentPassword": "SecurePass123!",
  "newPassword": "NewSecurePass456!"
}
```

---

## 3. Admin/HR Management Routes (Protected)

### GET / - Get All Users
Query Parameters (optional):
- `role`: employee, hr_officer, insurance_agent, admin
- `status`: active, inactive, suspended, terminated
- `department`: IT, HR, Finance, etc.

Example: `{{baseUrl}}/users?role=employee&status=active`

### POST / - Create User (Admin/HR Only)
```json
{
  "email": "new.employee@company.com",
  "password": "TempPass123!",
  "role": "employee",
  "profile": {
    "firstName": "New",
    "lastName": "Employee",
    "dateOfBirth": "1995-03-20",
    "nic": "951234567V",
    "phoneNumber": "0776543210",
    "address": "New Address, Colombo 04, Sri Lanka"
  },
  "employment": {
    "department": "Marketing",
    "designation": "Marketing Executive",
    "employmentType": "contract",
    "joinDate": "2024-01-01",
    "salary": 80000
  },
  "bankDetails": {
    "accountHolderName": "New Employee",
    "bankName": "Peoples Bank",
    "branchName": "Kandy",
    "accountNumber": "98765432101"
  }
}
```

### GET /:id - Get User by ID
URL: `{{baseUrl}}/users/E00001`

### PATCH /:id - Update User (Admin/HR Only)
URL: `{{baseUrl}}/users/E00001`
```json
{
  "profile": {
    "phoneNumber": "0771111111",
    "address": "Updated Admin Address"
  },
  "employment": {
    "department": "Updated Department",
    "designation": "Senior Developer",
    "salary": 150000
  }
}
```

### DELETE /:id - Delete User (Admin Only)
URL: `{{baseUrl}}/users/E00001`
No body required.

---

## 4. Special Purpose Routes

### GET /stats/overview - Get User Statistics (Admin/HR Only)
No body required.

### PATCH /:id/status - Update User Status (Admin/HR Only)
URL: `{{baseUrl}}/users/E00001/status`
```json
{
  "status": "suspended"
}
```

**Valid status values:** active, inactive, suspended, terminated

### PATCH /:id/reset-password - Reset Password (Admin/HR Only)
URL: `{{baseUrl}}/users/E00001/reset-password`
```json
{
  "newPassword": "ResetPass123!"
}
```

---

## Test Scenarios

### 1. Registration Validation Tests

#### Invalid Email Format
```json
{
  "email": "invalid-email",
  "password": "SecurePass123!",
  "role": "employee"
}
```

#### Weak Password
```json
{
  "email": "test@company.com",
  "password": "123",
  "role": "employee"
}
```

#### Invalid Role
```json
{
  "email": "test@company.com",
  "password": "SecurePass123!",
  "role": "invalid_role"
}
```

#### Invalid NIC Format
```json
{
  "email": "test@company.com",
  "password": "SecurePass123!",
  "role": "employee",
  "profile": {
    "firstName": "Test",
    "lastName": "User",
    "dateOfBirth": "1990-01-01",
    "nic": "invalid-nic",
    "phoneNumber": "0771234567",
    "address": "Test Address"
  }
}
```

### 2. Login Validation Tests

#### Missing Credentials
```json
{
  "email": "john.doe@company.com"
}
```

#### Invalid Credentials
```json
{
  "email": "john.doe@company.com",
  "password": "wrongpassword"
}
```

### 3. Authorization Tests

Try accessing admin/HR routes with different user roles:

#### Employee trying to access admin route
Headers: `Authorization: Bearer {{employee_token}}`
URL: `GET {{baseUrl}}/users/`

#### HR Officer trying to delete user (admin only)
Headers: `Authorization: Bearer {{hr_token}}`
URL: `DELETE {{baseUrl}}/users/E00001`

---

## Environment Setup

### Postman Environment Variables
```json
{
  "baseUrl": "http://localhost:5000/api/v1",
  "token": "",
  "employee_token": "",
  "hr_token": "",
  "admin_token": "",
  "test_user_id": "E00001"
}
```

### Pre-request Script for Authenticated Requests
```javascript
// Add this to Collection level pre-request script
if (!pm.environment.get("token")) {
    console.log("No token found. Please login first.");
}
```

### Test Script Template
```javascript
// Add this to Collection level test script
pm.test("Status code validation", function () {
    pm.expect(pm.response.code).to.be.oneOf([200, 201, 400, 401, 403, 404, 422]);
});

pm.test("Response has success field", function () {
    if (pm.response.code < 400) {
        pm.expect(pm.response.json()).to.have.property('success');
    }
});

pm.test("Response time is less than 2000ms", function () {
    pm.expect(pm.response.responseTime).to.be.below(2000);
});
```

---

## Testing Workflow

1. **Setup**: Import collection and set environment variables
2. **Register Users**: Create admin, HR officer, and employee accounts
3. **Login**: Login with each user type and save tokens
4. **Test Permissions**: Verify role-based access control
5. **Test CRUD Operations**: Create, read, update, delete users
6. **Test Edge Cases**: Invalid data, missing fields, etc.
7. **Test Special Features**: Password reset, status updates, statistics

Remember to replace `{{baseUrl}}` and `{{token}}` with your actual values or set them as Postman environment variables.