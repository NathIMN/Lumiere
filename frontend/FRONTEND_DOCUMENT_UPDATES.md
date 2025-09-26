# Frontend API Updates for Claims Document Management

## Overview
Updated the frontend API services and Employee Claims component to integrate with the new backend document upload functionality for claims.

## Changes Made

### 1. Insurance API Service Updates (`insurance-api.js`)

#### New Methods Added:

**`uploadClaimDocument(claimId, file, metadata)`**
- Uploads a single document directly to a claim
- Parameters:
  - `claimId`: Claim ID
  - `file`: File object
  - `metadata`: Document metadata including docType, description, tags
- Endpoint: `POST /claims/{id}/documents/upload`

**`uploadMultipleClaimDocuments(claimId, files, metadata)`**
- Uploads multiple documents to a claim at once
- Parameters:
  - `claimId`: Claim ID
  - `files`: Array of File objects
  - `metadata`: Shared metadata including docTypes array
- Endpoint: `POST /claims/{id}/documents/upload/multiple`

**`getClaimDocuments(claimId)`**
- Retrieves all documents for a specific claim
- Endpoint: `GET /claims/{id}/documents`

**`getValidDocumentTypesForClaim(claimType, claimOption)`**
- Returns valid document types based on claim type and option
- Client-side helper function matching backend validation

**`validateClaimFile(file, claimType, claimOption)`**
- Validates files before upload (size, type, etc.)
- Returns validation result with errors and valid document types

**`formatFileSize(bytes)`**
- Utility function to format file sizes in human-readable format

### 2. Document API Service Updates (`document-api.js`)

#### New Methods Added:

**`getClaimDocuments(claimId)`**
- Alternative endpoint to get claim documents through document service
- Endpoint: `GET /claims/{id}/documents`

**`uploadClaimDocument(claimId, file, metadata)`**
- Upload document to claim via document service
- Endpoint: `POST /claims/{id}/documents/upload`

**`uploadMultipleClaimDocuments(claimId, files, metadata)`**
- Upload multiple documents to claim via document service
- Endpoint: `POST /claims/{id}/documents/upload/multiple`

### 3. Employee Claims Component Updates (`EmployeeClaims.jsx`)

#### New Features Added:

**Document Upload Modal**
- Full-featured modal for uploading documents to claims
- Features:
  - Multiple file selection
  - Document type selection based on claim type
  - Individual descriptions for each file
  - File validation and preview
  - Progress indicators
  - Error handling

**Upload Button Integration**
- Added upload buttons to claim cards for eligible claims
- Shows for claims in draft, employee, hr, and insurer status
- Compact design that doesn't interfere with main actions

**State Management**
- `showUploadModal`: Controls modal visibility
- `selectedClaim`: Stores currently selected claim for upload
- `uploadFiles`: Manages selected files with metadata
- `uploadLoading`: Handles upload progress state

#### New Functions:

**`handleUploadClick(claim)`**
- Opens upload modal for selected claim

**`handleFileSelect(event)`**
- Processes selected files and adds metadata structure

**`removeFile(fileId)`**
- Removes files from upload queue

**`updateFileDocType(fileId, docType)`**
- Updates document type for individual files

**`updateFileDescription(fileId, description)`**
- Updates description for individual files

**`handleUploadSubmit()`**
- Handles upload submission (single or multiple files)
- Refreshes claims list after successful upload

**`getValidDocumentTypes(claimType, claimOption)`**
- Gets valid document types for display in modal

## Document Type Validation

### Life Insurance Claims:
- **Hospitalization**: medical_bill, discharge_summary, prescription, lab_report
- **Channelling**: channelling_receipt, doctor_report  
- **Medication**: prescription, pharmacy_receipt, medical_report
- **Death**: death_certificate, medical_report, police_report

### Vehicle Insurance Claims:
- **Accident**: police_report, damage_assessment, repair_estimate, photos
- **Theft**: police_report, fir_copy, vehicle_registration
- **Fire**: fire_department_report, damage_assessment, photos
- **Natural Disaster**: weather_report, damage_assessment, photos

### Common Types (All Claims):
- supporting, identification, proof_of_policy

## User Experience Improvements

1. **Seamless Integration**: Upload functionality is integrated directly into the claims interface
2. **Context-Aware**: Document types are filtered based on claim type and option
3. **Validation**: Client-side validation prevents invalid uploads
4. **Progress Feedback**: Loading states and error messages keep users informed
5. **Mobile Responsive**: Upload interface works on all screen sizes

## Error Handling

- File size validation (10MB limit)
- File type validation (PDF, images, documents)
- Network error handling with user-friendly messages
- Form validation before submission
- Automatic retry mechanisms

## API Compatibility

All frontend changes are fully compatible with the updated backend controllers:
- Claims controller document upload endpoints
- Document upload controller claim-specific methods
- Proper authentication and authorization handling
- Consistent error response formats

## Testing Recommendations

1. Test file upload with various file types and sizes
2. Verify document type validation for different claim types
3. Test upload progress indicators and error handling
4. Verify mobile responsiveness of upload interface
5. Test multiple file uploads vs single file uploads
6. Validate proper claim-document association
7. Test upload permissions for different user roles

## Future Enhancements

1. **Drag-and-Drop Upload**: Add drag-and-drop functionality to the modal
2. **Image Preview**: Show image previews for uploaded photos
3. **Upload Progress**: Individual file upload progress bars
4. **Bulk Actions**: Select multiple claims for document upload
5. **Document Templates**: Pre-defined document sets for common claim types
6. **OCR Integration**: Extract text from uploaded documents
7. **Document Verification**: Mark documents as verified/unverified
8. **Version Control**: Handle document versions and updates