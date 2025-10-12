import React from 'react';
import { 
  Eye, 
  ArrowRight, 
  ArrowLeft, 
  ChevronUp, 
  ChevronDown,
  Coins,
  User,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  Send,
  AlertTriangle,
  MessageSquare
} from 'lucide-react';

export const ClaimTable = ({ 
  claims, 
  loading, 
  sortBy, 
  sortOrder, 
  onSort, 
  onViewClaim, 
  onForwardClaim, 
  onReturnClaim,
  showHRActions = true
}) => {
  const getStatusIcon = (status) => {
    switch (status) {
      case 'hr':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'insurer':
        return <Send className="h-4 w-4 text-blue-500" />;
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'employee':
        return <ArrowLeft className="h-4 w-4 text-orange-500" />;
      default:
        return <FileText className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusText = (status) => {
    const statusMap = {
      hr: 'Pending Review',
      insurer: 'With Insurer',
      approved: 'Approved',
      rejected: 'Rejected',
      employee: 'With Employee'
    };
    return statusMap[status] || status;
  };

  const getStatusColor = (status) => {
    const colorMap = {
      hr: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      insurer: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      approved: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      rejected: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      employee: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
    };
    return colorMap[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    if (!amount) return 'Rs. 0';
    return `Rs. ${amount.toLocaleString('en-LK')}`;
  };

  const getDaysAgo = (dateString) => {
    if (!dateString) return 0;
    
    const today = new Date();
    const submittedDate = new Date(dateString);
    
    today.setHours(0, 0, 0, 0);
    submittedDate.setHours(0, 0, 0, 0);
    
    const diffTime = today - submittedDate;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    return Math.max(0, diffDays);
  };

  const formatDaysAgo = (dateString) => {
    const days = getDaysAgo(dateString);
    
    if (days === 0) {
      return 'Today';
    } else if (days === 1) {
      return '1 day ago';
    } else {
      return `${days} days ago`;
    }
  };

  const getSortIcon = (field) => {
    if (sortBy !== field) {
      return <ChevronUp className="h-4 w-4 text-gray-300" />;
    }
    return sortOrder === 'asc' ? 
      <ChevronUp className="h-4 w-4 text-green-600" /> : 
      <ChevronDown className="h-4 w-4 text-green-600" />;
  };

  const canForwardClaim = (claim) => {
    return claim.claimStatus === 'hr';
  };

  const canReturnClaim = (claim) => {
    return claim.claimStatus === 'hr';
  };

  const getUrgencyIndicator = (claim) => {
    if (!claim.submittedAt) return null;
    
    const daysOld = getDaysAgo(claim.submittedAt);
    
    if (claim.claimStatus === 'hr' && daysOld > 7) {
      return {
        level: 'high',
        message: `${daysOld} days pending`,
        icon: AlertTriangle,
        color: 'text-red-500'
      };
    }
    
    if (claim.claimStatus === 'hr' && daysOld > 3) {
      return {
        level: 'medium',
        message: `${daysOld} days pending`,
        icon: Clock,
        color: 'text-yellow-500'
      };
    }
    
    return null;
  };

  const hasRecentActivity = (claim) => {
    if (!claim.updatedAt) return false;
    const hoursSinceUpdate = (new Date() - new Date(claim.updatedAt)) / (1000 * 60 * 60);
    return hoursSinceUpdate < 24;
  };

  if (loading && claims.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
        <span className="ml-3 text-gray-600 dark:text-gray-400">Loading claims...</span>
      </div>
    );
  }

  if (claims.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          No Claims Found
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          No claims match your current filters. Try adjusting your search criteria.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        {/* Table Header */}
        <thead className="bg-gray-50 dark:bg-gray-700">
          <tr>
            <th
              onClick={() => onSort('claimId')}
              className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
            >
              <div className="flex items-center space-x-1">
                <span>Claim ID & Employee</span>
                {getSortIcon('claimId')}
              </div>
            </th>
            <th
              onClick={() => onSort('employeeId')}
              className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
            >
              <div className="flex items-center space-x-1">
                <span>Employee</span>
                {getSortIcon('employeeId')}
              </div>
            </th>
            <th
              onClick={() => onSort('claimType')}
              className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
            >
              <div className="flex items-center space-x-1">
                <span>Type</span>
                {getSortIcon('claimType')}
              </div>
            </th>
            <th
              onClick={() => onSort('claimAmount.requested')}
              className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
            >
              <div className="flex items-center space-x-1">
                <span>Amount</span>
                {getSortIcon('claimAmount.requested')}
              </div>
            </th>
            <th
              onClick={() => onSort('claimStatus')}
              className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
            >
              <div className="flex items-center space-x-1">
                <span>Status</span>
                {getSortIcon('claimStatus')}
              </div>
            </th>
            <th
              onClick={() => onSort('submittedAt')}
              className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
            >
              <div className="flex items-center space-x-1">
                <span>Submitted</span>
                {getSortIcon('submittedAt')}
              </div>
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>

        {/* Table Body */}
        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
          {claims.map((claim) => {
            const urgencyIndicator = getUrgencyIndicator(claim);
            const hasActivity = hasRecentActivity(claim);
            
            return (
              <tr 
                key={claim._id} 
                className={`hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150 ${
                  urgencyIndicator?.level === 'high' ? 'bg-red-50 dark:bg-red-900/10' : 
                  urgencyIndicator?.level === 'medium' ? 'bg-yellow-50 dark:bg-yellow-900/10' : ''
                }`}
              >
                {/* Claim ID with urgency indicator */}
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-2">
                    <div>
                      <div className="flex items-center space-x-2">
                        <div className="text-sm font-bold text-gray-900 dark:text-white">
                          {claim.claimId}
                        </div>
                        {hasActivity && (
                          <div className="h-2 w-2 bg-green-400 rounded-full animate-pulse" title="Recent activity"></div>
                        )}
                      </div>
                      <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {claim.employeeId?.fullName || `${claim.employeeId?.firstName || ''} ${claim.employeeId?.lastName || ''}`.trim() || 'N/A'}
                      </div>
                      {urgencyIndicator && (
                        <div className="flex items-center space-x-1 mt-1">
                          <urgencyIndicator.icon className={`h-3 w-3 ${urgencyIndicator.color}`} />
                          <span className={`text-xs ${urgencyIndicator.color}`}>
                            {urgencyIndicator.message}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </td>

                {/* Employee */}
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-8 w-8">
                      <div className="h-8 w-8 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                        <User className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                      </div>
                    </div>
                    <div className="ml-3">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {claim.employeeId?.firstName} {claim.employeeId?.lastName}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {claim.employeeId?.email}
                      </div>
                      {claim.employeeId?.department && (
                        <div className="text-xs text-gray-400 dark:text-gray-500">
                          {claim.employeeId.department}
                        </div>
                      )}
                    </div>
                  </div>
                </td>

                {/* Type */}
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900 dark:text-white">
                    {claim.claimType === 'life' ? 'Life Insurance' : 'Vehicle Insurance'}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {claim.claimType === 'life' ? claim.lifeClaimOption : claim.vehicleClaimOption}
                  </div>
                  {claim.questionnaire?.responses && (
                    <div className="text-xs text-blue-600 dark:text-blue-400">
                      {claim.questionnaire.responses.filter(r => r.isAnswered).length} questions answered
                    </div>
                  )}
                </td>

                {/* Amount */}
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {formatCurrency(claim.claimAmount?.requested)}
                  </div>
                  {claim.claimAmount?.approved > 0 && (
                    <div className="text-sm text-green-600 dark:text-green-400">
                      Approved: {formatCurrency(claim.claimAmount?.approved)}
                    </div>
                  )}
                  {claim.returnReason && (
                    <div className="text-xs text-orange-600 dark:text-orange-400 flex items-center mt-1">
                      <MessageSquare className="h-3 w-3 mr-1" />
                      Returned
                    </div>
                  )}
                </td>

                {/* Status */}
                <td className="px-4 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(claim.claimStatus)}`}>
                    {getStatusIcon(claim.claimStatus)}
                    <span className="ml-1">{getStatusText(claim.claimStatus)}</span>
                  </span>
                  {claim.hrNotes && (
                    <div className="text-xs text-blue-600 dark:text-blue-400 mt-1 flex items-center">
                      <MessageSquare className="h-3 w-3 mr-1" />
                      Has HR notes
                    </div>
                  )}
                </td>

                {/* Submitted Date */}
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900 dark:text-white">
                    {formatDate(claim.submittedAt)}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {formatDaysAgo(claim.submittedAt)}
                  </div>
                  {claim.updatedAt && claim.updatedAt !== claim.submittedAt && (
                    <div className="text-xs text-blue-600 dark:text-blue-400">
                      Updated: {formatDate(claim.updatedAt)}
                    </div>
                  )}
                </td>

                {/* Actions */}
                <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end space-x-2">
                    {/* View Button */}
                    <button
                      onClick={() => onViewClaim(claim)}
                      className="text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 p-1 rounded-md hover:bg-green-50 dark:hover:bg-green-900/20"
                      title="View Details"
                    >
                      <Eye className="h-4 w-4" />
                    </button>

                    {/* Forward Button - Only for HR status */}
                    {canForwardClaim(claim) && showHRActions && (
                      <button
                        onClick={() => onForwardClaim(claim)}
                        className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 p-1 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/20"
                        title="Forward to Insurer"
                      >
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    )}

                    {/* Return Button - Only for HR status */}
                    {canReturnClaim(claim) && showHRActions && (
                      <button
                        onClick={() => onReturnClaim(claim)}
                        className="text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300 p-1 rounded-md hover:bg-orange-50 dark:hover:bg-orange-900/20"
                        title="Return to Employee"
                      >
                        <ArrowLeft className="h-4 w-4" />
                      </button>
                    )}

                    {/* Status indicators for completed actions */}
                    {claim.claimStatus === 'insurer' && (
                      <div className="flex items-center text-blue-600 dark:text-blue-400" title="Forwarded to Insurer">
                        <Send className="h-4 w-4" />
                      </div>
                    )}

                    {claim.claimStatus === 'employee' && (
                      <div className="flex items-center text-orange-600 dark:text-orange-400" title="Returned to Employee">
                        <ArrowLeft className="h-4 w-4" />
                      </div>
                    )}

                    {claim.claimStatus === 'approved' && (
                      <div className="flex items-center text-green-600 dark:text-green-400" title="Approved">
                        <CheckCircle className="h-4 w-4" />
                      </div>
                    )}

                    {claim.claimStatus === 'rejected' && (
                      <div className="flex items-center text-red-600 dark:text-red-400" title="Rejected">
                        <XCircle className="h-4 w-4" />
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Summary Footer - Updated to include Rejected count */}
      <div className="bg-gray-50 dark:bg-gray-700 px-4 py-4 border-t border-gray-200 dark:border-gray-600">
        <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <div className="h-3 w-3 bg-yellow-400 rounded-full"></div>
              <span>Pending HR: {claims.filter(c => c.claimStatus === 'hr').length}</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="h-3 w-3 bg-blue-400 rounded-full"></div>
              <span>With Insurer: {claims.filter(c => c.claimStatus === 'insurer').length}</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="h-3 w-3 bg-orange-400 rounded-full"></div>
              <span>With Employee: {claims.filter(c => c.claimStatus === 'employee').length}</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="h-3 w-3 bg-green-400 rounded-full"></div>
              <span>Approved: {claims.filter(c => c.claimStatus === 'approved').length}</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="h-3 w-3 bg-red-400 rounded-full"></div>
              <span>Rejected: {claims.filter(c => c.claimStatus === 'rejected').length}</span>
            </div>
          </div>
          
          <div className="text-right">
            <div>
              Total Value: {formatCurrency(claims.reduce((sum, claim) => sum + (claim.claimAmount?.requested || 0), 0))}
            </div>
            {claims.some(c => c.claimAmount?.approved > 0) && (
              <div className="text-green-600 dark:text-green-400">
                Approved: {formatCurrency(claims.reduce((sum, claim) => sum + (claim.claimAmount?.approved || 0), 0))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};