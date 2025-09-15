# Reports API Testing Guide

## Overview
The Reports API provides comprehensive PDF report generation for various aspects of the Lumiere Insurance application including policies, claims, user profiles, and financial data.

## Authentication
All report endpoints require authentication using a Bearer token:
```
Authorization: Bearer <your-jwt-token>
```

## Available Endpoints

### 1. Get Available Report Templates
```bash
GET /api/v1/reports/templates
Roles: admin, hr_officer, insurance_agent
```

**Example Request:**
```bash
curl -X GET "http://localhost:5000/api/v1/reports/templates" \
  -H "Authorization: Bearer <token>"
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "users",
      "name": "User Profiles Report",
      "description": "Comprehensive overview of system users and their profiles",
      "category": "User Management",
      "filters": ["role", "department", "status", "dateRange"]
    }
  ]
}
```

### 2. Generate Users Report
```bash
GET /api/v1/reports/users
Roles: admin, hr_officer
```

**Query Parameters:**
- `role` - Filter by user role (admin, hr_officer, employee, insurance_agent)
- `dateFrom` - Start date (YYYY-MM-DD)
- `dateTo` - End date (YYYY-MM-DD) 
- `department` - Filter by department
- `status` - Filter by status (active, inactive)
- `format` - Response format (pdf, json) - default: pdf

**Example Requests:**

Generate PDF report:
```bash
curl -X GET "http://localhost:5000/api/v1/reports/users?role=employee&status=active&format=pdf" \
  -H "Authorization: Bearer <token>" \
  --output users-report.pdf
```

Get JSON data:
```bash
curl -X GET "http://localhost:5000/api/v1/reports/users?format=json" \
  -H "Authorization: Bearer <token>"
```

### 3. Generate Policies Report
```bash
GET /api/v1/reports/policies
Roles: admin, hr_officer, insurance_agent
```

**Query Parameters:**
- `policyType` - Filter by policy type (life, vehicle, health)
- `status` - Filter by status (active, inactive, pending)
- `dateFrom` - Start date (YYYY-MM-DD)
- `dateTo` - End date (YYYY-MM-DD)
- `agent` - Filter by agent ID
- `premium_min` - Minimum premium amount
- `premium_max` - Maximum premium amount
- `format` - Response format (pdf, json) - default: pdf

**Example Request:**
```bash
curl -X GET "http://localhost:5000/api/v1/reports/policies?policyType=life&status=active&premium_min=1000&premium_max=5000" \
  -H "Authorization: Bearer <token>" \
  --output policies-report.pdf
```

### 4. Generate Claims Report
```bash
GET /api/v1/reports/claims
Roles: admin, hr_officer, insurance_agent
```

**Query Parameters:**
- `status` - Filter by claim status (pending, approved, rejected)
- `claimType` - Filter by claim type
- `dateFrom` - Start date (YYYY-MM-DD)
- `dateTo` - End date (YYYY-MM-DD)
- `agent` - Filter by assigned agent ID
- `amount_min` - Minimum claim amount
- `amount_max` - Maximum claim amount
- `format` - Response format (pdf, json) - default: pdf

**Example Request:**
```bash
curl -X GET "http://localhost:5000/api/v1/reports/claims?status=approved&dateFrom=2024-01-01&dateTo=2024-12-31" \
  -H "Authorization: Bearer <token>" \
  --output claims-report.pdf
```

### 5. Generate Financial Report
```bash
GET /api/v1/reports/financial
Roles: admin
```

**Query Parameters:**
- `dateFrom` - Start date (YYYY-MM-DD)
- `dateTo` - End date (YYYY-MM-DD)
- `period` - Period granularity (monthly, quarterly, yearly) - default: monthly
- `format` - Response format (pdf, json) - default: pdf

**Example Request:**
```bash
curl -X GET "http://localhost:5000/api/v1/reports/financial?period=quarterly&dateFrom=2024-01-01&dateTo=2024-12-31" \
  -H "Authorization: Bearer <token>" \
  --output financial-report.pdf
```

### 6. Generate Custom Report
```bash
POST /api/v1/reports/custom
Roles: admin
```

**Request Body:**
```json
{
  "reportName": "Q4 2024 Performance Report",
  "reportType": "policies",
  "filters": {
    "status": "active",
    "dateFrom": "2024-10-01",
    "dateTo": "2024-12-31"
  },
  "columns": ["policyNumber", "policyType", "premiumAmount"],
  "groupBy": "policyType",
  "sortBy": "premiumAmount",
  "format": "pdf"
}
```

**Example Request:**
```bash
curl -X POST "http://localhost:5000/api/v1/reports/custom" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "reportName": "Q4 2024 Performance Report",
    "reportType": "policies",
    "filters": {
      "status": "active",
      "dateFrom": "2024-10-01",
      "dateTo": "2024-12-31"
    },
    "format": "pdf"
  }' \
  --output custom-report.pdf
```

### 7. Schedule Report (Future Feature)
```bash
POST /api/v1/reports/schedule
Roles: admin
```

**Request Body:**
```json
{
  "reportType": "financial",
  "filters": {
    "period": "monthly"
  },
  "schedule": "monthly",
  "recipients": ["admin@lumiere.com", "finance@lumiere.com"],
  "format": "pdf"
}
```

## Error Responses

### Authentication Error (401)
```json
{
  "success": false,
  "message": "No token provided, access denied"
}
```

### Authorization Error (403)
```json
{
  "success": false,
  "message": "Access denied, insufficient permissions"
}
```

### Validation Error (400)
```json
{
  "success": false,
  "message": "Invalid date range: dateFrom cannot be after dateTo"
}
```

### Server Error (500)
```json
{
  "success": false,
  "message": "Failed to generate PDF report"
}
```

## Notes

1. **PDF Generation**: All PDF reports include:
   - Company branding and header
   - Report metadata (generation date, filters applied)
   - Summary statistics
   - Detailed data tables
   - Footer with timestamp

2. **Performance**: Large reports may take several seconds to generate. Consider using streaming or background processing for very large datasets.

3. **File Size**: PDF files are optimized but may be large for reports with many records. Consider adding pagination for very large datasets.

4. **Security**: All reports respect user permissions and data access controls. Insurance agents can only see their own data, HR can see employee data, and admins have full access.

5. **Rate Limiting**: Consider implementing rate limiting to prevent abuse of the PDF generation system.

## Example Integration (Frontend)

```javascript
// Download PDF report
const downloadReport = async (reportType, filters) => {
  try {
    const response = await fetch(`/api/v1/reports/${reportType}?${new URLSearchParams(filters)}`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    if (response.ok) {
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${reportType}-report-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    }
  } catch (error) {
    console.error('Error downloading report:', error);
  }
};

// Usage
downloadReport('users', { role: 'employee', status: 'active' });
```