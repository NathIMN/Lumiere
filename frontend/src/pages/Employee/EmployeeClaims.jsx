import React, { useState, useEffect } from 'react';
import { Plus, Search, FileText, Clock, CheckCircle, XCircle, AlertCircle, MessageSquare, Eye, Download, ChevronRight, TrendingUp, Calendar, User, Car, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import InsuranceApiService from "../../services/insurance-api";

export const EmployeeClaims = () => {
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Fetch claims on component mount and when filters change
  useEffect(() => {
    fetchClaims();
  }, []);

  const fetchClaims = async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response = await InsuranceApiService.getClaims(params);
      if (response.success) {
        setClaims(response.claims || []);
      } else {
        setError('Failed to load claims');
      }
    } catch (error) {
      console.error('Error fetching claims:', error);
      setError(error.message || 'Error loading claims. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getDisplayStatus = (status) => {
    if (['hr', 'insurer'].includes(status)) {
      return 'processing';
    }
    else if('employee' == status) return 'incomplete';
    return status;
  };

  const getStatusColor = (status) => {
    const displayStatus = getDisplayStatus(status);
    switch (displayStatus) {
      case 'approved': return 'text-emerald-700 bg-emerald-100 border-emerald-200 dark:text-emerald-400 dark:bg-emerald-900/30 dark:border-emerald-700';
      case 'processing': return 'text-amber-700 bg-amber-100 border-amber-200 dark:text-amber-400 dark:bg-amber-900/30 dark:border-amber-700';
      case 'draft': return 'text-gray-700 bg-gray-100 border-gray-200 dark:text-neutral-300 dark:bg-neutral-900 dark:border-neutral-700';
      case 'incomplete': return 'text-orange-700 bg-orange-100 border-orange-200 dark:text-orange-400 dark:bg-orange-900/30 dark:border-orange-700';
      case 'rejected': return 'text-red-700 bg-red-100 border-red-200 dark:text-red-400 dark:bg-red-900/30 dark:border-red-700';
      default: return 'text-gray-700 bg-gray-100 border-gray-200 dark:text-neutral-300 dark:bg-neutral-900 dark:border-neutral-700';
    }
  };

  const getStatusIcon = (status) => {
    const displayStatus = getDisplayStatus(status);
    switch (displayStatus) {
      case 'approved': return <CheckCircle size={16} />;
      case 'processing': return <Clock size={16} />;
      case 'draft': return <FileText size={16} />;
      case 'rejected': return <XCircle size={16} />;
      default: return <FileText size={16} />;
    }
  };

  const getCategoryColor = (claimType) => {
    switch (claimType) {
      case 'life': return 'border-l-pink-500 dark:border-l-pink-400';
      case 'vehicle': return 'border-l-blue-500 dark:border-l-blue-400';
      default: return 'border-l-gray-500 dark:border-l-gray-400';
    }
  };

  const getCategoryIcon = (claimType) => {
    switch (claimType) {
      case 'life': return <User className="text-pink-500 dark:text-pink-400" size={20} />;
      case 'vehicle': return <Car className="text-blue-500 dark:text-blue-400" size={20} />;
      default: return <FileText className="text-gray-500 dark:text-gray-400" size={20} />;
    }
  };

  const getActionButton = (claim) => {
    const status = claim.claimStatus;
    switch (status) {
      case 'draft':
        return {
          text: 'Continue',
          icon: <ChevronRight size={16} />,
          className: 'bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-500 dark:hover:bg-blue-600',
          urgent: true
        };
      case 'employee':
        return {
          text: 'Complete',
          icon: <Zap size={16} />,
          className: 'bg-amber-600 hover:bg-amber-700 text-white dark:bg-amber-500 dark:hover:bg-amber-600',
          urgent: true
        };
      case 'hr':
      case 'insurer':
        return {
          text: 'Track',
          icon: <Eye size={16} />,
          className: 'bg-green-600 hover:bg-green-700 text-white dark:bg-green-500 dark:hover:bg-green-600',
          urgent: false
        };
      case 'approved':
        return {
          text: 'View',
          icon: <Download size={16} />,
          className: 'bg-emerald-100 hover:bg-emerald-200 text-emerald-700 dark:bg-emerald-900/30 dark:hover:bg-emerald-800/40 dark:text-emerald-300',
          urgent: false
        };
      case 'rejected':
        return {
          text: 'Review',
          icon: <AlertCircle size={16} />,
          className: 'bg-red-100 hover:bg-red-200 text-red-700 dark:bg-red-900/30 dark:hover:bg-red-800/40 dark:text-red-300',
          urgent: true
        };
      default:
        return {
          text: 'View',
          icon: <Eye size={16} />,
          className: 'bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-300',
          urgent: false
        };
    }
  };

  const filteredClaims = claims.filter(claim => {
    const displayStatus = getDisplayStatus(claim.claimStatus);
    const matchesFilter = activeFilter === 'all' || displayStatus === activeFilter;
    const matchesSearch = claim.claimId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         claim.claimType.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (claim.claimOption || claim.lifeClaimOption || claim.vehicleClaimOption || '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const stats = {
    total: claims.length,
    approved: claims.filter(c => c.claimStatus === 'approved').length,
    processing: claims.filter(c => ['employee', 'hr', 'insurer'].includes(c.claimStatus)).length,
    draft: claims.filter(c => c.claimStatus === 'draft').length,
    rejected: claims.filter(c => c.claimStatus === 'rejected').length
  };

  const formatDate = (dateString) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString();
  };

  const getClaimOption = (claim) => {
    return claim.claimOption || claim.lifeClaimOption || claim.vehicleClaimOption || 'N/A';
  };

  const getMessage = (claim) => {
    const status = claim.claimStatus;
    switch(status){
       case "draft": return "Complete the questionnaire";
       case "employee": return "Complete and Submit";
       case "hr": return "Under HR review";
       case "insurer": return "Insurance side processing";
       case "approved": return "Approved: See summary";
       case "rejected": return "Rejected: See Details";
       default : return "Check info";
    }
  };

  const getDaysAgo = (dateString) => {
    if (!dateString) return null;
    const days = Math.floor((new Date() - new Date(dateString)) / (1000 * 60 * 60 * 24));
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    return `${days} days ago`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-neutral-800 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 dark:border-purple-400"></div>
            <p className="mt-4 text-gray-600 dark:text-neutral-300">Loading your claims...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white dark:bg-neutral-800 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <p className="text-red-600 dark:text-red-400 text-lg mb-2">Error Loading Claims</p>
            <p className="text-gray-500 dark:text-neutral-400 mb-4">{error}</p>
            <button
              onClick={() => fetchClaims()}
              className="bg-purple-600 dark:bg-purple-500 text-white px-6 py-2 rounded-lg hover:bg-purple-700 dark:hover:bg-purple-600 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-800 transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-light text-gray-900 dark:text-white mb-2">Claims Portal</h1>
              <p className="text-gray-600 dark:text-neutral-400">Manage your submissions and track progress</p>
            </div>
            <button onClick={() => (navigate("/employee/claims/form"))} className="bg-[#ff7a66] hover:bg-[#ff6b57] dark:bg-[#ff7a66] dark:hover:bg-[#ff6b57] px-6 py-3 rounded-full text-white font-medium flex items-center gap-2 transition-all duration-300 shadow-lg hover:shadow-xl">
              <Plus size={20} />
              New Claim
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <div className="bg-blue-50 dark:bg-neutral-900 border border-blue-200 dark:border-neutral-700 rounded-2xl p-4 text-center shadow-sm">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</div>
              <div className="text-sm text-gray-600 dark:text-neutral-400">Total Claims</div>
            </div>
            <div className="bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-2xl p-4 text-center shadow-sm">
              <div className="text-2xl font-bold text-gray-600 dark:text-neutral-300">{stats.draft}</div>
              <div className="text-sm text-gray-500 dark:text-neutral-400">Draft</div>
            </div>
            <div className="bg-amber-50 dark:bg-neutral-900 border border-amber-200 dark:border-neutral-700 rounded-2xl p-4 text-center shadow-sm">
              <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">{stats.processing}</div>
              <div className="text-sm text-amber-600 dark:text-amber-400">Processing</div>
            </div>
            <div className="bg-emerald-50 dark:bg-neutral-900 border border-emerald-200 dark:border-neutral-700 rounded-2xl p-4 text-center shadow-sm">
              <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{stats.approved}</div>
              <div className="text-sm text-emerald-600 dark:text-emerald-400">Approved</div>
            </div>
            <div className="bg-red-50 dark:bg-neutral-900 border border-red-200 dark:border-neutral-700 rounded-2xl p-4 text-center shadow-sm">
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.rejected}</div>
              <div className="text-sm text-red-600 dark:text-red-400">Rejected</div>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-neutral-500" size={20} />
              <input
                type="text"
                placeholder="Search claims by ID, type, or option..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-full text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 focus:border-transparent shadow-sm"
              />
            </div>
            <div className="flex gap-2">
              {['all', 'draft', 'processing', 'approved', 'rejected'].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                    activeFilter === filter
                      ? 'bg-[#ff7a66] text-white shadow-md'
                      : 'bg-gray-100 dark:bg-neutral-900 text-gray-700 dark:text-neutral-300 hover:bg-gray-200 dark:hover:bg-neutral-700'
                  }`}
                >
                  {filter.charAt(0).toUpperCase() + filter.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Claims List */}
        <div className="space-y-4">
          {filteredClaims.map((claim, index) => {
            const actionButton = getActionButton(claim);
            return (
              <div
                key={claim._id}
                className={`bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-[1.01] border-l-4 shadow-sm ${getCategoryColor(claim.claimType)} group`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    
                    {/* Left Section - Main Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="flex items-center gap-2">
                          {getCategoryIcon(claim.claimType)}
                          <span className="text-gray-500 dark:text-neutral-400 text-sm font-mono bg-gray-100 dark:bg-neutral-800 px-2 py-1 rounded-md">
                            {claim.claimId}
                          </span>
                        </div>
                        <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(claim.claimStatus)}`}>
                          {getStatusIcon(claim.claimStatus)}
                          {getDisplayStatus(claim.claimStatus).charAt(0).toUpperCase() + getDisplayStatus(claim.claimStatus).slice(1)}
                        </div>
                        {actionButton.urgent && (
                          <div className="animate-pulse">
                            <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                          </div>
                        )}
                      </div>
                      
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 capitalize truncate">
                        {claim.claimType} Insurance - {getClaimOption(claim)}
                      </h3>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-neutral-400 mb-1">
                        <div className="flex items-center gap-1">
                          <Calendar size={14} />
                          <span>{getDaysAgo(claim.createdAt)}</span>
                        </div>
                        {claim.submittedAt && (
                          <div className="flex items-center gap-1">
                            <CheckCircle size={14} />
                            <span>Submitted {formatDate(claim.submittedAt)}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right Section - Action & Message */}
                    <div className="flex flex-col items-end gap-3 ml-6">
                      {/* Action Message */}
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                          {getMessage(claim)}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-neutral-400">
                          {actionButton.urgent ? (
                            <>
                              <div className="w-1 h-1 bg-red-400 rounded-full"></div>
                              <span>Action Required</span>
                            </>
                          ) : (
                            <>
                              <div className="w-1 h-1 bg-green-400 rounded-full"></div>
                              <span>Up to Date</span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Action Button */}
                      <button
                        className={`flex items-center justify-center gap-2 px-6 py-2 rounded-full text-sm font-medium transition-all duration-200 shadow-sm hover:shadow-md min-w-[120px] ${actionButton.className} group-hover:scale-105`}
                        onClick={() => (navigate(`${claim.claimId}`))}
                      >
                        <span>{actionButton.text}</span>
                        {actionButton.icon}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Progress Bar for All Claims */}
                <div className="px-6 pb-4">
                  <div className="w-full bg-gray-200 dark:bg-neutral-700 rounded-full h-1">
                    <div 
                      className="bg-gradient-to-r from-purple-500 to-blue-500 dark:from-purple-400 dark:to-blue-400 h-1 rounded-full transition-all duration-1000"
                      style={{
                        width: claim.claimStatus === 'draft' ? '10%' : 
                               claim.claimStatus === 'employee' ? '27%' : 
                               claim.claimStatus === 'hr' ? '50%' : 
                               claim.claimStatus === 'insurer' ? '75%' :
                               (claim.claimStatus === 'approved' || claim.claimStatus === 'rejected') ? '100%' : '0%'
                      }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 dark:text-neutral-400 mt-1">
                    <span>Incomplete</span>
                    <span>Employee</span>
                    <span>HR Review</span>
                    <span>Insurance</span>
                    <span>Complete</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredClaims.length === 0 && !loading && (
          <div className="text-center py-12">
            <FileText className="mx-auto text-slate-500 dark:text-neutral-400 mb-4" size={64} />
            <h3 className="text-xl text-slate-400 dark:text-neutral-300 mb-2">No claims found</h3>
            <p className="text-slate-500 dark:text-neutral-400">
              {claims.length === 0 
                ? "You haven't submitted any claims yet. Create your first claim to get started."
                : "Try adjusting your search or filter criteria"
              }
            </p>
            {claims.length === 0 && (
              <button 
                onClick={() => navigate("/employee/claims/form")}
                className="mt-4 bg-purple-600 dark:bg-purple-500 text-white px-6 py-2 rounded-lg hover:bg-purple-700 dark:hover:bg-purple-600 transition-colors"
              >
                Create Your First Claim
              </button>
            )}
          </div>
        )}

        {/* Quick Actions Footer */}
        <div className="mt-12 flex flex-wrap gap-4 justify-center">
          <button 
            onClick={() => fetchClaims()}
            className="flex items-center gap-2 px-4 py-2 bg-purple-100 dark:bg-neutral-900 hover:bg-purple-200 dark:hover:bg-neutral-700 rounded-full text-purple-700 dark:text-purple-300 transition-colors duration-200"
          >
            <Download size={16} />
            Refresh Claims
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-purple-100 dark:bg-neutral-900 hover:bg-purple-200 dark:hover:bg-neutral-700 rounded-full text-purple-700 dark:text-purple-300 transition-colors duration-200">
            <Download size={16} />
            Export All
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-purple-100 dark:bg-neutral-900 hover:bg-purple-200 dark:hover:bg-neutral-700 rounded-full text-purple-700 dark:text-purple-300 transition-colors duration-200">
            <MessageSquare size={16} />
            Contact Support
          </button>
        </div>
      </div>
    </div>
  );
};