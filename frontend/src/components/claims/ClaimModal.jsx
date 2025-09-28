import React, { useState } from 'react';
import documentApiService from '../../services/document-api'; 
import { 
  X, 
  User, 
  FileText, 
  DollarSign, 
  Calendar, 
  Shield,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  XCircle,
  Clock,
  Download,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  AlertCircle,
  Info,
  Eye,
  History,
  Package,
  Coins,
  Send
} from 'lucide-react';

export const ClaimModal = ({ claim, onClose, onForward, onReturn, showDetailedQuestionnaire = true }) => {
  const [expandedSections, setExpandedSections] = useState({});
  const [selectedTab, setSelectedTab] = useState('overview');
  const [downloadingDocs, setDownloadingDocs] = useState(new Set());

  if (!claim) return null;

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    if (!amount) return 'Rs. 0';
    return `Rs. ${amount.toLocaleString('en-LK')}`;
  };

  // Fixed function to show "Today", "Yesterday", "X days ago" format
  const calculateDaysInSystem = (submittedDate) => {
    if (!submittedDate) return 'Unknown';
    
    const submitted = new Date(submittedDate);
    const now = new Date();
    
    // Reset time to midnight for accurate day comparison
    const submittedDateOnly = new Date(submitted.getFullYear(), submitted.getMonth(), submitted.getDate());
    const nowDateOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    // Calculate the difference in days
    const diffTime = nowDateOnly.getTime() - submittedDateOnly.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    // Handle different scenarios
    if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays === 2) {
      return '2 days ago';
    } else {
      return `${diffDays} days ago`;
    }
  };

  const getStatusColor = (status) => {
    const colorMap = {
      hr: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-200 dark:border-yellow-800',
      insurer: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-200 dark:border-blue-800',
      approved: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-200 dark:border-green-800',
      rejected: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-200 dark:border-red-800',
      employee: 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/20 dark:text-orange-200 dark:border-orange-800'
    };
    return colorMap[status] || 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/20 dark:text-gray-200 dark:border-gray-800';
  };

  const getStatusText = (status) => {
    const statusMap = {
      hr: 'Pending HR Review',
      insurer: 'With Insurer',
      approved: 'Approved',
      rejected: 'Rejected',
      employee: 'With Employee'
    };
    return statusMap[status] || status;
  };

  const toggleSection = (sectionIndex) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionIndex]: !prev[sectionIndex]
    }));
  };

  // HR can only take action on claims with 'hr' status
  const canTakeHRAction = claim.claimStatus === 'hr';

  // FIXED: Check coverage breakdown in both possible locations
  const hasCoverageBreakdown = (claim.coverageBreakdown && Array.isArray(claim.coverageBreakdown) && claim.coverageBreakdown.length > 0) ||
    (claim.hrForwardingDetails?.coverageBreakdown && Array.isArray(claim.hrForwardingDetails.coverageBreakdown) && claim.hrForwardingDetails.coverageBreakdown.length > 0);

  // Document handlers using DocumentApiService
  const handleViewDocument = async (doc) => {
    try {
      // Check if document has an ID (required for API calls)
      if (!doc._id && !doc.id) {
        alert('Document ID is not available. Cannot view document.');
        return;
      }

      const documentId = doc._id || doc.id;
      
      // Create a download link and open in new tab for viewing
      const downloadLink = await documentApiService.createDownloadLink(documentId, doc.originalName || doc.filename);
      window.open(downloadLink, '_blank');
      
      // Clean up the object URL after a delay
      setTimeout(() => {
        window.URL.revokeObjectURL(downloadLink);
      }, 1000);
      
    } catch (error) {
      console.error('Error viewing document:', error);
      alert(`Failed to view document: ${error.message}`);
    }
  };

  const handleDownloadDocument = async (doc) => {
    try {
      // Check if document has an ID (required for API calls)
      if (!doc._id && !doc.id) {
        alert('Document ID is not available. Cannot download document.');
        return;
      }

      const documentId = doc._id || doc.id;
      
      // Add document to downloading set to show loading state
      setDownloadingDocs(prev => new Set(prev).add(documentId));
      
      // Use the DocumentApiService to trigger download
      await documentApiService.triggerDownload(documentId, doc.originalName || doc.filename);
      
    } catch (error) {
      console.error('Error downloading document:', error);
      alert(`Failed to download document: ${error.message}`);
    } finally {
      // Remove document from downloading set
      setDownloadingDocs(prev => {
        const newSet = new Set(prev);
        newSet.delete(doc._id || doc.id);
        return newSet;
      });
    }
  };

  const renderQuestionnaireResponse = (response) => {
    const { answer } = response;
    
    if (!response.isAnswered) {
      return <span className="text-gray-400 italic">Not answered</span>;
    }

    if (answer.textValue) return answer.textValue;
    if (answer.numberValue !== null && answer.numberValue !== undefined) return answer.numberValue.toString();
    if (answer.booleanValue !== null && answer.booleanValue !== undefined) return answer.booleanValue ? 'Yes' : 'No';
    if (answer.selectValue) return answer.selectValue;
    if (answer.multiselectValue && answer.multiselectValue.length > 0) {
      return answer.multiselectValue.join(', ');
    }
    if (answer.dateValue) return formatDate(answer.dateValue);
    if (answer.fileValue) {
      return (
        <div className="flex items-center space-x-2">
          <FileText className="h-4 w-4 text-blue-600" />
          <span>File uploaded: {answer.fileValue.originalName || 'Unknown file'}</span>
          <button 
            onClick={() => handleDownloadDocument(answer.fileValue)}
            className="text-blue-600 hover:text-blue-800 text-sm p-1 hover:bg-blue-50 rounded"
            disabled={downloadingDocs.has(answer.fileValue._id || answer.fileValue.id)}
          >
            {downloadingDocs.has(answer.fileValue._id || answer.fileValue.id) ? (
              <span className="text-xs">Downloading...</span>
            ) : (
              <Download className="h-4 w-4" />
            )}
          </button>
        </div>
      );
    }

    return <span className="text-gray-400 italic">No response</span>;
  };

  // FIXED: Corrected the typo and improved the function
  const groupQuestionnaireBySection = () => {
    let responses = [];

    if (claim.questionnaire?.sections) {
      // FIXED: Changed 'response' to 'responses' - this was the main bug
      responses = claim.questionnaire.sections
        .sort((a, b) => (a.order || 0) - (b.order || 0))
        .flatMap(section =>
          (section.responses || []) // FIXED: This was 'section.response' before
            .sort((a, b) => (a.order || 0) - (b.order || 0))
            .filter(response => response.isAnswered)
            .map(response => ({
              ...response,
              section: section.title,
              sectionId: section.sectionId || section._id
            }))
        );    
    } else if (claim.questionnaire?.responses) {
      responses = claim.questionnaire.responses.filter(r => r.isAnswered);
    }

    if (responses.length === 0) {
      return [];
    }

    // Group by section if section info exists
    if (responses.length > 0 && responses[0].section) {
      const sections = {};
      responses.forEach(response => {
        const sectionTitle = response.section || 'General Questions';
        if (!sections[sectionTitle]) {
          sections[sectionTitle] = [];
        }
        sections[sectionTitle].push(response);
      });

      return Object.entries(sections).map(([title, questions]) => ({
        title,
        questions: questions.sort((a, b) => (a.order || 0) - (b.order || 0))
      }));
    } else {
      return [{
        title: 'Questionnaire Responses',
        questions: responses.sort((a, b) => (a.order || 0) - (b.order || 0))
      }];
    }
  };

  // FIXED: Updated to handle both possible coverage breakdown locations
  const renderCoverageBreakdown = () => {
    // Check both possible locations for coverage breakdown
    const coverageData = claim.coverageBreakdown || claim.hrForwardingDetails?.coverageBreakdown;
    
    if (!coverageData || !Array.isArray(coverageData) || coverageData.length === 0) {
      return null;
    }

    const calculateTotal = () => {
      return coverageData.reduce((sum, item) => sum + (item.requestedAmount || 0), 0);
    };

    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2 flex items-center space-x-2">
          <Package className="h-5 w-5 text-blue-600" />
          <span>Coverage Breakdown</span>
          <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
            (Submitted by HR)
          </span>
        </h3>
        
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="space-y-4">
            {coverageData.map((coverage, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <Shield className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Coverage Type</span>
                    </div>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {coverage.coverageType}
                    </p>
                  </div>
                  
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <Coins className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Requested Amount</span>
                    </div>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {formatCurrency(coverage.requestedAmount)}
                    </p>
                  </div>
                </div>
                
                {coverage.notes && (
                  <div className="mt-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <MessageSquare className="h-4 w-4 text-gray-600" />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Coverage Notes</span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-300 text-sm bg-gray-50 dark:bg-gray-700 p-3 rounded-md">
                      {coverage.notes}
                    </p>
                  </div>
                )}

                {/* Show when this coverage item was created */}
                {coverage.createdAt && (
                  <div className="mt-3 pt-2 border-t border-gray-200 dark:border-gray-600">
                    <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                      <Calendar className="h-3 w-3" />
                      <span>Added on: {formatDate(coverage.createdAt)}</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
            
            {/* Enhanced Total Summary */}
            <div className="bg-gradient-to-r from-blue-100 to-blue-50 dark:from-blue-900/30 dark:to-blue-900/20 border border-blue-300 dark:border-blue-600 rounded-lg p-4 mt-4">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-blue-900 dark:text-blue-200">
                  Total Coverage Amount:
                </span>
                <span className="text-xl font-bold text-blue-900 dark:text-blue-200">
                  {formatCurrency(calculateTotal())}
                </span>
              </div>
              <div className="flex justify-between items-center mt-2 text-sm">
                <span className="text-blue-700 dark:text-blue-300">
                  Original Claim Amount:
                </span>
                <span className="text-blue-700 dark:text-blue-300">
                  {formatCurrency(claim.claimAmount?.requested || 0)}
                </span>
              </div>
              
              {/* FIXED: Show forwarded information - check both possible locations */}
              {(claim.forwardedAt || claim.hrForwardingDetails?.forwardedAt) && (
                <div className="flex justify-between items-center mt-2 text-sm">
                  <span className="text-blue-700 dark:text-blue-300">
                    Forwarded to Insurer:
                  </span>
                  <span className="text-blue-700 dark:text-blue-300">
                    {formatDate(claim.forwardedAt || claim.hrForwardingDetails?.forwardedAt)}
                  </span>
                </div>
              )}

              {/* Coverage breakdown vs original amount comparison */}
              {calculateTotal() !== (claim.claimAmount?.requested || 0) && (
                <div className="mt-2 p-2 bg-amber-100 dark:bg-amber-900/30 border border-amber-300 dark:border-amber-600 rounded text-sm text-amber-800 dark:text-amber-200">
                  <div className="flex items-center space-x-1">
                    <AlertCircle className="h-4 w-4" />
                    <span>
                      {calculateTotal() > (claim.claimAmount?.requested || 0) 
                        ? 'Coverage breakdown exceeds original claim amount'
                        : 'Coverage breakdown is less than original claim amount'
                      }
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Eye },
    { id: 'questionnaire', label: 'Questionnaire', icon: FileText },
    { id: 'documents', label: 'Documents', icon: Download },
    { id: 'history', label: 'Activity', icon: History }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-5xl w-full max-h-[95vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Claim Details - {claim.claimId}
            </h2>
            <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(claim.claimStatus)}`}>
              {getStatusText(claim.claimStatus)}
            </span>
            {/* Show if claim has coverage breakdown */}
            {hasCoverageBreakdown && (
              <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200 dark:bg-green-900/20 dark:text-green-200 dark:border-green-800">
                Coverage Detailed
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setSelectedTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                    selectedTab === tab.id
                      ? 'border-green-500 text-green-600 dark:text-green-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                  {/* Show coverage indicator on overview tab */}
                  {tab.id === 'overview' && hasCoverageBreakdown && (
                    <span className="inline-flex items-center justify-center w-2 h-2 bg-green-500 rounded-full"></span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Overview Tab */}
          {selectedTab === 'overview' && (
            <div className="space-y-6">
              {/* Basic Claim Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
                    Claim Information
                  </h3>
                  
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <FileText className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Claim ID</p>
                        <p className="font-medium text-gray-900 dark:text-white">{claim.claimId}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <Shield className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Claim Type</p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {claim.claimType === 'life' ? 'Life Insurance' : 'Vehicle Insurance'}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Option: {claim.claimType === 'life' ? claim.lifeClaimOption : claim.vehicleClaimOption}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <DollarSign className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Requested Amount</p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {formatCurrency(claim.claimAmount?.requested)}
                        </p>
                        {claim.claimAmount?.approved > 0 && (
                          <p className="text-sm text-green-600 dark:text-green-400">
                            Approved: {formatCurrency(claim.claimAmount?.approved)}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <Calendar className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Submitted Date</p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {formatDate(claim.submittedAt)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <Clock className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Days in System</p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {calculateDaysInSystem(claim.submittedAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
                    Employee Information
                  </h3>
                  
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <User className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Employee Name</p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {claim.employeeId?.firstName} {claim.employeeId?.lastName}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <div className="h-5 w-5" />
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Email</p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {claim.employeeId?.email}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <div className="h-5 w-5" />
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Employee ID</p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {claim.employeeId?.employeeId || 'Not specified'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <div className="h-5 w-5" />
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Department</p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {claim.employeeId?.department || 'Not specified'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Coverage Breakdown Section */}
              {renderCoverageBreakdown()}

              {/* Policy Information */}
              {claim.policy && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
                    Policy Information
                  </h3>
                  
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Policy Number</p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {claim.policy.policyNumber}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Policy Type</p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {claim.policy.policyType}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Provider</p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {claim.policy.provider}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* FIXED: Rejection Reason Section - Now prominently displayed in Overview */}
              {claim.claimStatus === 'rejected' && claim.rejectionReason && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
                    Rejection Details
                  </h3>
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <XCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5" />
                      <div className="flex-1">
                        <p className="font-medium text-red-800 dark:text-red-200 mb-2">
                          Claim Rejected by Insurer
                        </p>
                        <p className="text-red-700 dark:text-red-300">
                          <strong>Reason:</strong> {claim.rejectionReason}
                        </p>
                        {claim.updatedAt && (
                          <p className="text-red-600 dark:text-red-400 text-sm mt-2">
                            Rejected on: {formatDate(claim.updatedAt)}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Return Reason (if applicable) */}
              {claim.returnReason && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
                    Return Reason
                  </h3>
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                      <p className="text-yellow-800 dark:text-yellow-200">
                        {claim.returnReason}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* FIXED: HR Notes - check both possible locations */}
              {(claim.hrNotes || claim.hrForwardingDetails?.hrNotes) && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
                    HR Notes
                  </h3>
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <MessageSquare className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                      <p className="text-blue-800 dark:text-blue-200">
                        {claim.hrNotes || claim.hrForwardingDetails?.hrNotes}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Processing Summary for forwarded claims */}
              {claim.claimStatus === 'insurer' && hasCoverageBreakdown && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
                    Processing Summary
                  </h3>
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <div className="flex items-center space-x-2 mb-2">
                          <Package className="h-4 w-4 text-blue-600" />
                          <span className="text-sm font-medium text-blue-800 dark:text-blue-200">Coverage Items</span>
                        </div>
                        <p className="text-blue-700 dark:text-blue-300">
                          {(claim.coverageBreakdown || claim.hrForwardingDetails?.coverageBreakdown || []).length} coverage type(s) submitted
                        </p>
                      </div>
                      <div>
                        <div className="flex items-center space-x-2 mb-2">
                          <Calendar className="h-4 w-4 text-blue-600" />
                          <span className="text-sm font-medium text-blue-800 dark:text-blue-200">Forwarded Date</span>
                        </div>
                        <p className="text-blue-700 dark:text-blue-300">
                          {formatDate(claim.forwardedAt || claim.hrForwardingDetails?.forwardedAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Questionnaire Tab */}
          {selectedTab === 'questionnaire' && (
            <div className="space-y-6">
              {/* FIXED: Check for questionnaire data in multiple possible locations */}
              {(claim.questionnaire?.sections?.some(s => s.responses?.some(r => r.isAnswered)) || 
                claim.questionnaire?.responses?.some(r => r.isAnswered)) ? (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Employee Questionnaire Responses
                    </h3>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {(() => {
                        const sections = groupQuestionnaireBySection();
                        const totalAnswered = sections.reduce((sum, section) => 
                          sum + section.questions.length, 0
                        );
                        const totalQuestions = claim.questionnaire?.sections
                          ? claim.questionnaire.sections.reduce((sum, s) => sum + (s.responses?.length || 0), 0)
                          : claim.questionnaire?.responses?.length || 0;
                        return `${totalAnswered} of ${totalQuestions} questions answered`;
                      })()}
                    </div>
                  </div>

                  {showDetailedQuestionnaire ? (
                    <div className="space-y-6">
                      {groupQuestionnaireBySection().map((section, sectionIndex) => (
                        <div key={sectionIndex} className="border border-gray-200 dark:border-gray-700 rounded-lg">
                          <button
                            onClick={() => toggleSection(sectionIndex)}
                            className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors rounded-t-lg"
                          >
                            <h4 className="text-lg font-semibold text-gray-900 dark:text-white text-left">
                              {section.title}
                            </h4>
                            <div className="flex items-center space-x-2">
                              <span className="text-sm text-gray-600 dark:text-gray-400">
                                {section.questions.length} questions
                              </span>
                              {expandedSections[sectionIndex] ? 
                                <ChevronUp className="h-5 w-5 text-gray-400" /> : 
                                <ChevronDown className="h-5 w-5 text-gray-400" />
                              }
                            </div>
                          </button>
                          
                          {expandedSections[sectionIndex] && (
                            <div className="p-4 space-y-4">
                              {section.questions.map((response, responseIndex) => (
                                <div key={responseIndex} className="border-l-4 border-green-500 pl-4 py-2">
                                  <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                      <p className="font-medium text-gray-900 dark:text-white mb-2">
                                        {response.questionText}
                                      </p>
                                      <div className="text-gray-600 dark:text-gray-300">
                                        {renderQuestionnaireResponse(response)}
                                      </div>
                                      {response.questionType && (
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                          Type: {response.questionType}
                                        </p>
                                      )}
                                    </div>
                                    <div className="ml-4 text-right">
                                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                        response.isAnswered 
                                          ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200' 
                                          : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-200'
                                      }`}>
                                        {response.isAnswered ? 'Answered' : 'Skipped'}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-4 max-h-60 overflow-y-auto">
                      {groupQuestionnaireBySection()
                        .flatMap(section => section.questions)
                        .map((response, index) => (
                          <div key={index} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                            <p className="font-medium text-gray-900 dark:text-white mb-2">
                              {response.questionText}
                            </p>
                            <div className="text-gray-600 dark:text-gray-300">
                              {renderQuestionnaireResponse(response)}
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No Questionnaire Data
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    No questionnaire responses are available for this claim.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Documents Tab */}
          {selectedTab === 'documents' && (
            <div className="space-y-6">
              {claim.documents && claim.documents.length > 0 ? (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                    Supporting Documents ({claim.documents.length})
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {claim.documents.map((doc, index) => {
                      const documentId = doc._id || doc.id;
                      const isDownloading = downloadingDocs.has(documentId);
                      
                      return (
                        <div key={index} className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                          <div className="flex items-center space-x-3">
                            <FileText className="h-6 w-6 text-blue-600" />
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">
                                {doc.originalName || doc.filename || 'Unknown file'}
                              </p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                Uploaded: {formatDate(doc.uploadedAt || doc.createdAt)}
                              </p>
                              {doc.size && (
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  Size: {(doc.size / 1024 / 1024).toFixed(2)} MB
                                </p>
                              )}
                              {doc.docType && (
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  Type: {doc.docType}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button 
                              onClick={() => handleViewDocument(doc)}
                              className="text-green-600 hover:text-green-700 dark:text-green-400 p-2 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-md transition-colors"
                              title="View document"
                              disabled={isDownloading || !documentId}
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button 
                              onClick={() => handleDownloadDocument(doc)}
                              className="text-blue-600 hover:text-blue-700 dark:text-blue-400 p-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              title={isDownloading ? "Downloading..." : "Download document"}
                              disabled={isDownloading || !documentId}
                            >
                              {isDownloading ? (
                                <div className="h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                              ) : (
                                <Download className="h-4 w-4" />
                              )}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  
                  {/* Show warning if some documents don't have IDs */}
                  {claim.documents.some(doc => !doc._id && !doc.id) && (
                    <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                      <div className="flex items-start space-x-3">
                        <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5" />
                        <div>
                          <p className="text-amber-800 dark:text-amber-200 font-medium">Note</p>
                          <p className="text-amber-700 dark:text-amber-300 text-sm">
                            Some documents may not be downloadable due to missing document IDs. 
                            Contact system administrator if you need access to these documents.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Download className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No Documents
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    No supporting documents have been uploaded for this claim.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Activity/History Tab */}
          {selectedTab === 'history' && (
            <div className="space-y-6">
              {/* Coverage Breakdown History - Show if exists */}
              {hasCoverageBreakdown && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
                    HR Coverage Breakdown History
                  </h3>
                  
                  <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-4">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span className="font-medium text-green-800 dark:text-green-200">
                        Coverage Details Submitted to Insurer
                      </span>
                      {(claim.forwardedAt || claim.hrForwardingDetails?.forwardedAt) && (
                        <span className="text-sm text-green-600 dark:text-green-300 ml-auto">
                          {formatDate(claim.forwardedAt || claim.hrForwardingDetails?.forwardedAt)}
                        </span>
                      )}
                    </div>

                    {/* Display each coverage item */}
                    <div className="space-y-3">
                      {(claim.coverageBreakdown || claim.hrForwardingDetails?.coverageBreakdown || []).map((coverage, index) => (
                        <div key={index} className="bg-white dark:bg-gray-800 border border-green-200 dark:border-green-700 rounded-lg p-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                            <div>
                              <div className="flex items-center space-x-2 mb-1">
                                <Shield className="h-4 w-4 text-green-600" />
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Coverage Type</span>
                              </div>
                              <p className="font-semibold text-gray-900 dark:text-white">
                                {coverage.coverageType}
                              </p>
                            </div>
                            
                            <div>
                              <div className="flex items-center space-x-2 mb-1">
                                <Coins className="h-4 w-4 text-green-600" />
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Requested Amount</span>
                              </div>
                              <p className="font-semibold text-gray-900 dark:text-white">
                                {formatCurrency(coverage.requestedAmount)}
                              </p>
                            </div>
                          </div>
                          
                          {coverage.notes && (
                            <div>
                              <div className="flex items-center space-x-2 mb-2">
                                <MessageSquare className="h-4 w-4 text-green-600" />
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Coverage Notes</span>
                              </div>
                              <p className="text-gray-600 dark:text-gray-300 text-sm bg-gray-50 dark:bg-gray-700 p-3 rounded-md">
                                {coverage.notes}
                              </p>
                            </div>
                          )}
                        </div>
                      ))}
                      
                      {/* Total Summary */}
                      <div className="bg-gradient-to-r from-green-100 to-green-50 dark:from-green-900/30 dark:to-green-900/20 border border-green-300 dark:border-green-600 rounded-lg p-4">
                        <div className="flex justify-between items-center">
                          <span className="font-semibold text-green-900 dark:text-green-200">
                            Total Coverage Amount:
                          </span>
                          <span className="text-xl font-bold text-green-900 dark:text-green-200">
                            {formatCurrency((claim.coverageBreakdown || claim.hrForwardingDetails?.coverageBreakdown || []).reduce((sum, item) => sum + (item.requestedAmount || 0), 0))}
                          </span>
                        </div>
                        <div className="flex justify-between items-center mt-2 text-sm">
                          <span className="text-green-700 dark:text-green-300">
                            Coverage Items: {(claim.coverageBreakdown || claim.hrForwardingDetails?.coverageBreakdown || []).length}
                          </span>
                          <span className="text-green-700 dark:text-green-300">
                            Status: Submitted to Insurer
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* HR Notes History - Show if exists */}
              {(claim.hrNotes || claim.hrForwardingDetails?.hrNotes) && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
                    HR Notes History
                  </h3>
                  
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-3">
                      <MessageSquare className="h-5 w-5 text-blue-600" />
                      <span className="font-medium text-blue-800 dark:text-blue-200">
                        HR Notes Submitted with Claim
                      </span>
                      {(claim.forwardedAt || claim.hrForwardingDetails?.forwardedAt) && (
                        <span className="text-sm text-blue-600 dark:text-blue-300 ml-auto">
                          {formatDate(claim.forwardedAt || claim.hrForwardingDetails?.forwardedAt)}
                        </span>
                      )}
                    </div>
                    
                    <div className="bg-white dark:bg-gray-800 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
                      <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                        {claim.hrNotes || claim.hrForwardingDetails?.hrNotes}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Processing Timeline */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
                  Processing Timeline
                </h3>
                
                <div className="space-y-3">
                  {/* Submitted */}
                  <div className="flex items-start space-x-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <Send className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-medium text-blue-800 dark:text-blue-200">Claim Submitted</p>
                      <p className="text-sm text-blue-600 dark:text-blue-300">
                        {formatDate(claim.submittedAt)}
                      </p>
                      <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                        Original amount: {formatCurrency(claim.claimAmount?.requested || 0)}
                      </p>
                    </div>
                  </div>

                  {/* HR Review */}
                  {(claim.claimStatus !== 'draft' && claim.claimStatus !== 'employee') && (
                    <div className="flex items-start space-x-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                      <Eye className="h-5 w-5 text-yellow-600 mt-0.5" />
                      <div className="flex-1">
                        <p className="font-medium text-yellow-800 dark:text-yellow-200">HR Review Stage</p>
                        <p className="text-sm text-yellow-600 dark:text-yellow-300">
                          Claim reviewed by HR team
                        </p>
                        {hasCoverageBreakdown && (
                          <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                            Coverage breakdown prepared with {(claim.coverageBreakdown || claim.hrForwardingDetails?.coverageBreakdown || []).length} items
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Forwarded to Insurer */}
                  {(claim.claimStatus === 'insurer' || claim.claimStatus === 'approved' || claim.claimStatus === 'rejected') && (
                    <div className="flex items-start space-x-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <ArrowRight className="h-5 w-5 text-green-600 mt-0.5" />
                      <div className="flex-1">
                        <p className="font-medium text-green-800 dark:text-green-200">Forwarded to Insurer</p>
                        <p className="text-sm text-green-600 dark:text-green-300">
                          {formatDate(claim.forwardedAt || claim.hrForwardingDetails?.forwardedAt || claim.updatedAt)}
                        </p>
                        {hasCoverageBreakdown && (
                          <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                            Detailed coverage breakdown submitted: {formatCurrency((claim.coverageBreakdown || claim.hrForwardingDetails?.coverageBreakdown || []).reduce((sum, item) => sum + (item.requestedAmount || 0), 0))}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Returned to Employee */}
                  {claim.claimStatus === 'employee' && (
                    <div className="flex items-start space-x-3 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                      <ArrowLeft className="h-5 w-5 text-orange-600 mt-0.5" />
                      <div className="flex-1">
                        <p className="font-medium text-orange-800 dark:text-orange-200">Returned to Employee</p>
                        <p className="text-sm text-orange-600 dark:text-orange-300">
                          {formatDate(claim.updatedAt)}
                        </p>
                        {claim.returnReason && (
                          <p className="text-sm text-orange-700 dark:text-orange-300 mt-1">
                            Reason: {claim.returnReason}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Final Decision */}
                  {claim.claimStatus === 'approved' && (
                    <div className="flex items-start space-x-3 p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                      <CheckCircle className="h-5 w-5 text-emerald-600 mt-0.5" />
                      <div className="flex-1">
                        <p className="font-medium text-emerald-800 dark:text-emerald-200">Claim Approved</p>
                        <p className="text-sm text-emerald-600 dark:text-emerald-300">
                          {formatDate(claim.updatedAt)}
                        </p>
                        {claim.claimAmount?.approved && (
                          <p className="text-sm text-emerald-700 dark:text-emerald-300 mt-1">
                            Approved amount: {formatCurrency(claim.claimAmount.approved)}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* FIXED: Enhanced Rejection Timeline Entry with Reason */}
                  {claim.claimStatus === 'rejected' && (
                    <div className="flex items-start space-x-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                      <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
                      <div className="flex-1">
                        <p className="font-medium text-red-800 dark:text-red-200">Claim Rejected</p>
                        <p className="text-sm text-red-600 dark:text-red-300">
                          {formatDate(claim.updatedAt)}
                        </p>
                        {claim.rejectionReason && (
                          <div className="mt-2 p-3 bg-red-100 dark:bg-red-900/40 border border-red-200 dark:border-red-700 rounded-md">
                            <p className="text-sm text-red-700 dark:text-red-300 font-medium mb-1">
                              Rejection Reason:
                            </p>
                            <p className="text-sm text-red-600 dark:text-red-400">
                              {claim.rejectionReason}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Summary Information */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Summary</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">Days in system:</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {calculateDaysInSystem(claim.submittedAt)}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">Current status:</p>
                    <p className="font-medium text-gray-900 dark:text-white capitalize">
                      {getStatusText(claim.claimStatus)}
                    </p>
                  </div>
                  {hasCoverageBreakdown && (
                    <>
                      <div>
                        <p className="text-gray-600 dark:text-gray-400">Coverage items:</p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {(claim.coverageBreakdown || claim.hrForwardingDetails?.coverageBreakdown || []).length} types detailed
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600 dark:text-gray-400">HR processing:</p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          Complete with breakdown
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons - Only show HR actions for claims with 'hr' status */}
        {canTakeHRAction && (
          <div className="flex items-center justify-end space-x-4 p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
            <button
              onClick={onReturn}
              className="flex items-center space-x-2 px-4 py-2 border border-orange-300 text-orange-700 rounded-md hover:bg-orange-50 dark:border-orange-600 dark:text-orange-400 dark:hover:bg-orange-900/20"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Return to Employee</span>
            </button>
            
            <button
              onClick={onForward}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600"
            >
              <ArrowRight className="h-4 w-4" />
              <span>Forward to Insurer</span>
            </button>
          </div>
        )}
        
        {/* Status information for non-actionable claims */}
        {!canTakeHRAction && (
          <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
            <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
              <Info className="h-4 w-4" />
              <span>
                {claim.claimStatus === 'insurer' && 'This claim is currently being processed by the insurer. No HR action required.'}
                {claim.claimStatus === 'approved' && 'This claim has been approved by the insurer.'}
                {claim.claimStatus === 'rejected' && 'This claim has been rejected by the insurer.'}
                {claim.claimStatus === 'employee' && 'This claim has been returned to the employee for updates.'}
                {claim.claimStatus === 'draft' && 'This claim is still in draft status with the employee.'}
              </span>
              {/* Show coverage breakdown indicator */}
              {hasCoverageBreakdown && (
                <span className="ml-2 px-2 py-1 rounded text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-200">
                  Coverage Details Available
                </span>
              )}
              {/* Show rejection reason indicator */}
              {claim.claimStatus === 'rejected' && claim.rejectionReason && (
                <span className="ml-2 px-2 py-1 rounded text-xs bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-200">
                  Rejection Reason Available
                </span>
              )}
            </div>
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
};