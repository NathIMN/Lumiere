/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useCallback } from 'react';
import { 
  X, 
  History, 
  User, 
  Clock, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle,
  XCircle,
  Send,
  FileText,
  MessageSquare,
  Calendar,
  Eye,
  Download,
  AlertTriangle,
  Package,
  Coins,
  Shield
} from 'lucide-react';
import insuranceApiService from '../../services/insurance-api';

export const ClaimHistory = ({ claim, onClose }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Use useCallback to memoize the function and fix useEffect dependency warning
  const fetchClaimHistory = useCallback(async () => {
    if (!claim?._id) return;
    
    try {
      setLoading(true);
      setError(null); // Reset error state
      
      // Try to get claim history - handle different possible API endpoints
      let response;
      try {
        // Try the standard getClaimHistory method first (if it exists)
        if (insuranceApiService.getClaimHistory) {
          response = await insuranceApiService.getClaimHistory(claim._id);
        } else {
          throw new Error('getClaimHistory method not available');
        }
      } catch (err) {
        // If getClaimHistory doesn't exist, try alternative methods
        console.warn('getClaimHistory not available, trying alternative approach');
        
        // Try to get claim by ID which might include history
        try {
          const claimDetails = await insuranceApiService.getClaimById(claim._id);
          response = claimDetails?.history || claimDetails?.data?.history || [];
        } catch (err2) {
          console.warn('Could not fetch claim details either');
          response = [];
        }
      }
      
      console.log('Claim history response:', response);
      
      // Handle different response structures
      if (response?.data) {
        setHistory(Array.isArray(response.data) ? response.data : []);
      } else if (Array.isArray(response)) {
        setHistory(response);
      } else if (response?.history && Array.isArray(response.history)) {
        setHistory(response.history);
      } else {
        setHistory([]);
      }
    } catch (err) {
      console.error('Failed to fetch claim history:', err);
      setError('Failed to load claim history');
      setHistory([]);
    } finally {
      setLoading(false);
    }
  }, [claim?._id]);

  useEffect(() => {
    fetchClaimHistory();
  }, [fetchClaimHistory]);

  const getActionIcon = (action) => {
    switch (action) {
      case 'submitted':
      case 'claim_submitted':
        return <Send className="h-5 w-5 text-blue-600" />;
      case 'hr_review':
      case 'pending_hr_review':
        return <Eye className="h-5 w-5 text-yellow-600" />;
      case 'forwarded_to_insurer':
      case 'forward_to_insurer':
        return <ArrowRight className="h-5 w-5 text-green-600" />;
      case 'returned_to_employee':
      case 'return_to_employee':
        return <ArrowLeft className="h-5 w-5 text-orange-600" />;
      case 'approved':
      case 'claim_approved':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'rejected':
      case 'claim_rejected':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'updated':
      case 'claim_updated':
        return <FileText className="h-5 w-5 text-purple-600" />;
      case 'comment_added':
      case 'note_added':
        return <MessageSquare className="h-5 w-5 text-blue-600" />;
      case 'document_uploaded':
        return <Download className="h-5 w-5 text-indigo-600" />;
      default:
        return <Clock className="h-5 w-5 text-gray-600" />;
    }
  };

  const getActionColor = (action) => {
    switch (action) {
      case 'submitted':
      case 'claim_submitted':
        return 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-200';
      case 'hr_review':
      case 'pending_hr_review':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-200';
      case 'forwarded_to_insurer':
      case 'forward_to_insurer':
        return 'bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-200';
      case 'returned_to_employee':
      case 'return_to_employee':
        return 'bg-orange-50 border-orange-200 text-orange-800 dark:bg-orange-900/20 dark:border-orange-800 dark:text-orange-200';
      case 'approved':
      case 'claim_approved':
        return 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-900/20 dark:border-emerald-800 dark:text-emerald-200';
      case 'rejected':
      case 'claim_rejected':
        return 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-200';
      case 'updated':
      case 'claim_updated':
        return 'bg-purple-50 border-purple-200 text-purple-800 dark:bg-purple-900/20 dark:border-purple-800 dark:text-purple-200';
      case 'document_uploaded':
        return 'bg-indigo-50 border-indigo-200 text-indigo-800 dark:bg-indigo-900/20 dark:border-indigo-800 dark:text-indigo-200';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800 dark:bg-gray-900/20 dark:border-gray-800 dark:text-gray-200';
    }
  };

  const getActionTitle = (action) => {
    switch (action) {
      case 'submitted':
      case 'claim_submitted':
        return 'Claim Submitted';
      case 'hr_review':
      case 'pending_hr_review':
        return 'Under HR Review';
      case 'forwarded_to_insurer':
      case 'forward_to_insurer':
        return 'Forwarded to Insurer';
      case 'returned_to_employee':
      case 'return_to_employee':
        return 'Returned to Employee';
      case 'approved':
      case 'claim_approved':
        return 'Claim Approved';
      case 'rejected':
      case 'claim_rejected':
        return 'Claim Rejected';
      case 'updated':
      case 'claim_updated':
        return 'Claim Updated';
      case 'comment_added':
      case 'note_added':
        return 'Comment Added';
      case 'document_uploaded':
        return 'Document Uploaded';
      default:
        return 'Activity';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown date';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatCurrency = (amount) => {
    if (!amount) return 'Rs. 0';
    return `Rs. ${amount.toLocaleString('en-LK')}`;
  };

  // ENHANCED: Render coverage breakdown in history with better formatting
  const renderCoverageBreakdownInHistory = (coverageBreakdown) => {
    if (!coverageBreakdown || !Array.isArray(coverageBreakdown) || coverageBreakdown.length === 0) {
      return null;
    }

    const totalAmount = coverageBreakdown.reduce((sum, item) => sum + (item.requestedAmount || 0), 0);

    return (
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-md p-4 mt-3">
        <div className="flex items-center space-x-2 mb-3">
          <Package className="h-4 w-4 text-blue-600" />
          <p className="text-sm font-medium text-gray-900 dark:text-white">
            Coverage Breakdown Submitted:
          </p>
        </div>
        
        <div className="space-y-3">
          {coverageBreakdown.map((coverage, idx) => (
            <div key={idx} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="flex items-center space-x-2">
                  <Shield className="h-4 w-4 text-blue-500" />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Coverage Type</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {coverage.coverageType}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Coins className="h-4 w-4 text-green-500" />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Amount</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {formatCurrency(coverage.requestedAmount)}
                    </p>
                  </div>
                </div>
              </div>
              
              {coverage.notes && (
                <div className="mt-3 pt-2 border-t border-gray-200 dark:border-gray-600">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Notes:</p>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{coverage.notes}</p>
                </div>
              )}

              {/* Show when this item was created if available */}
              {coverage.createdAt && (
                <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-600">
                  <div className="flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-400">
                    <Calendar className="h-3 w-3" />
                    <span>Added: {formatDate(coverage.createdAt)}</span>
                  </div>
                </div>
              )}
            </div>
          ))}
          
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mt-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-blue-900 dark:text-blue-200">
                Total Coverage Amount:
              </span>
              <span className="text-lg font-bold text-blue-900 dark:text-blue-200">
                {formatCurrency(totalAmount)}
              </span>
            </div>
            <div className="flex justify-between items-center mt-1 text-xs text-blue-700 dark:text-blue-300">
              <span>Coverage Items: {coverageBreakdown.length}</span>
              <span>HR Approved</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ENHANCED: Generate synthetic history with coverage breakdown from claim data
  const generateSyntheticHistory = () => {
    console.log("heeeee ",claim)
    const syntheticHistory = [];
    
    if (claim.submittedAt) {
      syntheticHistory.push({
        action: 'submitted',
        timestamp: claim.submittedAt,
        performedBy: claim.employeeId,
        description: 'Claim was submitted for review',
        amount: claim.claimAmount?.requested,
        metadata: {
          originalAmount: claim.claimAmount?.requested
        }
      });
    }

    if (claim.claimStatus === 'hr' || claim.claimStatus === 'insurer' || claim.claimStatus === 'approved' || claim.claimStatus === 'rejected' || claim.claimStatus === 'employee') {
      syntheticHistory.push({
        action: 'hr_review',
        timestamp: claim.updatedAt || claim.submittedAt,
        description: 'Claim moved to HR review stage',
        metadata: {
          reviewStage: 'hr'
        }
      });
    }

    // IMPORTANT: Include coverage breakdown when forwarded to insurer
    if (claim.claimStatus === 'insurer' || claim.claimStatus === 'approved' || claim.claimStatus === 'rejected') {
      syntheticHistory.push({
        action: 'forwarded_to_insurer',
        timestamp: claim.forwardedAt || claim.updatedAt,
        description: 'Claim forwarded to insurer for processing with detailed coverage breakdown',
        hrNotes: claim.hrNotes,
        // ENHANCED: Include coverage breakdown from the claim
        coverageBreakdown: claim.coverageBreakdown || [],
        metadata: {
          totalCoverageAmount: claim.coverageBreakdown ? 
            claim.coverageBreakdown.reduce((sum, item) => sum + (item.requestedAmount || 0), 0) : 0,
          coverageItemCount: claim.coverageBreakdown ? claim.coverageBreakdown.length : 0,
          forwardedBy: 'HR Team'
        }
      });
    }

    if (claim.claimStatus === 'employee' && claim.returnReason) {
      syntheticHistory.push({
        action: 'returned_to_employee',
        timestamp: claim.updatedAt,
        description: 'Claim returned to employee for corrections',
        returnReason: claim.returnReason,
        metadata: {
          returnStage: 'employee'
        }
      });
    }

    if (claim.claimStatus === 'approved') {
      syntheticHistory.push({
        action: 'approved',
        timestamp: claim.updatedAt,
        description: 'Claim approved by insurer',
        amount: claim.claimAmount?.approved,
        metadata: {
          approvedAmount: claim.claimAmount?.approved,
          originalAmount: claim.claimAmount?.requested
        }
      });
    }

    if (claim.claimStatus === 'rejected') {
      syntheticHistory.push({
        action: 'rejected',
        timestamp: claim.updatedAt,
        description: 'Claim rejected by insurer',
        rejectionReason: claim.rejectionReason,
        metadata: {
          rejectionStage: 'insurer'
          
        }
      });
    }

    return syntheticHistory.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  };

  const displayHistory = history.length > 0 ? history : generateSyntheticHistory();

  if (!claim) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-4">
            <History className="h-6 w-6 text-blue-600" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Claim History & Timeline
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Claim ID: {claim.claimId} | Employee: {claim.employeeId?.firstName} {claim.employeeId?.lastName}
              </p>
              {/* Show coverage breakdown indicator */}
              {claim.coverageBreakdown && claim.coverageBreakdown.length > 0 && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200 dark:bg-green-900/20 dark:text-green-200 dark:border-green-800 mt-1">
                  <Package className="h-3 w-3 mr-1" />
                  {claim.coverageBreakdown.length} Coverage Items Detailed
                </span>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6">
          {/* Enhanced Current Status Summary */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Current Status</p>
                <p className="font-semibold text-gray-900 dark:text-white capitalize">
                  {claim.claimStatus?.replace('_', ' ') || 'Unknown'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Claim Type</p>
                <p className="font-semibold text-gray-900 dark:text-white">
                  {claim.claimType === 'life' ? 'Life Insurance' : 'Vehicle Insurance'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Requested Amount</p>
                <p className="font-semibold text-gray-900 dark:text-white">
                  {formatCurrency(claim.claimAmount?.requested)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Last Updated</p>
                <p className="font-semibold text-gray-900 dark:text-white">
                  {formatDate(claim.updatedAt)}
                </p>
              </div>
            </div>

            {/* Show coverage breakdown summary if available */}
            {claim.coverageBreakdown && claim.coverageBreakdown.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Coverage Items</p>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {claim.coverageBreakdown.length} types
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Coverage Amount</p>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {formatCurrency(claim.coverageBreakdown.reduce((sum, item) => sum + (item.requestedAmount || 0), 0))}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Forwarded Date</p>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {formatDate(claim.forwardedAt)}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* History Timeline */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
                Activity Timeline
              </h3>
              {!loading && !error && history.length > 0 && (
                <button
                  onClick={fetchClaimHistory}
                  className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 flex items-center space-x-1"
                >
                  <History className="h-4 w-4" />
                  <span>Refresh</span>
                </button>
              )}
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                <span className="ml-3 text-gray-600 dark:text-gray-400">Loading history...</span>
              </div>
            ) : error ? (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                    <div>
                      <p className="text-yellow-800 dark:text-yellow-200 font-medium">
                        Could not load detailed history
                      </p>
                      <p className="text-yellow-700 dark:text-yellow-300 text-sm">
                        Showing timeline based on current claim status
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={fetchClaimHistory}
                    className="text-sm text-yellow-600 hover:text-yellow-700 dark:text-yellow-400 dark:hover:text-yellow-300"
                  >
                    Retry
                  </button>
                </div>
              </div>
            ) : null}

            {displayHistory.length === 0 ? (
              <div className="text-center py-8">
                <History className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No History Available
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  No activity history found for this claim.
                </p>
              </div>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {displayHistory.map((entry, index) => (
                  <div
                    key={index}
                    className={`border rounded-lg p-4 ${getActionColor(entry.action)}`}
                  >
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0 mt-1">
                        {getActionIcon(entry.action)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold">
                            {getActionTitle(entry.action)}
                          </h4>
                          <span className="text-sm opacity-75">
                            {formatDate(entry.timestamp || entry.createdAt)}
                          </span>
                        </div>

                        {/* Action Details */}
                        <div className="space-y-2">
                          {entry.performedBy && (
                            <p className="text-sm">
                              <span className="font-medium">Performed by:</span>{' '}
                              {entry.performedBy.firstName} {entry.performedBy.lastName}{' '}
                              ({entry.performedBy.role || 'Unknown Role'})
                            </p>
                          )}

                          {entry.description && (
                            <p className="text-sm">
                              <span className="font-medium">Description:</span> {entry.description}
                            </p>
                          )}

                          {entry.notes && (
                            <p className="text-sm">
                              <span className="font-medium">Notes:</span> {entry.notes}
                            </p>
                          )}

                          {entry.hrNotes && (
                            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-md p-3 mt-2">
                              <p className="text-sm font-medium mb-1">HR Notes:</p>
                              <p className="text-sm">{entry.hrNotes}</p>
                            </div>
                          )}

                          {entry.returnReason && (
                            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-md p-3 mt-2">
                              <p className="text-sm font-medium mb-1">Return Reason:</p>
                              <p className="text-sm">{entry.returnReason}</p>
                            </div>
                          )}

                          {/* ENHANCED: Coverage Breakdown Display */}
                          {entry.coverageBreakdown && entry.coverageBreakdown.length > 0 && 
                            renderCoverageBreakdownInHistory(entry.coverageBreakdown)
                          }

                          {/* Show metadata if available */}
                          {entry.metadata && (
                            <div className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                              {entry.metadata.totalCoverageAmount && (
                                <p>
                                  <span className="font-medium">Coverage Total:</span>{' '}
                                  {formatCurrency(entry.metadata.totalCoverageAmount)}
                                </p>
                              )}
                              {entry.metadata.coverageItemCount && (
                                <p>
                                  <span className="font-medium">Coverage Items:</span>{' '}
                                  {entry.metadata.coverageItemCount}
                                </p>
                              )}
                              {entry.metadata.forwardedBy && (
                                <p>
                                  <span className="font-medium">Forwarded by:</span>{' '}
                                  {entry.metadata.forwardedBy}
                                </p>
                              )}
                            </div>
                          )}

                          {entry.previousStatus && entry.newStatus && (
                            <p className="text-sm">
                              <span className="font-medium">Status changed:</span>{' '}
                              <span className="capitalize">{entry.previousStatus.replace('_', ' ')}</span>
                              {' → '}
                              <span className="capitalize">{entry.newStatus.replace('_', ' ')}</span>
                            </p>
                          )}

                          {entry.documents && entry.documents.length > 0 && (
                            <div className="mt-2">
                              <p className="text-sm font-medium mb-1">Documents:</p>
                              <div className="flex flex-wrap gap-2">
                                {entry.documents.map((doc, idx) => (
                                  <span
                                    key={idx}
                                    className="inline-flex items-center px-2 py-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded text-xs"
                                  >
                                    <FileText className="h-3 w-3 mr-1" />
                                    {doc.originalName || doc.filename}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {entry.amount && (
                            <p className="text-sm">
                              <span className="font-medium">Amount:</span> {formatCurrency(entry.amount)}
                            </p>
                          )}
                        </div>

                        {/* System Information */}
                        {entry.metadata && entry.metadata.userAgent && (
                          <div className="mt-3 pt-2 border-t border-gray-200 dark:border-gray-600">
                            <div className="flex items-center space-x-4 text-xs opacity-75">
                              <span>Browser: {entry.metadata.userAgent.substring(0, 30)}...</span>
                              {entry.metadata.ipAddress && (
                                <span>IP: {entry.metadata.ipAddress}</span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Enhanced Additional Information */}
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Claim Summary</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Submitted:</span>
                    <span className="text-gray-900 dark:text-white">
                      {formatDate(claim.submittedAt)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Days in System:</span>
                    <span className="text-gray-900 dark:text-white">
                      {Math.ceil((new Date() - new Date(claim.submittedAt)) / (1000 * 60 * 60 * 24))} days
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Total Activities:</span>
                    <span className="text-gray-900 dark:text-white">
                      {displayHistory.length} activities
                    </span>
                  </div>
                  {/* Show coverage breakdown summary */}
                  {claim.coverageBreakdown && claim.coverageBreakdown.length > 0 && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Coverage Items:</span>
                        <span className="text-gray-900 dark:text-white">
                          {claim.coverageBreakdown.length} types
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Coverage Total:</span>
                        <span className="text-gray-900 dark:text-white">
                          {formatCurrency(claim.coverageBreakdown.reduce((sum, item) => sum + (item.requestedAmount || 0), 0))}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Current Status</h4>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {claim.claimStatus === 'hr' && (
                    <div className="flex items-start space-x-2">
                      <Clock className="h-4 w-4 text-yellow-500 mt-0.5" />
                      <p>Claim is pending HR review. Action required from HR team.</p>
                    </div>
                  )}
                  {claim.claimStatus === 'insurer' && (
                    <div className="flex items-start space-x-2">
                      <Send className="h-4 w-4 text-blue-500 mt-0.5" />
                      <div>
                        <p>Claim has been forwarded to insurer for processing.</p>
                        {claim.coverageBreakdown && claim.coverageBreakdown.length > 0 && (
                          <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                            Detailed coverage breakdown submitted with {claim.coverageBreakdown.length} items
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                  {claim.claimStatus === 'employee' && (
                    <div className="flex items-start space-x-2">
                      <ArrowLeft className="h-4 w-4 text-orange-500 mt-0.5" />
                      <p>Claim has been returned to employee for corrections.</p>
                    </div>
                  )}
                  {claim.claimStatus === 'approved' && (
                    <div className="flex items-start space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                      <div>
                        <p>Claim has been approved and is being processed for payment.</p>
                        {claim.coverageBreakdown && claim.coverageBreakdown.length > 0 && (
                          <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                            Coverage breakdown was reviewed and approved
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                  {claim.claimStatus === 'rejected' && (
                    <div className="flex items-start space-x-2">
                      <XCircle className="h-4 w-4 text-red-500 mt-0.5" />
                      <p>Claim has been rejected. Employee may submit an appeal if applicable.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-4 p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};