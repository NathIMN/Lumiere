import Document from "../models/Document.js";
import asyncWrapper from "../middleware/async.js";
import { createCustomError } from "../errors/custom-error.js";
import azureBlobService from "../services/azureBlobService.js";
const containerName = process.env.AZURE_CONTAINER_NAME; 

const uploadDocument = asyncWrapper(async (req, res, next) => {
  if (!req.file) {
    return next(createCustomError('No file provided', 400));
  }

  const { type, docType, userId, refId, uploadedBy, uploadedByRole, description } = req.body;

  // Validate required fields
  if (!type || !docType || !uploadedBy || !uploadedByRole) {
    return next(createCustomError('Missing required fields: type, docType, uploadedBy, uploadedByRole', 400));
  }

  try {
    // Create folder structure based on type and date
    const currentDate = new Date();
    const folderPath = `${type}/${currentDate.getFullYear()}/${currentDate.getMonth() + 1}`;

    // Upload to Azure
    const uploadResult = await azureBlobService.uploadFile(req.file, folderPath);

    // Create document record in MongoDB
    const documentData = {
      filename: uploadResult.fileName,
      originalName: req.file.originalname,
      type,
      docType,
      mimeType: req.file.mimetype,
      size: req.file.size,
      azureBlobUrl: uploadResult.url,
      azureContainerName: containerName,
      userId: userId || null,
      refId: refId || null,
      uploadedBy,
      uploadedByRole,
      metadata: {
        description: description || '',
        tags: req.body.tags ? req.body.tags.split(',').map(tag => tag.trim()) : []
      }
    };

    const document = await Document.create(documentData);

    res.status(201).json({
      success: true,
      message: 'Document uploaded successfully',
      document
    });

  } catch (error) {
    return next(createCustomError(`Upload failed: ${error.message}`, 500));
  }
});

const uploadMultipleDocuments = asyncWrapper(async (req, res, next) => {
  if (!req.files || req.files.length === 0) {
    return next(createCustomError('No files provided', 400));
  }

  const { type, docType, userId, refId, uploadedBy, uploadedByRole, description } = req.body;

  // Validate required fields
  if (!type || !docType || !uploadedBy || !uploadedByRole) {
    return next(createCustomError('Missing required fields: type, docType, uploadedBy, uploadedByRole', 400));
  }

  try {
    const uploadPromises = req.files.map(async (file) => {
      const currentDate = new Date();
      const folderPath = `${type}/${currentDate.getFullYear()}/${currentDate.getMonth() + 1}`;

      // Upload to Azure
      const uploadResult = await azureBlobService.uploadFile(file, folderPath);

      // Create document record
      const documentData = {
        filename: uploadResult.fileName,
        originalName: file.originalname,
        type,
        docType,
        mimeType: file.mimetype,
        size: file.size,
        azureBlobUrl: uploadResult.url,
        azureContainerName: containerName,
        userId: userId || null,
        refId: refId || null,
        uploadedBy,
        uploadedByRole,
        metadata: {
          description: description || '',
          tags: req.body.tags ? req.body.tags.split(',').map(tag => tag.trim()) : []
        }
      };

      return await Document.create(documentData);
    });

    const documents = await Promise.all(uploadPromises);

    res.status(201).json({
      success: true,
      message: `${documents.length} documents uploaded successfully`,
      documents
    });

  } catch (error) {
    return next(createCustomError(`Upload failed: ${error.message}`, 500));
  }
});

const downloadDocument = asyncWrapper(async (req, res, next) => {
  const { id: documentID } = req.params;

  const document = await Document.findById(documentID);
  if (!document) {
    return next(createCustomError(`No document with id: ${documentID}`, 404));
  }

  try {
    // Extract blob name from URL
    const url = new URL(document.azureBlobUrl);
    const blobName = url.pathname.split('/').slice(2).join('/'); // Remove container name

    const downloadResponse = await azureBlobService.downloadFile(blobName);
    
    // Log access
    if (req.user) {
      await document.logAccess(req.user.id, req.user.role, 'download');
    }

    // Set appropriate headers
    res.set({
      'Content-Type': document.mimeType,
      'Content-Disposition': `attachment; filename="${document.originalName}"`,
      'Content-Length': document.size
    });

    // Stream the file
    downloadResponse.readableStreamBody.pipe(res);

  } catch (error) {
    return next(createCustomError(`Download failed: ${error.message}`, 500));
  }
});

const deleteDocumentFile = asyncWrapper(async (req, res, next) => {
  const { id: documentID } = req.params;

  const document = await Document.findById(documentID);
  if (!document) {
    return next(createCustomError(`No document with id: ${documentID}`, 404));
  }

  try {
    // Extract blob name from URL
    const url = new URL(document.azureBlobUrl);
    const blobName = url.pathname.split('/').slice(2).join('/');

    // Delete from Azure
    await azureBlobService.deleteFile(blobName);

    // Delete from MongoDB
    await Document.findByIdAndDelete(documentID);

    res.status(200).json({
      success: true,
      message: 'Document and file deleted successfully'
    });

  } catch (error) {
    return next(createCustomError(`Delete failed: ${error.message}`, 500));
  }
});

const uploadClaimDocument = asyncWrapper(async (req, res, next) => {
  if (!req.file) {
    return next(createCustomError('No file provided', 400));
  }

  const { claimId, docType, description } = req.body;
  const { userId, role } = req.user;

  // Validate required fields
  if (!claimId || !docType) {
    return next(createCustomError('Missing required fields: claimId, docType', 400));
  }

  // Import Claim model to validate claim exists and user has access
  const { default: Claim } = await import('../models/Claim.js');
  
  try {
    const claim = await Claim.findById(claimId);
    if (!claim) {
      return next(createCustomError(`No claim found with id: ${claimId}`, 404));
    }

    // Check if user has permission to upload documents for this claim
    if (
      role === 'employee' && 
      claim.employeeId.toString() !== userId.toString()
    ) {
      return next(createCustomError('You can only upload documents to your own claims', 403));
    }

    // Validate document type based on claim type
    // Document type validation is now handled by the Document model enum
    // const validDocTypes = getValidDocTypesForClaim(claim.claimType, claim.lifeClaimOption || claim.vehicleClaimOption);

    // Create folder structure for claim documents
    const currentDate = new Date();
    const folderPath = `claims/${claim.claimType}/${currentDate.getFullYear()}/${currentDate.getMonth() + 1}`;

    // Upload to Azure
    const uploadResult = await azureBlobService.uploadFile(req.file, folderPath);

    // Create document record with claim-specific metadata
    const documentData = {
      filename: uploadResult.fileName,
      originalName: req.file.originalname,
      type: 'claim',
      docType,
      mimeType: req.file.mimetype,
      size: req.file.size,
      azureBlobUrl: uploadResult.url,
      azureContainerName: containerName,
      userId,
      refId: claimId,
      uploadedBy: userId,
      uploadedByRole: role,
      metadata: {
        description: description || '',
        claimType: claim.claimType,
        claimOption: claim.lifeClaimOption || claim.vehicleClaimOption,
        claimStatus: claim.claimStatus,
        tags: req.body.tags ? req.body.tags.split(',').map(tag => tag.trim()) : []
      }
    };

    const document = await Document.create(documentData);

    // Add document reference to claim
    claim.documents.push(document._id);
    await claim.save();

    res.status(201).json({
      success: true,
      message: 'Claim document uploaded successfully',
      document,
      claimId
    });

  } catch (error) {
    return next(createCustomError(`Upload failed: ${error.message}`, 500));
  }
});

const uploadMultipleClaimDocuments = asyncWrapper(async (req, res, next) => {
  if (!req.files || req.files.length === 0) {
    return next(createCustomError('No files provided', 400));
  }

  const { claimId, docTypes, description } = req.body;
  const { userId, role } = req.user;

  // Validate required fields
  if (!claimId) {
    return next(createCustomError('Missing required field: claimId', 400));
  }

  // Parse docTypes if it's a string (for form data)
  let parsedDocTypes;
  try {
    parsedDocTypes = typeof docTypes === 'string' ? JSON.parse(docTypes) : docTypes;
  } catch (error) {
    return next(createCustomError('Invalid docTypes format. Should be an array or JSON string', 400));
  }

  // Validate docTypes array length matches files length
  if (parsedDocTypes && parsedDocTypes.length !== req.files.length) {
    return next(createCustomError('Number of document types must match number of files', 400));
  }

  // Import Claim model
  const { default: Claim } = await import('../models/Claim.js');
  
  try {
    const claim = await Claim.findById(claimId);
    if (!claim) {
      return next(createCustomError(`No claim found with id: ${claimId}`, 404));
    }

    // Check permissions
    if (
      role === 'employee' && 
      claim.employeeId.toString() !== userId.toString()
    ) {
      return next(createCustomError('You can only upload documents to your own claims', 403));
    }

    // Document type validation is now handled by the Document model enum
    
    const uploadPromises = req.files.map(async (file, index) => {
      const docType = parsedDocTypes ? parsedDocTypes[index] : 'supporting';
      
      // Document type validation is now handled by the Document model enum

      const currentDate = new Date();
      const folderPath = `claims/${claim.claimType}/${currentDate.getFullYear()}/${currentDate.getMonth() + 1}`;

      // Upload to Azure
      const uploadResult = await azureBlobService.uploadFile(file, folderPath);

      // Create document record
      const documentData = {
        filename: uploadResult.fileName,
        originalName: file.originalname,
        type: 'claim',
        docType,
        mimeType: file.mimetype,
        size: file.size,
        azureBlobUrl: uploadResult.url,
        azureContainerName: containerName,
        userId,
        refId: claimId,
        uploadedBy: userId,
        uploadedByRole: role,
        metadata: {
          description: description || '',
          claimType: claim.claimType,
          claimOption: claim.lifeClaimOption || claim.vehicleClaimOption,
          claimStatus: claim.claimStatus,
          tags: req.body.tags ? req.body.tags.split(',').map(tag => tag.trim()) : []
        }
      };

      return await Document.create(documentData);
    });

    const documents = await Promise.all(uploadPromises);

    // Add document references to claim
    const documentIds = documents.map(doc => doc._id);
    claim.documents.push(...documentIds);
    await claim.save();

    res.status(201).json({
      success: true,
      message: `${documents.length} claim documents uploaded successfully`,
      documents,
      claimId
    });

  } catch (error) {
    return next(createCustomError(`Upload failed: ${error.message}`, 500));
  }
});

export { 
  uploadDocument, 
  uploadMultipleDocuments, 
  uploadClaimDocument,
  uploadMultipleClaimDocuments,
  downloadDocument, 
  deleteDocumentFile 
};