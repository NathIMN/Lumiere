/* eslint-disable no-unused-vars */
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';

class DocumentApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  /**
   * Get authentication headers with Bearer token
   * @returns {Object} Headers object
   */
  getAuthHeaders() {
    const token = localStorage.getItem('authToken');
    return {
      ...(token && { 'Authorization': `Bearer ${token}` }),
    };
  }

  /**
   * Get headers for JSON requests
   * @returns {Object} Headers object with Content-Type
   */
  getJsonHeaders() {
    return {
      'Content-Type': 'application/json',
      ...this.getAuthHeaders(),
    };
  }

  /**
   * Get headers for file upload requests (no Content-Type for FormData)
   * @returns {Object} Headers object
   */
  getUploadHeaders() {
    return this.getAuthHeaders();
  }

  /**
   * Make authenticated API request
   * @param {string} endpoint - API endpoint
   * @param {Object} options - Fetch options
   * @returns {Promise<Object>} API response
   */
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: this.getJsonHeaders(),
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        let errorMessage = 'API request failed';
        
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (jsonError) {
          errorMessage = response.statusText || errorMessage;
        }
        
        const error = new Error(errorMessage);
        error.status = response.status;
        throw error;
      }

      return await response.json();
    } catch (error) {
      console.error('API request error:', error);
      throw error;
    }
  }

  /**
   * Make file upload request
   * @param {string} endpoint - API endpoint
   * @param {FormData} formData - Form data with files
   * @returns {Promise<Object>} API response
   */
  async uploadRequest(endpoint, formData) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      method: 'POST',
      headers: this.getUploadHeaders(),
      body: formData,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        let errorMessage = 'Upload failed';
        
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (jsonError) {
          errorMessage = response.statusText || errorMessage;
        }
        
        const error = new Error(errorMessage);
        error.status = response.status;
        throw error;
      }

      return await response.json();
    } catch (error) {
      console.error('Upload request error:', error);
      throw error;
    }
  }

  /**
   * Make file download request
   * @param {string} endpoint - API endpoint
   * @returns {Promise<Response>} Response object for streaming
   */
  async downloadRequest(endpoint) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: this.getAuthHeaders(),
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        let errorMessage = 'Download failed';
        
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (jsonError) {
          errorMessage = response.statusText || errorMessage;
        }
        
        throw new Error(errorMessage);
      }

      return response;
    } catch (error) {
      console.error('Download request error:', error);
      throw error;
    }
  }

  // ==================== DOCUMENT MANAGEMENT METHODS ====================

  /**
   * Get all documents with optional filters
   * @param {Object} params - Query parameters
   * @param {string} params.type - Filter by document type (policy, claim, user, general)
   * @param {string} params.docType - Filter by document category
   * @param {string} params.userId - Filter by user ID
   * @param {string} params.refId - Filter by reference ID
   * @param {string} params.status - Filter by status (default: 'active')
   * @returns {Promise<Object>} Documents list with metadata
   */
  async getDocuments(params = {}) {
    const queryString = new URLSearchParams(
      Object.entries(params).filter(([_, value]) => value !== undefined && value !== '')
    ).toString();
    
    const endpoint = queryString ? `/documents?${queryString}` : '/documents';
    return this.request(endpoint);
  }

  /**
   * Get document by ID
   * @param {string} documentId - Document ID
   * @returns {Promise<Object>} Document data
   */
  async getDocumentById(documentId) {
    if (!documentId) {
      throw new Error('Document ID is required');
    }
    return this.request(`/documents/${documentId}`);
  }

  /**
   * Create document record (metadata only)
   * @param {Object} documentData - Document metadata
   * @returns {Promise<Object>} Created document data
   */
  async createDocument(documentData) {
    if (!documentData) {
      throw new Error('Document data is required');
    }
    return this.request('/documents', {
      method: 'POST',
      body: JSON.stringify(documentData),
    });
  }

  /**
   * Update document metadata
   * @param {string} documentId - Document ID
   * @param {Object} updateData - Document update data
   * @returns {Promise<Object>} Updated document data
   */
  async updateDocument(documentId, updateData) {
    if (!documentId) {
      throw new Error('Document ID is required');
    }
    if (!updateData) {
      throw new Error('Update data is required');
    }
    return this.request(`/documents/${documentId}`, {
      method: 'PATCH',
      body: JSON.stringify(updateData),
    });
  }

  /**
   * Delete document (soft or permanent)
   * @param {string} documentId - Document ID
   * @param {boolean} permanent - Whether to permanently delete
   * @returns {Promise<Object>} Deletion confirmation
   */
  async deleteDocument(documentId, permanent = false) {
    if (!documentId) {
      throw new Error('Document ID is required');
    }
    
    const endpoint = permanent 
      ? `/documents/${documentId}?permanent=true`
      : `/documents/${documentId}`;
    
    return this.request(endpoint, {
      method: 'DELETE',
    });
  }

  /**
   * Archive document
   * @param {string} documentId - Document ID
   * @returns {Promise<Object>} Updated document data
   */
  async archiveDocument(documentId) {
    if (!documentId) {
      throw new Error('Document ID is required');
    }
    return this.request(`/documents/${documentId}/archive`, {
      method: 'PATCH',
    });
  }

  /**
   * Verify document
   * @param {string} documentId - Document ID
   * @param {string} verifiedBy - Who verified the document
   * @returns {Promise<Object>} Updated document data
   */
  async verifyDocument(documentId, verifiedBy) {
    if (!documentId) {
      throw new Error('Document ID is required');
    }
    if (!verifiedBy) {
      throw new Error('Verified by information is required');
    }
    return this.request(`/documents/${documentId}/verify`, {
      method: 'PATCH',
      body: JSON.stringify({ verifiedBy }),
    });
  }

  /**
   * Get documents by reference (type and refId)
   * @param {string} type - Document type
   * @param {string} refId - Reference ID
   * @returns {Promise<Object>} Related documents
   */
  async getDocumentsByReference(type, refId) {
    if (!type || !refId) {
      throw new Error('Type and reference ID are required');
    }
    return this.request(`/documents/reference/${type}/${refId}`);
  }

  /**
   * Get user documents
   * @param {string} userId - User ID
   * @returns {Promise<Object>} User's documents
   */
  async getUserDocuments(userId) {
    if (!userId) {
      throw new Error('User ID is required');
    }
    return this.request(`/documents/user/${userId}`);
  }

  /**
   * Get document statistics
   * @returns {Promise<Object>} Document statistics
   */
  async getDocumentStats() {
    return this.request('/documents/stats/overview');
  }

  // ==================== FILE UPLOAD/DOWNLOAD METHODS ====================

  /**
   * Upload single document
   * @param {File} file - File to upload
   * @param {Object} metadata - Document metadata
   * @param {string} metadata.type - Document type
   * @param {string} metadata.docType - Document category
   * @param {string} metadata.uploadedBy - Uploader ID
   * @param {string} metadata.uploadedByRole - Uploader role
   * @param {string} [metadata.userId] - Associated user ID
   * @param {string} [metadata.refId] - Reference ID
   * @param {string} [metadata.description] - Document description
   * @param {string} [metadata.tags] - Comma-separated tags
   * @returns {Promise<Object>} Upload response with document data
   */
  async uploadDocument(file, metadata) {
    if (!file) {
      throw new Error('File is required');
    }
    if (!metadata || !metadata.type || !metadata.docType || !metadata.uploadedBy || !metadata.uploadedByRole) {
      throw new Error('Required metadata fields: type, docType, uploadedBy, uploadedByRole');
    }

    const formData = new FormData();
    formData.append('document', file);
    
    // Append metadata fields
    Object.keys(metadata).forEach(key => {
      if (metadata[key] !== undefined && metadata[key] !== null) {
        formData.append(key, metadata[key]);
      }
    });

    return this.uploadRequest('/files/upload', formData);
  }

  /**
   * Upload multiple documents
   * @param {File[]} files - Files to upload
   * @param {Object} metadata - Shared document metadata
   * @returns {Promise<Object>} Upload response with documents data
   */
  async uploadMultipleDocuments(files, metadata) {
    if (!files || !Array.isArray(files) || files.length === 0) {
      throw new Error('Files array is required');
    }
    if (!metadata || !metadata.type || !metadata.docType || !metadata.uploadedBy || !metadata.uploadedByRole) {
      throw new Error('Required metadata fields: type, docType, uploadedBy, uploadedByRole');
    }

    const formData = new FormData();
    
    // Append all files
    files.forEach(file => {
      formData.append('documents', file);
    });
    
    // Append metadata fields
    Object.keys(metadata).forEach(key => {
      if (metadata[key] !== undefined && metadata[key] !== null) {
        formData.append(key, metadata[key]);
      }
    });

    return this.uploadRequest('/files/upload/multiple', formData);
  }

  /**
   * Download document
   * @param {string} documentId - Document ID
   * @returns {Promise<Blob>} File blob
   */
  async downloadDocument(documentId) {
    if (!documentId) {
      throw new Error('Document ID is required');
    }

    const response = await this.downloadRequest(`/files/${documentId}/download`);
    return response.blob();
  }

  /**
   * Download document with filename
   * @param {string} documentId - Document ID
   * @returns {Promise<{blob: Blob, filename: string}>} File blob with filename
   */
  async downloadDocumentWithFilename(documentId) {
    if (!documentId) {
      throw new Error('Document ID is required');
    }

    const response = await this.downloadRequest(`/files/${documentId}/download`);
    const contentDisposition = response.headers.get('content-disposition');
    const filename = contentDisposition 
      ? contentDisposition.split('filename="')[1]?.split('"')[0] || 'document'
      : 'document';
    
    const blob = await response.blob();
    return { blob, filename };
  }

  /**
   * Delete document file permanently
   * @param {string} documentId - Document ID
   * @returns {Promise<Object>} Deletion confirmation
   */
  async deleteDocumentFile(documentId) {
    if (!documentId) {
      throw new Error('Document ID is required');
    }
    return this.request(`/files/${documentId}/delete`, {
      method: 'DELETE',
    });
  }

  // ==================== UTILITY METHODS ====================

  /**
   * Get documents by type
   * @param {string} type - Document type
   * @returns {Promise<Object>} Filtered documents
   */
  async getDocumentsByType(type) {
    const validTypes = ['policy', 'claim', 'user', 'general'];
    if (!validTypes.includes(type)) {
      throw new Error(`Invalid type. Must be one of: ${validTypes.join(', ')}`);
    }
    return this.getDocuments({ type });
  }

  /**
   * Get documents by category
   * @param {string} docType - Document category
   * @returns {Promise<Object>} Filtered documents
   */
  async getDocumentsByCategory(docType) {
    const validCategories = [
      'nic', 'passport', 'invoice', 'medical_bill', 'police_report',
      'photo', 'receipt', 'policy_document', 'claim_form', 
      'supporting_document', 'other'
    ];
    if (!validCategories.includes(docType)) {
      throw new Error(`Invalid category. Must be one of: ${validCategories.join(', ')}`);
    }
    return this.getDocuments({ docType });
  }

  /**
   * Get active documents only
   * @returns {Promise<Object>} Active documents
   */
  async getActiveDocuments() {
    return this.getDocuments({ status: 'active' });
  }

  /**
   * Get archived documents only
   * @returns {Promise<Object>} Archived documents
   */
  async getArchivedDocuments() {
    return this.getDocuments({ status: 'archived' });
  }

  /**
   * Get verified documents only
   * @param {Object} additionalParams - Additional query parameters
   * @returns {Promise<Object>} Verified documents
   */
  async getVerifiedDocuments(additionalParams = {}) {
    // Note: This would require backend support for isVerified filter
    return this.getDocuments({ ...additionalParams, isVerified: true });
  }

  /**
   * Search documents by metadata
   * @param {Object} searchParams - Search parameters
   * @param {string} searchParams.description - Search in description
   * @param {string} searchParams.tags - Search in tags
   * @param {string} searchParams.documentNumber - Search by document number
   * @returns {Promise<Object>} Search results
   */
  async searchDocuments(searchParams) {
    // This would require backend implementation of search functionality
    const queryString = new URLSearchParams(
      Object.entries(searchParams).filter(([_, value]) => value !== undefined && value !== '')
    ).toString();
    
    return this.request(`/documents/search?${queryString}`);
  }

  /**
   * Bulk archive documents
   * @param {string[]} documentIds - Array of document IDs
   * @returns {Promise<Array>} Array of archive results
   */
  async bulkArchiveDocuments(documentIds) {
    if (!Array.isArray(documentIds) || documentIds.length === 0) {
      throw new Error('Document IDs array is required');
    }
    
    const archivePromises = documentIds.map(id => 
      this.archiveDocument(id).catch(error => ({
        documentId: id,
        error: error.message,
        success: false
      }))
    );

    return Promise.allSettled(archivePromises);
  }

  /**
   * Bulk verify documents
   * @param {string[]} documentIds - Array of document IDs
   * @param {string} verifiedBy - Who verified the documents
   * @returns {Promise<Array>} Array of verification results
   */
  async bulkVerifyDocuments(documentIds, verifiedBy) {
    if (!Array.isArray(documentIds) || documentIds.length === 0) {
      throw new Error('Document IDs array is required');
    }
    if (!verifiedBy) {
      throw new Error('Verified by information is required');
    }
    
    const verifyPromises = documentIds.map(id => 
      this.verifyDocument(id, verifiedBy).catch(error => ({
        documentId: id,
        error: error.message,
        success: false
      }))
    );

    return Promise.allSettled(verifyPromises);
  }

  /**
   * Validate file before upload
   * @param {File} file - File to validate
   * @returns {Object} Validation result
   */
  validateFile(file) {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = [
      'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
      'application/pdf', 'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain', 'text/csv'
    ];

    const errors = [];

    if (!file) {
      errors.push('No file provided');
      return { valid: false, errors };
    }

    if (file.size > maxSize) {
      errors.push(`File size ${this.formatFileSize(file.size)} exceeds maximum limit of ${this.formatFileSize(maxSize)}`);
    }

    if (!allowedTypes.includes(file.type)) {
      errors.push(`File type ${file.type} is not supported`);
    }

    return {
      valid: errors.length === 0,
      errors,
      fileInfo: {
        name: file.name,
        size: file.size,
        type: file.type,
        formattedSize: this.formatFileSize(file.size)
      }
    };
  }

  /**
   * Format file size in human readable format
   * @param {number} bytes - File size in bytes
   * @returns {string} Formatted size
   */
  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  }

  /**
   * Create download link for document
   * @param {string} documentId - Document ID
   * @param {string} filename - Filename for download
   * @returns {Promise<string>} Download URL
   */
  async createDownloadLink(documentId, filename = 'document') {
    const { blob } = await this.downloadDocumentWithFilename(documentId);
    const url = window.URL.createObjectURL(blob);
    return url;
  }

  /**
   * Trigger browser download for document
   * @param {string} documentId - Document ID
   * @param {string} [customFilename] - Custom filename
   */
  async triggerDownload(documentId, customFilename) {
    const { blob, filename } = await this.downloadDocumentWithFilename(documentId);
    const url = window.URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = customFilename || filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }
}

// Create and export singleton instance
const documentApiService = new DocumentApiService();
export default documentApiService;

// Also export the class for custom instances if needed
export { DocumentApiService };