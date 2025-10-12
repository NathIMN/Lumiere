import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Upload, 
  FileText, 
  Search, 
  User, 
  Shield, 
  FileCheck,
  Loader2,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import documentApiService from '../services/document-api';
import { useAuth } from '../context/AuthContext';

const AddDocumentModal = ({ isOpen, onClose, onSuccess }) => {
  const { user } = useAuth(); // Get user from auth context
  
  const [formData, setFormData] = useState({
    type: '',
    docType: '',
    refId: '',
    description: '',
    tags: '',
    isConfidential: false
  });
  
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [selectedEntity, setSelectedEntity] = useState(null);
  const [showSearch, setShowSearch] = useState(false);
  const [errors, setErrors] = useState({});
  
  const fileInputRef = useRef(null);
  const searchTimeoutRef = useRef(null);

  const documentTypes = [
    { value: 'policy', label: 'Policy Document', description: 'Link to an insurance policy' },
    { value: 'claim', label: 'Claim Document', description: 'Link to an insurance claim' },
    { value: 'user', label: 'User Document', description: 'Link to a specific user' },
    { value: 'general', label: 'General Document', description: 'No specific linking required' }
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
    { value: 'discharge_summary', label: 'Discharge Summary' },
    { value: 'prescription', label: 'Prescription' },
    { value: 'lab_report', label: 'Lab Report' },
    { value: 'channelling_receipt', label: 'Channelling Receipt' },
    { value: 'doctor_report', label: 'Doctor Report' },
    { value: 'pharmacy_receipt', label: 'Pharmacy Receipt' },
    { value: 'medical_report', label: 'Medical Report' },
    { value: 'death_certificate', label: 'Death Certificate' },
    { value: 'damage_assessment', label: 'Damage Assessment' },
    { value: 'repair_estimate', label: 'Repair Estimate' },
    { value: 'photos', label: 'Photos' },
    { value: 'fir_copy', label: 'FIR Copy' },
    { value: 'vehicle_registration', label: 'Vehicle Registration' },
    { value: 'fire_department_report', label: 'Fire Department Report' },
    { value: 'weather_report', label: 'Weather Report' },
    { value: 'questionnaire_answer', label: 'Questionnaire Answer' },
    { value: 'other', label: 'Other' }
  ];

  const roleTypes = [
    { value: 'employee', label: 'Employee' },
    { value: 'hr_officer', label: 'HR Officer' },
    { value: 'insurance_agent', label: 'Insurance Agent' },
    { value: 'admin', label: 'Admin' }
  ];

  useEffect(() => {
    if (formData.type && formData.type !== 'general') {
      setShowSearch(true);
    } else {
      setShowSearch(false);
      setSelectedEntity(null);
      setSearchResults([]);
      setSearchTerm('');
      // Clear refId when changing away from linkable types
      setFormData(prev => ({ ...prev, refId: '' }));
    }
    // Always clear search when type changes to start fresh
    setSelectedEntity(null);
    setSearchResults([]);
    setSearchTerm('');
    setFormData(prev => ({ ...prev, refId: '' }));
  }, [formData.type]);

  useEffect(() => {
    if (searchTerm && showSearch) {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
      
      searchTimeoutRef.current = setTimeout(() => {
        performSearch(searchTerm);
      }, 500);
    } else {
      setSearchResults([]);
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchTerm, formData.type, showSearch]);

  const performSearch = async (term) => {
    if (!term.trim() || term.length < 2) {
      setSearchResults([]);
      return;
    }

    setSearching(true);
    try {
      let results = [];
      
      switch (formData.type) {
        case 'user':
          const userResponse = await documentApiService.searchUsers(term);
          results = userResponse.users || [];
          break;
        case 'policy':
          const policyResponse = await documentApiService.searchPolicies(term);
          results = policyResponse.policies || [];
          break;
        case 'claim':
          const claimResponse = await documentApiService.searchClaims(term);
          results = claimResponse.claims || [];
          break;
        default:
          results = [];
      }
      
      setSearchResults(results);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  const handleFileSelect = (event) => {
    console.log('File select event triggered');
    const file = event.target.files[0];
    console.log('Selected file:', file);
    processFile(file);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    processFile(file);
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const processFile = (file) => {
    if (!file) return;

    console.log('Processing file:', file.name, 'Type:', file.type, 'Size:', file.size);

    // Clear any previous file errors
    const newErrors = { ...errors };
    delete newErrors.file;
    setErrors(newErrors);

    // Basic validation first
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = [
      'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain', 'text/csv'
    ];

    if (file.size > maxSize) {
      console.log('File too large:', file.size);
      setErrors(prev => ({ ...prev, file: 'File size cannot exceed 10MB' }));
      return;
    }

    if (!allowedTypes.includes(file.type)) {
      console.log('File type not allowed:', file.type);
      setErrors(prev => ({ ...prev, file: `File type "${file.type}" not supported. Please upload images, PDFs, Word documents, Excel files, or text files.` }));
      return;
    }

    console.log('File validation passed, setting selected file');
    setSelectedFile(file);
  };

  const clearSelectedFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    const newErrors = { ...errors };
    delete newErrors.file;
    setErrors(newErrors);
  };

  const handleEntitySelect = (entity) => {
    setSelectedEntity(entity);
    setFormData({ ...formData, refId: entity._id });
    setSearchTerm(getEntityDisplayText(entity));
    setSearchResults([]);
  };

  const getEntityDisplayText = (entity) => {
    if (!entity) return '';
    
    switch (formData.type) {
      case 'user':
        // Try different possible property names including nested profile structure
        const firstName = entity.profile?.firstName || entity.firstName || entity.first_name || entity.fname || '';
        const lastName = entity.profile?.lastName || entity.lastName || entity.last_name || entity.lname || '';
        const fullName = entity.fullName || entity.full_name || entity.name || '';
        const userEmail = entity.email || '';
        
        // Build name from available parts
        let userName = '';
        if (fullName) {
          userName = fullName;
        } else if (firstName || lastName) {
          userName = `${firstName} ${lastName}`.trim();
        }
        
        return userName ? `${userName} (${userEmail})` : userEmail;
      case 'policy':
        const policyId = entity.policyId || entity.policyNumber || '';
        const policyType = entity.policyType || '';
        const policyCategory = entity.policyCategory || entity.category || '';
        const provider = entity.provider || '';
        
        // Build policy display with category info
        let policyInfo = `${policyId} - ${policyType}`;
        if (policyCategory) {
          policyInfo += ` (${policyCategory === 'group' ? 'Group' : policyCategory === 'individual' ? 'Individual' : policyCategory})`;
        } else if (provider) {
          policyInfo += ` (${provider})`;
        }
        
        return policyInfo.replace(/\s+/g, ' ').trim();
      case 'claim':
        return `${entity.claimId || ''} - ${entity.claimType || ''}`.trim();
      default:
        return '';
    }
  };

  const getDetailedEntityDisplayText = (entity) => {
    if (!entity) return '';
    
    switch (formData.type) {
      case 'user':
        // Try different possible property names including nested profile structure
        const firstName = entity.profile?.firstName || entity.firstName || entity.first_name || entity.fname || '';
        const lastName = entity.profile?.lastName || entity.lastName || entity.last_name || entity.lname || '';
        const fullName = entity.fullName || entity.full_name || entity.name || '';
        const userEmail = entity.email || '';
        
        // Build name from available parts
        let userName = '';
        if (fullName) {
          userName = fullName;
        } else if (firstName || lastName) {
          userName = `${firstName} ${lastName}`.trim();
        }
        
        // For search dropdown, just show name and email as requested
        return userName ? `${userName} (${userEmail})` : userEmail;
      case 'policy':
        const policyId = entity.policyId || entity.policyNumber || '';
        const policyType = entity.policyType || '';
        const policyCategory = entity.policyCategory || entity.category || '';
        const provider = entity.provider || '';
        const status = entity.status || '';
        
        let policyDisplay = `${policyId} - ${policyType}`;
        if (policyCategory) {
          policyDisplay += ` (${policyCategory === 'group' ? 'Group Policy' : policyCategory === 'individual' ? 'Individual Policy' : policyCategory})`;
        } else if (provider) {
          policyDisplay += ` (${provider})`;
        }
        if (status) policyDisplay += ` - ${status}`;
        
        return policyDisplay.replace(/\s+/g, ' ').trim();
      case 'claim':
        const claimId = entity.claimId || '';
        const claimType = entity.claimType || '';
        const claimStatus = entity.claimStatus || entity.status || '';
        
        let claimDisplay = `${claimId} - ${claimType}`;
        if (claimStatus) claimDisplay += ` (${claimStatus})`;
        
        return claimDisplay.trim();
      default:
        return '';
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!user) {
      newErrors.authentication = 'You must be logged in to upload documents';
      setErrors(newErrors);
      return false;
    }
    
    if (!formData.type) newErrors.type = 'Document type is required';
    if (!formData.docType) newErrors.docType = 'Document category is required';
    if (!selectedFile) newErrors.file = 'Please select a file to upload';
    if (showSearch && !selectedEntity) {
      newErrors.entity = `Please select a ${formData.type} to link this document to`;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setUploading(true);
    
    try {
      // Use current user from auth context
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      const metadata = {
        type: formData.type,
        docType: formData.docType,
        uploadedBy: user._id || user.userId || 'Unknown User ID',
        uploadedByRole: user.role || 'employee',
        description: formData.description || undefined,
        tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()) : undefined,
      };

      // Add reference ID if applicable
      if (formData.refId) {
        metadata.refId = formData.refId;
      }

      // Add user ID for user documents
      if (formData.type === 'user' && selectedEntity) {
        metadata.userId = selectedEntity.userId || selectedEntity._id;
      }

      // Set confidential flag
      if (formData.isConfidential) {
        metadata.isConfidential = true;
      }

      const response = await documentApiService.uploadDocument(selectedFile, metadata);
      
      if (response.success) {
        onSuccess && onSuccess(response.document);
        resetForm();
        onClose();
      }
    } catch (error) {
      console.error('Upload error:', error);
      setErrors({ 
        submit: error.message || 'Failed to upload document. Please try again.' 
      });
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      type: '',
      docType: '',
      refId: '',
      description: '',
      tags: '',
      isConfidential: false
    });
    setSelectedFile(null);
    setSelectedEntity(null);
    setSearchTerm('');
    setSearchResults([]);
    setErrors({});
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center p-4 z-50"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.6)" }}>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Upload className="h-5 w-5 text-blue-600" />
            Add New Document
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Document Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Document Type <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {documentTypes.map((type) => (
                <div
                  key={type.value}
                  className={`border-2 rounded-lg p-3 cursor-pointer transition-all ${
                    formData.type === type.value
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                  }`}
                  onClick={() => setFormData({ ...formData, type: type.value, refId: '' })}
                >
                  <div className="flex items-center gap-2">
                    {type.value === 'policy' && <Shield className="h-4 w-4 text-blue-600" />}
                    {type.value === 'claim' && <FileCheck className="h-4 w-4 text-green-600" />}
                    {type.value === 'user' && <User className="h-4 w-4 text-purple-600" />}
                    {type.value === 'general' && <FileText className="h-4 w-4 text-gray-600" />}
                    <span className="font-medium text-gray-900 dark:text-white">{type.label}</span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{type.description}</p>
                </div>
              ))}
            </div>
            {errors.type && <p className="mt-1 text-sm text-red-600">{errors.type}</p>}
          </div>

          {/* Entity Search (conditional) */}
          {showSearch && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Search {formData.type.charAt(0).toUpperCase() + formData.type.slice(1)} <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder={`Search for ${formData.type}...`}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                  {searching && (
                    <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 animate-spin" />
                  )}
                </div>
                
                {/* Search Results */}
                {searchResults.length > 0 && (
                  <div className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-48 overflow-y-auto">
                    {searchResults.map((entity, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => handleEntitySelect(entity)}
                        className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 focus:bg-gray-100 dark:focus:bg-gray-600 text-gray-900 dark:text-white text-sm"
                      >
                        {getDetailedEntityDisplayText(entity)}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Selected Entity Display */}
              {selectedEntity && (
                <div className="mt-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-green-800 dark:text-green-200">
                      Selected: {getEntityDisplayText(selectedEntity)}
                    </span>
                  </div>
                </div>
              )}
              
              {errors.entity && <p className="mt-1 text-sm text-red-600">{errors.entity}</p>}
            </div>
          )}

          {/* Document Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Document Category <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.docType}
              onChange={(e) => setFormData({ ...formData, docType: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="">Select document category...</option>
              {documentCategories.map((category) => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
            {errors.docType && <p className="mt-1 text-sm text-red-600">{errors.docType}</p>}
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Select File <span className="text-red-500">*</span>
            </label>
            <div 
              className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed dark:border-gray-600 rounded-md hover:border-gray-400 dark:hover:border-gray-500 transition-colors"
              onDrop={handleDrop}
              onDragOver={handleDragOver}
            >
              <div className="space-y-1 text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <div className="flex flex-col items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="cursor-pointer bg-white dark:bg-gray-800 rounded-md font-medium text-blue-600 hover:text-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 px-3 py-1 border border-blue-600"
                  >
                    Upload a file
                  </button>
                  <input
                    id="file-upload"
                    name="file-upload"
                    type="file"
                    className="hidden"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                  />
                  <p>or drag and drop</p>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  PNG, JPG, PDF, Word, Excel up to 10MB
                </p>
              </div>
            </div>
            
            {selectedFile && (
              <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-blue-600" />
                    <span className="text-sm text-blue-800 dark:text-blue-200">
                      {selectedFile.name} ({documentApiService.formatFileSize(selectedFile.size)})
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={clearSelectedFile}
                    className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
            
            {errors.file && <p className="mt-1 text-sm text-red-600">{errors.file}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="Optional description for this document..."
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tags
            </label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="Enter tags separated by commas..."
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Separate multiple tags with commas
            </p>
          </div>

          {/* Confidential Flag */}
          <div className="flex items-center">
            <input
              id="confidential"
              type="checkbox"
              checked={formData.isConfidential}
              onChange={(e) => setFormData({ ...formData, isConfidential: e.target.checked })}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="confidential" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
              Mark as confidential
            </label>
          </div>

          {/* Error Message */}
          {errors.submit && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <span className="text-sm text-red-800 dark:text-red-200">{errors.submit}</span>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              disabled={uploading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={uploading}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {uploading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  Upload Document
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddDocumentModal;