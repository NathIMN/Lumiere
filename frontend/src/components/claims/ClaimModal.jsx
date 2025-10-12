/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import documentApiService from "../../services/document-api";
import {
  X, User, FileText, Coins, Calendar, Shield, ArrowRight, ArrowLeft,
  CheckCircle, XCircle, Clock, Download, ChevronDown, ChevronUp, MessageSquare,
  AlertCircle, Info, Eye, History, Package, Send,
} from "lucide-react";

export const ClaimModal = ({
  claim, onClose, onForward, onReturn, showDetailedQuestionnaire = true,
}) => {
  const [expandedSections, setExpandedSections] = useState({});
  const [selectedTab, setSelectedTab] = useState("overview");
  const [downloadingDocs, setDownloadingDocs] = useState(new Set());
console.log("here : ",claim)
  if (!claim) return null;

  const formatDate = (dateString) => {
    if (!dateString) return "Not set";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric", month: "long", day: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  };

  const formatCurrency = (amount) => {
    if (!amount) return "Rs. 0";
    return `Rs. ${amount.toLocaleString("en-LK")}`;
  };

  const calculateDaysInSystem = (submittedDate) => {
    if (!submittedDate) return "Unknown";
    const diffDays = Math.floor((new Date() - new Date(submittedDate)) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays === 2) return "2 days ago";
    return `${diffDays} days ago`;
  };

  const getStatusColor = (status) => {
    const colorMap = {
      hr: "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-200 dark:border-yellow-800",
      insurer: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-200 dark:border-blue-800",
      approved: "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-200 dark:border-green-800",
      rejected: "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-200 dark:border-red-800",
      employee: "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/20 dark:text-orange-200 dark:border-orange-800",
    };
    return colorMap[status] || "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/20 dark:text-gray-200 dark:border-gray-800";
  };

  const getStatusText = (status) => {
    const statusMap = {
      hr: "Pending HR Review", insurer: "With Insurer", approved: "Approved",
      rejected: "Rejected", employee: "With Employee",
    };
    return statusMap[status] || status;
  };

  const toggleSection = (sectionIndex) => {
    setExpandedSections((prev) => ({ ...prev, [sectionIndex]: !prev[sectionIndex] }));
  };

  const canTakeHRAction = claim.claimStatus === "hr";
  const hasCoverageBreakdown = (claim.coverageBreakdown?.length > 0) || 
    (claim.hrForwardingDetails?.coverageBreakdown?.length > 0);

  const handleViewDocument = async (doc) => {
    try {
      const documentId = doc._id || doc.id || 
        (typeof doc.fileValue === "string" ? doc.fileValue : doc.fileValue?._id || doc.fileValue?.id) ||
        (typeof doc === "string" ? doc : null);

      if (!documentId) {
        alert("Document ID is not available. Cannot view document.");
        return;
      }

      const downloadLink = await documentApiService.createDownloadLink(documentId);
      window.open(downloadLink, "_blank");
      setTimeout(() => window.URL.revokeObjectURL(downloadLink), 1000);
    } catch (error) {
      console.error("Error viewing document:", error);
      alert(`Failed to view document: ${error.message}`);
    }
  };

  const handleDownloadDocument = async (doc) => {
    try {
      const documentId = doc._id || doc.id || 
        (typeof doc.fileValue === "string" ? doc.fileValue : doc.fileValue?._id || doc.fileValue?.id) ||
        (typeof doc === "string" ? doc : null);

      if (!documentId) {
        alert("Document ID is not available. Cannot download document.");
        return;
      }

      setDownloadingDocs((prev) => new Set(prev).add(documentId));
      await documentApiService.triggerDownload(documentId);
    } catch (error) {
      console.error("Error downloading document:", error);
      alert(`Failed to download document: ${error.message}`);
    } finally {
      setDownloadingDocs((prev) => {
        const newSet = new Set(prev);
        newSet.delete(doc._id || doc.id || 
          (typeof doc.fileValue === "string" ? doc.fileValue : doc.fileValue?._id || doc.fileValue?.id));
        return newSet;
      });
    }
  };

  const renderQuestionnaireResponse = (response) => {
    const { answer } = response;
    if (!response.isAnswered) return <span className="text-gray-400 italic">Not answered</span>;

    if (answer.fileValue) {
      const documentId = typeof answer.fileValue === "string" ? answer.fileValue : 
        answer.fileValue._id || answer.fileValue.id;
      
      if (!documentId) return <div className="text-red-600">Error: Document ID not found</div>;
      
      const isDownloading = downloadingDocs.has(documentId);

      return (
        <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
          <div className="flex items-center space-x-2">
            <FileText className="h-5 w-5 text-blue-600" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {typeof answer.fileValue === "object" ? answer.fileValue.originalName || "Uploaded file" : "Document"}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <button onClick={() => handleViewDocument({ _id: documentId })} disabled={isDownloading}
              className="text-green-600 hover:text-green-700 dark:text-green-400 p-2 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-md transition-colors"
              title="View document">
              <Eye className="h-4 w-4" />
            </button>
            <button onClick={() => handleDownloadDocument({ _id: documentId })} disabled={isDownloading}
              className="text-blue-600 hover:text-blue-700 dark:text-blue-400 p-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md transition-colors disabled:opacity-50"
              title={isDownloading ? "Downloading..." : "Download document"}>
              {isDownloading ? <div className="h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" /> : <Download className="h-4 w-4" />}
            </button>
          </div>
        </div>
      );
    }

    if (answer.textValue) return answer.textValue;
    if (answer.numberValue != null) return answer.numberValue.toString();
    if (answer.booleanValue != null) return answer.booleanValue ? "Yes" : "No";
    if (answer.selectValue) return answer.selectValue;
    if (answer.multiselectValue?.length) return answer.multiselectValue.join(", ");
    if (answer.dateValue) return formatDate(answer.dateValue);
    return <span className="text-gray-400 italic">No response</span>;
  };

  const groupQuestionnaireBySection = () => {
    let responses = [];
    if (claim.questionnaire?.sections) {
      responses = claim.questionnaire.sections.sort((a, b) => (a.order || 0) - (b.order || 0))
        .flatMap((s) => (s.responses || []).filter(r => r.isAnswered).map(r => ({ ...r, section: s.title })));
    } else if (claim.questionnaire?.responses) {
      responses = claim.questionnaire.responses.filter(r => r.isAnswered);
    }
    if (!responses.length) return [];
    
    if (responses[0]?.section) {
      const sections = {};
      responses.forEach(r => {
        const title = r.section || "General Questions";
        if (!sections[title]) sections[title] = [];
        sections[title].push(r);
      });
      return Object.entries(sections).map(([title, questions]) => ({ title, questions }));
    }
    return [{ title: "Questionnaire Responses", questions: responses }];
  };

  const renderCoverageBreakdown = () => {
    const data = claim.coverageBreakdown || claim.hrForwardingDetails?.coverageBreakdown;
    if (!data?.length) return null;
    const total = data.reduce((sum, item) => sum + (item.requestedAmount || 0), 0);

    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2 flex items-center space-x-2">
          <Package className="h-5 w-5 text-blue-600" />
          <span>Coverage Breakdown</span>
          <span className="text-sm font-normal text-gray-500 dark:text-gray-400">(Submitted by HR)</span>
        </h3>
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 space-y-4">
          {data.map((cov, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <Shield className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Coverage Type</span>
                  </div>
                  <p className="font-semibold text-gray-900 dark:text-white">{cov.coverageType}</p>
                </div>
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <Coins className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Requested Amount</span>
                  </div>
                  <p className="font-semibold text-gray-900 dark:text-white">{formatCurrency(cov.requestedAmount)}</p>
                </div>
              </div>
              {cov.notes && (
                <div className="mt-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <MessageSquare className="h-4 w-4 text-gray-600" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Coverage Notes</span>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 text-sm bg-gray-50 dark:bg-gray-700 p-3 rounded-md">{cov.notes}</p>
                </div>
              )}
              {cov.createdAt && (
                <div className="mt-3 pt-2 border-t border-gray-200 dark:border-gray-600">
                  <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                    <Calendar className="h-3 w-3" />
                    <span>Added on: {formatDate(cov.createdAt)}</span>
                  </div>
                </div>
              )}
            </div>
          ))}
          <div className="bg-gradient-to-r from-blue-100 to-blue-50 dark:from-blue-900/30 dark:to-blue-900/20 border border-blue-300 dark:border-blue-600 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-blue-900 dark:text-blue-200">Total Coverage Amount:</span>
              <span className="text-xl font-bold text-blue-900 dark:text-blue-200">{formatCurrency(total)}</span>
            </div>
            <div className="flex justify-between items-center mt-2 text-sm">
              <span className="text-blue-700 dark:text-blue-300">Original Claim Amount:</span>
              <span className="text-blue-700 dark:text-blue-300">{formatCurrency(claim.claimAmount?.requested || 0)}</span>
            </div>
            {(claim.forwardedAt || claim.hrForwardingDetails?.forwardedAt) && (
              <div className="flex justify-between items-center mt-2 text-sm">
                <span className="text-blue-700 dark:text-blue-300">Forwarded to Insurer:</span>
                <span className="text-blue-700 dark:text-blue-300">{formatDate(claim.forwardedAt || claim.hrForwardingDetails?.forwardedAt)}</span>
              </div>
            )}
            {total !== (claim.claimAmount?.requested || 0) && (
              <div className="mt-2 p-2 bg-amber-100 dark:bg-amber-900/30 border border-amber-300 dark:border-amber-600 rounded text-sm text-amber-800 dark:text-amber-200">
                <div className="flex items-center space-x-1">
                  <AlertCircle className="h-4 w-4" />
                  <span>{total > (claim.claimAmount?.requested || 0) ? "Coverage breakdown exceeds original claim amount" : "Coverage breakdown is less than original claim amount"}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const tabs = [
    { id: "overview", label: "Overview", icon: Eye },
    { id: "questionnaire", label: "Questionnaire", icon: FileText },
    { id: "history", label: "Activity", icon: History },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-5xl w-full max-h-[95vh] overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Claim Details - {claim.claimId}</h2>
            <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(claim.claimStatus)}`}>
              {getStatusText(claim.claimStatus)}
            </span>
            {hasCoverageBreakdown && (
              <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200 dark:bg-green-900/20 dark:text-green-200 dark:border-green-800">
                Coverage Detailed
              </span>
            )}
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button key={tab.id} onClick={() => setSelectedTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                    selectedTab === tab.id ? "border-green-500 text-green-600 dark:text-green-400" : 
                    "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
                  }`}>
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                  {tab.id === "overview" && hasCoverageBreakdown && (
                    <span className="inline-flex items-center justify-center w-2 h-2 bg-green-500 rounded-full"></span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {selectedTab === "overview" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Claim Info */}
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
                          {claim.claimType === "life" ? "Life Insurance" : "Vehicle Insurance"}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Option: {claim.claimType === "life" ? claim.lifeClaimOption : claim.vehicleClaimOption}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Coins className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Requested Amount</p>
                        <p className="font-medium text-gray-900 dark:text-white">{formatCurrency(claim.claimAmount?.requested)}</p>
                        {claim.claimAmount?.approved > 0 && (
                          <p className="text-sm text-green-600 dark:text-green-400">Approved: {formatCurrency(claim.claimAmount?.approved)}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Calendar className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Submitted Date</p>
                        <p className="font-medium text-gray-900 dark:text-white">{formatDate(claim.submittedAt)}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Clock className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Days in System</p>
                        <p className="font-medium text-gray-900 dark:text-white">{calculateDaysInSystem(claim.submittedAt)}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Employee Info */}
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
                          {claim.employeeId?.fullName}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="h-5 w-5" />
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Email</p>
                        <p className="font-medium text-gray-900 dark:text-white">{claim.employeeId?.email || "Not available"}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="h-5 w-5" />
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Employee ID</p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {claim.employeeId?.userId || "Not specified"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="h-5 w-5" />
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Department</p>
                        <p className="font-medium text-gray-900 dark:text-white">{claim.employeeId?.employment.department || "Not available"}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {renderCoverageBreakdown()}

              {/* Policy Info */}
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
                          {claim.policy?.policyNumber || claim.policy?.policyId || "Not available"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Policy Type</p>
                        <p className="font-medium text-gray-900 dark:text-white capitalize">
                          {claim.policy?.policyType ? 
                            (claim.policy.policyType === 'life' ? 'Life Insurance' : 'Vehicle Insurance') : "Not available"}
                        </p>
                      </div>
                      
                    </div>
                  </div>
                </div>
              )}

              {/* Rejection */}
              {claim.claimStatus === "rejected" && claim.decision?.rejectionReason && (
                <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-lg p-6">
                  <div className="flex items-start space-x-4">
                    <XCircle className="h-8 w-8 text-red-600 dark:text-red-400 flex-shrink-0" />
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-2">Claim Rejected by Insurer</h3>
                      <p className="text-red-600 dark:text-red-400 bg-red-100/50 dark:bg-red-900/40 p-3 rounded-md">
                        {claim.decision.rejectionReason}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Return Reason */}
              {claim.returnReason && (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="font-semibold text-yellow-800 dark:text-yellow-200 mb-1">Return Reason</p>
                      <p className="text-yellow-700 dark:text-yellow-300">{claim.returnReason}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* HR Notes */}
              {(claim.hrNotes || claim.hrForwardingDetails?.hrNotes) && (
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <MessageSquare className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="font-semibold text-blue-800 dark:text-blue-200 mb-1">HR Notes</p>
                      <p className="text-blue-700 dark:text-blue-300">{claim.hrNotes || claim.hrForwardingDetails?.hrNotes}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Questionnaire Tab */}
          {selectedTab === "questionnaire" && (
            <div className="space-y-6">
              {groupQuestionnaireBySection().length > 0 ? (
                groupQuestionnaireBySection().map((section, idx) => (
                  <div key={idx} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                    <button onClick={() => toggleSection(idx)}
                      className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white">{section.title}</h4>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600 dark:text-gray-400">{section.questions.length} questions</span>
                        {expandedSections[idx] ? <ChevronUp className="h-5 w-5 text-gray-600" /> : <ChevronDown className="h-5 w-5 text-gray-600" />}
                      </div>
                    </button>
                    {expandedSections[idx] && (
                      <div className="p-4 space-y-4 bg-white dark:bg-gray-800">
                        {section.questions.map((q, i) => (
                          <div key={i} className="border-l-4 border-green-500 pl-4 py-2 bg-gray-50 dark:bg-gray-700 rounded-r">
                            <p className="font-medium text-gray-900 dark:text-white mb-2">{q.questionText}</p>
                            <div className="text-gray-600 dark:text-gray-300">{renderQuestionnaireResponse(q)}</div>
                            {q.questionType && (
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Type: {q.questionType}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Questionnaire Data</h3>
                  <p className="text-gray-600 dark:text-gray-400">No questionnaire responses are available for this claim.</p>
                </div>
              )}
            </div>
          )}

          {/* History Tab */}
          {selectedTab === "history" && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
                Processing Timeline
              </h3>
              <div className="space-y-3">
                {/* Submitted */}
                <div className="flex items-start space-x-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <Send className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="font-medium text-blue-800 dark:text-blue-200">Claim Submitted</p>
                    <p className="text-sm text-blue-600 dark:text-blue-300">{formatDate(claim.submittedAt)}</p>
                    <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                      Amount: {formatCurrency(claim.claimAmount?.requested || 0)}
                    </p>
                  </div>
                </div>

                {/* HR Review */}
                {claim.claimStatus !== "draft" && claim.claimStatus !== "employee" && (
                  <div className="flex items-start space-x-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                    <Eye className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="font-medium text-yellow-800 dark:text-yellow-200">HR Review Stage</p>
                      <p className="text-sm text-yellow-600 dark:text-yellow-300">Claim reviewed by HR team</p>
                      {hasCoverageBreakdown && (
                        <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                          Coverage breakdown prepared with {(claim.coverageBreakdown || claim.hrForwardingDetails?.coverageBreakdown || []).length} items
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Forwarded to Insurer */}
                {(claim.claimStatus === "insurer" || claim.claimStatus === "approved" || claim.claimStatus === "rejected") && (
                  <div className="flex items-start space-x-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                    <ArrowRight className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="font-medium text-green-800 dark:text-green-200">Forwarded to Insurer</p>
                      <p className="text-sm text-green-600 dark:text-green-300">
                        {formatDate(claim.forwardedToInsurerAt || claim.hrForwardingDetails?.forwardedAt || claim.updatedAt)}
                      </p>
                      {hasCoverageBreakdown && (
                        <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                          Detailed coverage breakdown submitted
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Returned to Employee */}
                {claim.claimStatus === "employee" && claim.returnReason && (
                  <div className="flex items-start space-x-3 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                    <ArrowLeft className="h-5 w-5 text-orange-600 dark:text-orange-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="font-medium text-orange-800 dark:text-orange-200">Returned to Employee</p>
                      <p className="text-sm text-orange-600 dark:text-orange-300">{formatDate(claim.updatedAt)}</p>
                      <p className="text-sm text-orange-700 dark:text-orange-300 mt-1">Reason: {claim.returnReason}</p>
                    </div>
                  </div>
                )}

                {/* Approved */}
                {claim.claimStatus === "approved" && (
                  <div className="flex items-start space-x-3 p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-800">
                    <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="font-medium text-emerald-800 dark:text-emerald-200">Claim Approved</p>
                      <p className="text-sm text-emerald-600 dark:text-emerald-300">{formatDate(claim.finalizedAt || claim.updatedAt)}</p>
                      {claim.claimAmount?.approved && (
                        <p className="text-sm text-emerald-700 dark:text-emerald-300 mt-1">
                          Approved amount: {formatCurrency(claim.claimAmount.approved)}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Rejected */}
                {claim.claimStatus === "rejected" && (
                  <div className="flex items-start space-x-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border-2 border-red-200 dark:border-red-800">
                    <XCircle className="h-6 w-6 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="font-semibold text-red-800 dark:text-red-200">Claim Rejected by Insurer</p>
                      <p className="text-sm text-red-600 dark:text-red-300">{formatDate(claim.finalizedAt || claim.updatedAt)}</p>
                      {claim.decision?.rejectionReason && (
                        <div className="mt-2 bg-red-100/50 dark:bg-red-900/40 p-3 rounded-md">
                          <p className="text-sm text-red-700 dark:text-red-300">{claim.decision.rejectionReason}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Summary */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mt-6">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Summary</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">Days in system:</p>
                    <p className="font-medium text-gray-900 dark:text-white">{calculateDaysInSystem(claim.submittedAt)}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">Current status:</p>
                    <p className="font-medium text-gray-900 dark:text-white capitalize">{getStatusText(claim.claimStatus)}</p>
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
                        <p className="font-medium text-gray-900 dark:text-white">Complete with breakdown</p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end space-x-4 p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
          {canTakeHRAction ? (
            <>
              <button onClick={onReturn}
                className="flex items-center space-x-2 px-4 py-2 border border-orange-300 text-orange-700 rounded-md hover:bg-orange-50 dark:border-orange-600 dark:text-orange-400 dark:hover:bg-orange-900/20 transition-colors">
                <ArrowLeft className="h-4 w-4" />
                <span>Return to Employee</span>
              </button>
              <button onClick={onForward}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600 transition-colors shadow-sm hover:shadow-md">
                <ArrowRight className="h-4 w-4" />
                <span>Forward to Insurer</span>
              </button>
            </>
          ) : (
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                <Info className="h-4 w-4" />
                <span>
                  {claim.claimStatus === "insurer" && "This claim is currently being processed by the insurer."}
                  {claim.claimStatus === "approved" && "This claim has been approved by the insurer."}
                  {claim.claimStatus === "rejected" && "This claim has been rejected by the insurer."}
                  {claim.claimStatus === "employee" && "This claim has been returned to the employee for updates."}
                </span>
              </div>
              <button onClick={onClose} 
                className="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors">
                Close
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};