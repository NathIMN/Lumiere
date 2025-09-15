import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Download, 
  Edit, 
  Trash2, 
  Eye, 
  Filter, 
  Search, 
  CheckCircle, 
  AlertCircle,
  Calendar,
  User,
  Tag,
  Archive,
  RefreshCw,
  MoreVertical
} from 'lucide-react';
import documentApiService from '../../services/document-api';

// Helper functions
const formatFileSize = (bytes) => {
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  if (bytes === 0) return '0 Bytes';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + ' ' + sizes[i];
};

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const getFileIcon = (mimeType) => {
  if (mimeType.startsWith('image/')) return '🖼️';
  if (mimeType === 'application/pdf') return '📄';
  if (mimeType.includes('word')) return '📝';
  if (mimeType.includes('excel') || mimeType.includes('sheet')) return '📊';
  if (mimeType.startsWith('text/')) return '📄';
  return '📎';
};

// Document Card Component for Grid Layout
const DocumentCard = ({ document, onPreview, onDownload, onEdit, onDelete, onArchive, onVerify, documentCategories }) => {
  const [thumbnailUrl, setThumbnailUrl] = useState(null);
  const [thumbnailLoading, setThumbnailLoading] = useState(true);

  useEffect(() => {
    const loadThumbnail = async () => {
      // Only load thumbnails for images
      if (document.mimeType.startsWith('image/')) {
        try {
          const response = await fetch(`${documentApiService.baseURL}/files/${document._id}/download`, {
            headers: documentApiService.getAuthHeaders()
          });
          
          if (response.ok) {
            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            setThumbnailUrl(url);
          }
        } catch (err) {
          console.error('Error loading thumbnail:', err);
        }
      }
      setThumbnailLoading(false);
    };

    loadThumbnail();

    return () => {
      if (thumbnailUrl) {
        URL.revokeObjectURL(thumbnailUrl);
      }
    };
  }, [document._id, document.mimeType]);

  return (
    <div className="bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 shadow-sm hover:shadow-md transition-shadow">
      {/* Preview Section */}
      <div 
        className="relative h-48 bg-gray-50 dark:bg-gray-800 rounded-t-lg cursor-pointer overflow-hidden group"
        onClick={() => onPreview(document)}
      >
        {thumbnailLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : thumbnailUrl ? (
          <img 
            src={thumbnailUrl} 
            alt={document.originalName}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <span className="text-4xl mb-2">{getFileIcon(document.mimeType)}</span>
            <span className="text-sm font-medium">
              {document.mimeType === 'application/pdf' ? 'PDF' :
               document.mimeType.includes('word') ? 'Word' :
               document.mimeType.includes('excel') ? 'Excel' : 
               'Document'}
            </span>
          </div>
        )}
        
        {/* Quick Actions Overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPreview(document);
            }}
            className="bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 p-2 rounded-full shadow-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            title="Preview"
          >
            <Eye className="h-5 w-5" />
          </button>
        </div>

        {/* Status Badges */}
        <div className="absolute top-2 left-2 flex gap-1">
          {document.isVerified ? (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
              <CheckCircle className="h-3 w-3 mr-1" />
              Verified
            </span>
          ) : (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400">
              <AlertCircle className="h-3 w-3 mr-1" />
              Pending
            </span>
          )}
        </div>

        <div className="absolute top-2 right-2">
          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize ${
            document.status === 'active' 
              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
              : document.status === 'archived'
              ? 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
              : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
          }`}>
            {document.status}
          </span>
        </div>
      </div>

      {/* Document Info */}
      <div className="p-4">
        <div className="mb-2">
          <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate" title={document.originalName}>
            {document.originalName}
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            <span className="capitalize">{document.type}</span> • {
              documentCategories.find(cat => cat.value === document.docType)?.label || document.docType
            }
          </p>
        </div>

        {document.metadata?.description && (
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
            {document.metadata.description}
          </p>
        )}

        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-3">
          <span>{formatFileSize(document.size)}</span>
          <span>{formatDate(document.createdAt)}</span>
        </div>

        <div className="mb-3">
          <p className="text-xs text-gray-600 dark:text-gray-400">
            <span className="font-medium">Uploaded by:</span> {document.uploadedBy}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-500 capitalize">
            {document.uploadedByRole}
          </p>
        </div>

        {/* Tags */}
        {document.metadata?.tags && document.metadata.tags.length > 0 && (
          <div className="mb-3">
            <div className="flex flex-wrap gap-1">
              {document.metadata.tags.slice(0, 3).map((tag, index) => (
                <span 
                  key={index} 
                  className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400 text-xs rounded"
                >
                  {tag}
                </span>
              ))}
              {document.metadata.tags.length > 3 && (
                <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-900/20 text-gray-600 dark:text-gray-400 text-xs rounded">
                  +{document.metadata.tags.length - 3}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => onDownload(document)}
              className="text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 p-1"
              title="Download"
            >
              <Download className="h-4 w-4" />
            </button>
            <button
              onClick={() => onEdit(document)}
              className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 p-1"
              title="Edit"
            >
              <Edit className="h-4 w-4" />
            </button>
            {!document.isVerified && (
              <button
                onClick={() => onVerify(document)}
                className="text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 p-1"
                title="Verify"
              >
                <CheckCircle className="h-4 w-4" />
              </button>
            )}
          </div>
          
          <div className="flex items-center gap-1">
            {document.status === 'active' && (
              <button
                onClick={() => onArchive(document)}
                className="text-gray-600 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 p-1"
                title="Archive"
              >
                <Archive className="h-4 w-4" />
              </button>
            )}
            <button
              onClick={() => onDelete(document)}
              className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 p-1"
              title="Delete"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const DocumentPool = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    type: '',
    docType: '',
    status: 'active',
    isVerified: '',
    uploadedByRole: '',
    search: ''
  });
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [stats, setStats] = useState({});
  
  const documentApi = documentApiService;

  // Document type and category mappings from the model
  const documentTypes = [
    { value: 'policy', label: 'Policy' },
    { value: 'claim', label: 'Claim' },
    { value: 'user', label: 'User' },
    { value: 'general', label: 'General' }
  ];

  const documentCategories = [
    { value: 'nic', label: 'NIC' },
    { value: 'passport', label: 'Passport' },
    { value: 'invoice', label: 'Invoice' },
    { value: 'medical_bill', label: 'Medical Bill' },
    { value: 'police_report', label: 'Police Report' },
    { value: 'photo', label: 'Photo' },
    { value: 'receipt', label: 'Receipt' },
    { value: 'policy_document', label: 'Policy Document' },
    { value: 'claim_form', label: 'Claim Form' },
    { value: 'supporting_document', label: 'Supporting Document' },
    { value: 'other', label: 'Other' }
  ];

  const roleTypes = [
    { value: 'employee', label: 'Employee' },
    { value: 'hr_officer', label: 'HR Officer' },
    { value: 'insurance_agent', label: 'Insurance Agent' },
    { value: 'admin', label: 'Admin' }
  ];

  // Load documents and stats on component mount and when filters change
  useEffect(() => {
    loadDocuments();
    loadStats();
  }, [filters]);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      const queryParams = Object.fromEntries(
        Object.entries(filters).filter(([_, value]) => value !== '' && value !== null)
      );
      
      const response = await documentApi.getDocuments(queryParams);
      let filteredDocs = response.documents || [];
      
      // Apply client-side search filter
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        filteredDocs = filteredDocs.filter(doc => 
          doc.originalName.toLowerCase().includes(searchTerm) ||
          doc.metadata?.description?.toLowerCase().includes(searchTerm) ||
          doc.metadata?.tags?.some(tag => tag.toLowerCase().includes(searchTerm)) ||
          doc.uploadedBy.toLowerCase().includes(searchTerm)
        );
      }
      
      setDocuments(filteredDocs);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Error loading documents:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await documentApi.getDocumentStats();
      setStats(response);
    } catch (err) {
      console.error('Error loading stats:', err);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      type: '',
      docType: '',
      status: 'active',
      isVerified: '',
      uploadedByRole: '',
      search: ''
    });
  };

  const handleDownload = async (documentItem) => {
    try {
      // Use the API service's download method instead of direct blob access
      await documentApi.triggerDownload(documentItem._id, documentItem.originalName);
      
      // Log the download action
      await documentApi.getDocumentById(documentItem._id); // This logs the access
    } catch (err) {
      console.error('Error downloading document:', err);
      alert('Failed to download document: ' + err.message);
    }
  };

  const handleEdit = (document) => {
    setSelectedDocument(document);
    setShowEditModal(true);
  };

  const handleDelete = async (document) => {
    if (window.confirm(`Are you sure you want to delete "${document.originalName}"?`)) {
      try {
        await documentApi.deleteDocument(document._id);
        loadDocuments(); // Refresh the list
        alert('Document deleted successfully');
      } catch (err) {
        console.error('Error deleting document:', err);
        alert('Failed to delete document');
      }
    }
  };

  const handleArchive = async (document) => {
    if (window.confirm(`Are you sure you want to archive "${document.originalName}"?`)) {
      try {
        await documentApi.archiveDocument(document._id);
        loadDocuments(); // Refresh the list
        alert('Document archived successfully');
      } catch (err) {
        console.error('Error archiving document:', err);
        alert('Failed to archive document');
      }
    }
  };

  const handleVerify = async (document) => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      await documentApi.verifyDocument(document._id, user.name || 'HR Officer');
      loadDocuments(); // Refresh the list
      alert('Document verified successfully');
    } catch (err) {
      console.error('Error verifying document:', err);
      alert('Failed to verify document');
    }
  };

  const handlePreview = (document) => {
    setSelectedDocument(document);
    setShowPreview(true);
  };

  const formatFileSize = (bytes) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="p-6 bg-white dark:bg-neutral-900 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <FileText className="h-8 w-8 text-blue-600" />
            Document Pool
          </h1>
          <div className="flex gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                showFilters 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              <Filter className="h-4 w-4" />
              Filters
            </button>
            <button
              onClick={loadDocuments}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <div className="text-blue-600 dark:text-blue-400 text-sm font-medium">Total Documents</div>
            <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">{documents.length}</div>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
            <div className="text-green-600 dark:text-green-400 text-sm font-medium">Verified</div>
            <div className="text-2xl font-bold text-green-900 dark:text-green-100">
              {documents.filter(doc => doc.isVerified).length}
            </div>
          </div>
          <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
            <div className="text-yellow-600 dark:text-yellow-400 text-sm font-medium">Pending Verification</div>
            <div className="text-2xl font-bold text-yellow-900 dark:text-yellow-100">
              {documents.filter(doc => !doc.isVerified).length}
            </div>
          </div>
          <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
            <div className="text-purple-600 dark:text-purple-400 text-sm font-medium">Total Size</div>
            <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">
              {formatFileSize(documents.reduce((sum, doc) => sum + doc.size, 0))}
            </div>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg mb-4">
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {/* Search */}
              <div className="lg:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Search
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search documents..."
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    className="pl-10 w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Document Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Type
                </label>
                <select
                  value={filters.type}
                  onChange={(e) => handleFilterChange('type', e.target.value)}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">All Types</option>
                  {documentTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>

              {/* Document Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Category
                </label>
                <select
                  value={filters.docType}
                  onChange={(e) => handleFilterChange('docType', e.target.value)}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">All Categories</option>
                  {documentCategories.map(category => (
                    <option key={category.value} value={category.value}>{category.label}</option>
                  ))}
                </select>
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Status
                </label>
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="active">Active</option>
                  <option value="archived">Archived</option>
                  <option value="deleted">Deleted</option>
                </select>
              </div>

              {/* Verification Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Verified
                </label>
                <select
                  value={filters.isVerified}
                  onChange={(e) => handleFilterChange('isVerified', e.target.value)}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">All</option>
                  <option value="true">Verified</option>
                  <option value="false">Unverified</option>
                </select>
              </div>
            </div>
            
            <div className="mt-4 flex gap-2">
              <button
                onClick={clearFilters}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4">
          <div className="flex items-center gap-2 text-red-800 dark:text-red-200">
            <AlertCircle className="h-5 w-5" />
            <span>Error: {error}</span>
          </div>
        </div>
      )}

      {/* Documents Grid */}
      {!loading && !error && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          {documents.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No documents found</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Try adjusting your filters or search terms.
              </p>
            </div>
          ) : (
            <div className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {documents.map((document) => (
                  <DocumentCard 
                    key={document._id} 
                    document={document} 
                    onPreview={handlePreview}
                    onDownload={handleDownload}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onArchive={handleArchive}
                    onVerify={handleVerify}
                    documentCategories={documentCategories}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Preview Modal */}
      {showPreview && selectedDocument && (
        <DocumentPreviewModal 
          document={selectedDocument} 
          onClose={() => setShowPreview(false)} 
        />
      )}

      {/* Edit Modal */}
      {showEditModal && selectedDocument && (
        <DocumentEditModal 
          document={selectedDocument} 
          onClose={() => setShowEditModal(false)}
          onSave={loadDocuments}
        />
      )}
    </div>
  );
};

// Document Preview Modal Component
const DocumentPreviewModal = ({ document, onClose }) => {
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const canPreview = (mimeType) => {
    return mimeType.startsWith('image/') || mimeType === 'application/pdf' || mimeType.startsWith('text/');
  };

  useEffect(() => {
    const loadPreview = async () => {
      if (!canPreview(document.mimeType)) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        // For images and PDFs, create a blob URL from the download endpoint
        const response = await fetch(`${documentApiService.baseURL}/files/${document._id}/download`, {
          headers: documentApiService.getAuthHeaders()
        });
        
        if (!response.ok) {
          throw new Error(`Failed to load preview: ${response.status}`);
        }
        
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        setPreviewUrl(url);
      } catch (err) {
        console.error('Preview load error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadPreview();

    // Cleanup blob URL on unmount
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [document._id, document.mimeType]);

  const handleDownload = async () => {
    try {
      await documentApiService.triggerDownload(document._id, document.originalName);
    } catch (err) {
      console.error('Error downloading document:', err);
      alert('Failed to download document: ' + err.message);
    }
  };

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center z-50 p-4"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.4)" }}
    >
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl max-h-[90vh] w-full flex flex-col shadow-xl">
        <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Document Preview: {document.originalName}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="flex-1 p-4 overflow-auto">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600 dark:text-gray-400">Loading preview...</span>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <FileText className="mx-auto h-16 w-16 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                Preview failed
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {error}
              </p>
              <button 
                onClick={handleDownload}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Download className="h-4 w-4 inline mr-2" />
                Download File
              </button>
            </div>
          ) : canPreview(document.mimeType) && previewUrl ? (
            <div className="w-full h-full flex justify-center">
              {document.mimeType.startsWith('image/') ? (
                <img 
                  src={previewUrl} 
                  alt={document.originalName}
                  className="max-w-full max-h-full object-contain"
                />
              ) : document.mimeType === 'application/pdf' ? (
                <iframe 
                  src={previewUrl}
                  className="w-full h-96 border rounded"
                  title={document.originalName}
                />
              ) : (
                <iframe 
                  src={previewUrl}
                  className="w-full h-96 border rounded"
                  title={document.originalName}
                />
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <FileText className="mx-auto h-16 w-16 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                Preview not available
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                This file type cannot be previewed. You can download it to view the content.
              </p>
              <button 
                onClick={handleDownload}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Download className="h-4 w-4 inline mr-2" />
                Download File
              </button>
            </div>
          )}
        </div>

        {/* Document Details */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-700">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-900 dark:text-white">Size:</span>
              <p className="text-gray-600 dark:text-gray-400">{formatFileSize(document.size)}</p>
            </div>
            <div>
              <span className="font-medium text-gray-900 dark:text-white">Type:</span>
              <p className="text-gray-600 dark:text-gray-400 capitalize">{document.type}</p>
            </div>
            <div>
              <span className="font-medium text-gray-900 dark:text-white">Uploaded:</span>
              <p className="text-gray-600 dark:text-gray-400">{formatDate(document.createdAt)}</p>
            </div>
            <div>
              <span className="font-medium text-gray-900 dark:text-white">Verified:</span>
              <p className="text-gray-600 dark:text-gray-400">
                {document.isVerified ? 'Yes' : 'No'}
              </p>
            </div>
          </div>
          {document.metadata?.tags && document.metadata.tags.length > 0 && (
            <div className="mt-3">
              <span className="font-medium text-gray-900 dark:text-white">Tags:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {document.metadata.tags.map((tag, index) => (
                  <span 
                    key={index} 
                    className="px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400 text-xs rounded"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Document Edit Modal Component
const DocumentEditModal = ({ document, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    type: document.type,
    docType: document.docType,
    metadata: {
      description: document.metadata?.description || '',
      tags: document.metadata?.tags?.join(', ') || '',
      isConfidential: document.metadata?.isConfidential || false,
      expiryDate: document.metadata?.expiryDate ? 
        new Date(document.metadata.expiryDate).toISOString().split('T')[0] : ''
    }
  });
  const [saving, setSaving] = useState(false);
  
  const documentApi = documentApiService;

  const documentTypes = [
    { value: 'policy', label: 'Policy' },
    { value: 'claim', label: 'Claim' },
    { value: 'user', label: 'User' },
    { value: 'general', label: 'General' }
  ];

  const documentCategories = [
    { value: 'nic', label: 'NIC' },
    { value: 'passport', label: 'Passport' },
    { value: 'invoice', label: 'Invoice' },
    { value: 'medical_bill', label: 'Medical Bill' },
    { value: 'police_report', label: 'Police Report' },
    { value: 'photo', label: 'Photo' },
    { value: 'receipt', label: 'Receipt' },
    { value: 'policy_document', label: 'Policy Document' },
    { value: 'claim_form', label: 'Claim Form' },
    { value: 'supporting_document', label: 'Supporting Document' },
    { value: 'other', label: 'Other' }
  ];

  const handleSave = async () => {
    try {
      setSaving(true);
      
      const updateData = {
        type: formData.type,
        docType: formData.docType,
        metadata: {
          ...formData.metadata,
          tags: formData.metadata.tags 
            ? formData.metadata.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
            : [],
          expiryDate: formData.metadata.expiryDate || null
        }
      };

      await documentApi.updateDocument(document._id, updateData);
      onSave(); // Refresh the parent component
      onClose();
      alert('Document updated successfully');
    } catch (err) {
      console.error('Error updating document:', err);
      alert('Failed to update document');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center z-50 p-4"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.4)" }}
    >
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full shadow-xl">
        <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Edit Document: {document.originalName}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="p-4">
          <div className="space-y-4">
            {/* Document Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Document Type
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                {documentTypes.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>

            {/* Document Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Document Category
              </label>
              <select
                value={formData.docType}
                onChange={(e) => setFormData(prev => ({ ...prev, docType: e.target.value }))}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                {documentCategories.map(category => (
                  <option key={category.value} value={category.value}>{category.label}</option>
                ))}
              </select>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description
              </label>
              <textarea
                value={formData.metadata.description}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  metadata: { ...prev.metadata, description: e.target.value }
                }))}
                rows={3}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Enter document description..."
              />
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Tags (comma-separated)
              </label>
              <input
                type="text"
                value={formData.metadata.tags}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  metadata: { ...prev.metadata, tags: e.target.value }
                }))}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="tag1, tag2, tag3..."
              />
            </div>

            {/* Expiry Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Expiry Date (optional)
              </label>
              <input
                type="date"
                value={formData.metadata.expiryDate}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  metadata: { ...prev.metadata, expiryDate: e.target.value }
                }))}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            {/* Confidential */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isConfidential"
                checked={formData.metadata.isConfidential}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  metadata: { ...prev.metadata, isConfidential: e.target.checked }
                }))}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="isConfidential" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                Mark as confidential
              </label>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 p-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DocumentPool;