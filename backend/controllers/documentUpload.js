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

export { 
  uploadDocument, 
  uploadMultipleDocuments, 
  downloadDocument, 
  deleteDocumentFile 
};