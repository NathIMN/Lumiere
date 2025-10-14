import Document from "../models/Document.js";
import asyncWrapper from "../middleware/async.js";
import { createCustomError } from "../errors/custom-error.js";

const getAllDocuments = asyncWrapper(async (req, res) => {
  const { type, docType, userId, refId, status = "active", isVerified, uploadedByRole } = req.query;

  // Build filter object based on query parameters
  const filter = { status };
  if (type) filter.type = type;
  if (docType) filter.docType = docType;
  if (userId) filter.userId = userId;
  if (refId) filter.refId = refId;
  if (isVerified !== undefined) {
    filter.isVerified = isVerified === 'true';
  }
  if (uploadedByRole) filter.uploadedByRole = uploadedByRole;

  const documents = await Document.find(filter).sort({ createdAt: -1 });
  res.status(200).json({
    success: true,
    count: documents.length,
    documents,
  });
});

const createDocument = asyncWrapper(async (req, res) => {
  const document = await Document.create(req.body);
  res.status(201).json({
    success: true,
    document,
  });
});

const getDocument = asyncWrapper(async (req, res, next) => {
  const { id: documentID } = req.params;
  const document = await Document.findOne({ _id: documentID });

  if (!document) {
    return next(createCustomError(`No document with id: ${documentID}`, 404));
  }

  // Log access if document is found
  if (req.user) {
    await document.logAccess(req.user.id, req.user.role, "view");
  }

  res.status(200).json({
    success: true,
    document,
  });
});

const updateDocument = asyncWrapper(async (req, res, next) => {
  const { id: documentID } = req.params;

  // Prevent updating certain fields through this endpoint
  const { azureBlobUrl, size, mimeType, accessLog, ...updateData } = req.body;

  const document = await Document.findOneAndUpdate(
    { _id: documentID },
    updateData,
    {
      new: true,
      runValidators: true,
    },
  );

  if (!document) {
    return next(createCustomError(`No document with id: ${documentID}`, 404));
  }

  // Log access
  if (req.user) {
    await document.logAccess(req.user.id, req.user.role, "update");
  }

  res.status(200).json({
    success: true,
    document,
  });
});

const deleteDocument = asyncWrapper(async (req, res, next) => {
  const { id: documentID } = req.params;
  const { permanent = false } = req.query;

  let document;

  if (permanent === "true") {
    // Permanent deletion - completely remove from database
    document = await Document.findOneAndDelete({ _id: documentID });
  } else {
    // Soft deletion - mark as deleted
    document = await Document.findOneAndUpdate(
      { _id: documentID },
      { status: "deleted" },
      { new: true },
    );
  }

  if (!document) {
    return next(createCustomError(`No document with id: ${documentID}`, 404));
  }

  // Log access
  if (req.user) {
    await document.logAccess(req.user.id, req.user.role, "delete");
  }

  res.status(200).json({
    success: true,
    message:
      permanent === "true"
        ? "Document permanently deleted"
        : "Document marked as deleted",
    document,
  });
});

const getDocumentsByReference = asyncWrapper(async (req, res, next) => {
  const { type, refId } = req.params;

  if (!type || !refId) {
    return next(createCustomError("Type and reference ID are required", 400));
  }

  const documents = await Document.findByReference(type, refId);

  res.status(200).json({
    success: true,
    count: documents.length,
    documents,
  });
});

const getUserDocuments = asyncWrapper(async (req, res, next) => {
  const { userId } = req.params;

  if (!userId) {
    return next(createCustomError("User ID is required", 400));
  }

  const documents = await Document.findByUser(userId);

  res.status(200).json({
    success: true,
    count: documents.length,
    documents,
  });
});

const verifyDocument = asyncWrapper(async (req, res, next) => {
  const { id: documentID } = req.params;
  const { verifiedBy } = req.body;

  if (!verifiedBy) {
    return next(createCustomError("Verified by information is required", 400));
  }

  const document = await Document.findById(documentID);

  if (!document) {
    return next(createCustomError(`No document with id: ${documentID}`, 404));
  }

  if (document.isVerified) {
    return next(createCustomError("Document is already verified", 400));
  }

  await document.verify(verifiedBy);

  res.status(200).json({
    success: true,
    message: "Document verified successfully",
    document,
  });
});

const getDocumentStats = asyncWrapper(async (req, res) => {
  const stats = await Document.aggregate([
    {
      $group: {
        _id: "$type",
        count: { $sum: 1 },
        totalSize: { $sum: "$size" },
        verified: { $sum: { $cond: ["$isVerified", 1, 0] } },
      },
    },
  ]);

  const totalDocuments = await Document.countDocuments({ status: "active" });
  const totalSize = await Document.aggregate([
    { $group: { _id: null, totalSize: { $sum: "$size" } } },
  ]);

  res.status(200).json({
    success: true,
    totalDocuments,
    totalSize: totalSize[0]?.totalSize || 0,
    statsByType: stats,
  });
});

const archiveDocument = asyncWrapper(async (req, res, next) => {
  const { id: documentID } = req.params;

  const document = await Document.findOneAndUpdate(
    { _id: documentID },
    { status: "archived" },
    { new: true },
  );

  if (!document) {
    return next(createCustomError(`No document with id: ${documentID}`, 404));
  }

  // Log access
  if (req.user) {
    await document.logAccess(req.user.id, req.user.role, "update");
  }

  res.status(200).json({
    success: true,
    message: "Document archived successfully",
    document,
  });
});

// Extract text from document using OCR
const extractTextFromDocument = asyncWrapper(async (req, res, next) => {
  const { id: documentID } = req.params;
  
  // Get the document from database
  const document = await Document.findById(documentID);
  if (!document) {
    return next(createCustomError(`No document with id: ${documentID}`, 404));
  }

  // Check if user has permission to access this document
  if (req.user.role === 'employee' && document.uploadedBy.toString() !== req.user.userId) {
    return next(createCustomError('You can only extract text from your own documents', 403));
  }

  try {
    // Import services
    const azureBlobService = (await import('../services/azureBlobService.js')).default;
    const ocrService = (await import('../services/ocrService.js')).default;

    // Check if file type is supported for OCR
    if (!ocrService.isSupported(document.mimeType)) {
      return next(createCustomError(
        `OCR is not supported for file type: ${document.mimeType}. Supported types: ${ocrService.getSupportedTypes().join(', ')}`, 
        400
      ));
    }

    // Extract blob path from Azure URL
    const urlParts = document.azureBlobUrl.split('/');
    const containerIndex = urlParts.findIndex(part => part === document.azureContainerName);
    const blobPath = urlParts.slice(containerIndex + 1).join('/');

    console.log('Downloading blob for OCR:', blobPath);

    // Download the file from Azure Blob Storage
    const downloadResponse = await azureBlobService.downloadFile(blobPath);
    
    // Convert the download response to buffer
    const chunks = [];
    const readableStream = downloadResponse.readableStreamBody;
    
    for await (const chunk of readableStream) {
      chunks.push(chunk);
    }
    const fileBuffer = Buffer.concat(chunks);

    console.log('File downloaded, starting OCR extraction...');

    // Extract text using OCR.space API
    const extractedText = await ocrService.extractTextFromFile(fileBuffer, document.mimeType);

    // Log the access
    if (req.user) {
      await document.logAccess(req.user.userId, req.user.role, "ocr_extract");
    }

    res.status(200).json({
      success: true,
      extractedText,
      documentId: documentID,
      message: 'Text extracted successfully using OCR'
    });

  } catch (error) {
    console.error('OCR extraction error:', error);
    return next(createCustomError(`Failed to extract text: ${error.message}`, 500));
  }
});

export {
  getAllDocuments,
  createDocument,
  getDocument,
  updateDocument,
  deleteDocument,
  getDocumentsByReference,
  getUserDocuments,
  verifyDocument,
  getDocumentStats,
  archiveDocument,
  extractTextFromDocument,
};

