/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { Search, Filter, X, Calendar, User, FileText, Clock, Send, ArrowLeft } from 'lucide-react';

export const ClaimFilters = ({ filters, onFilterChange, loading, showHRActions = false }) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [localFilters, setLocalFilters] = useState(filters);
  const [pendingAdvancedFilters, setPendingAdvancedFilters] = useState({});


  // Sync local filters with props
  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const handleInputChange = (field, value) => {
    const updatedFilters = { ...localFilters, [field]: value };
    setLocalFilters(updatedFilters);
    if (['searchTerm', 'claimStatus', 'claimType'].includes(field)) {
      onFilterChange(updatedFilters);
    }
  };

  const handleAdvancedFilterChange = (field, value) => {
    const updatedFilters = { ...localFilters, [field]: value };
    setLocalFilters(updatedFilters);
    setPendingAdvancedFilters({ ...pendingAdvancedFilters, [field]: value });
  };

  const applyAdvancedFilters = () => {
    onFilterChange(localFilters);
    setPendingAdvancedFilters({});
  };

  const handleClearFilters = () => {
    const clearedFilters = {
      claimStatus: '',
      claimType: '',
      employeeId: '',
      startDate: '',
      endDate: '',
      searchTerm: '',
      hrAction: '',
      urgency: '',
      hasReturnReason: '',
      hasHRNotes: '',
      daysOld: ''
    };
    setLocalFilters(clearedFilters);
    setPendingAdvancedFilters({});
    onFilterChange(clearedFilters);
  };

  const hasActiveFilters = () => {
    return localFilters.claimType || 
           localFilters.employeeId || 
           localFilters.startDate || 
           localFilters.endDate || 
           localFilters.searchTerm ||
           localFilters.claimStatus ||
           localFilters.hrAction ||
           localFilters.urgency ||
           localFilters.hasReturnReason ||
           localFilters.hasHRNotes ||
           localFilters.daysOld;
  };
  const hasPendingChanges = () => {
    return Object.keys(pendingAdvancedFilters).length > 0;
  };


  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      {/* Quick Status Filters - HR specific (removed approved/rejected) */}
      {showHRActions && (
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Quick Status Filters</h4>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleInputChange('claimStatus', '')}
              className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
                localFilters.claimStatus === '' 
                  ? 'bg-gray-600 text-white border-gray-600' 
                  : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600'
              }`}
            >
              All Claims
            </button>
            
            <button
              onClick={() => handleInputChange('claimStatus', 'hr')}
              className={`flex items-center space-x-1 px-3 py-1.5 text-sm rounded-full border transition-colors ${
                localFilters.claimStatus === 'hr' 
                  ? 'bg-yellow-600 text-white border-yellow-600' 
                  : 'bg-yellow-100 text-yellow-700 border-yellow-300 hover:bg-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-700'
              }`}
            >
              <Clock className="h-3 w-3" />
              <span>Pending HR Review</span>
            </button>
            
            <button
              onClick={() => handleInputChange('claimStatus', 'insurer')}
              className={`flex items-center space-x-1 px-3 py-1.5 text-sm rounded-full border transition-colors ${
                localFilters.claimStatus === 'insurer' 
                  ? 'bg-blue-600 text-white border-blue-600' 
                  : 'bg-blue-100 text-blue-700 border-blue-300 hover:bg-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-700'
              }`}
            >
              <Send className="h-3 w-3" />
              <span>With Insurer</span>
            </button>
            
            <button
              onClick={() => handleInputChange('claimStatus', 'employee')}
              className={`flex items-center space-x-1 px-3 py-1.5 text-sm rounded-full border transition-colors ${
                localFilters.claimStatus === 'employee' 
                  ? 'bg-orange-600 text-white border-orange-600' 
                  : 'bg-orange-100 text-orange-700 border-orange-300 hover:bg-orange-200 dark:bg-orange-900/20 dark:text-orange-300 dark:border-orange-700'
              }`}
            >
              <ArrowLeft className="h-3 w-3" />
              <span>Returned to Employee</span>
            </button>
          </div>
        </div>
      )}

      {/* Basic Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search claims..."
            value={localFilters.searchTerm}
            onChange={(e) => handleInputChange('searchTerm', e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
          />
        </div>

        {/* Claim Type Filter */}
        <div>
          <select
            value={localFilters.claimType}
            onChange={(e) => handleInputChange('claimType', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="">All Types</option>
            <option value="life">Life Insurance</option>
            <option value="vehicle">Vehicle Insurance</option>
          </select>
        </div>

        {/* Urgency Filter */}
        {showHRActions && (
          <div>
            <select
              value={localFilters.urgency}
              onChange={(e) => handleInputChange('urgency', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="">All Urgency</option>
              <option value="high">High Priority (7+ days)</option>
              <option value="medium">Medium Priority (3+ days)</option>
              <option value="normal">Normal (&lt; 3 days)</option>
            </select>
          </div>
        )}

        {/* Advanced Filters Toggle */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center space-x-2 text-green-600 hover:text-green-700 dark:text-green-400 font-medium"
          >
            <Filter className="h-4 w-4" />
            <span>{showAdvanced ? 'Less' : 'More'} Filters</span>
          </button>
          
          {hasActiveFilters() && (
            <button
              onClick={handleClearFilters}
              className="flex items-center space-x-1 text-gray-600 hover:text-gray-700 dark:text-gray-400 text-sm"
            >
              <X className="h-4 w-4" />
              <span>Clear All</span>
            </button>
          )}
        </div>
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            {/* Date Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Calendar className="inline h-4 w-4 mr-1" />
                From Date
              </label>
              <input
                type="date"
                value={localFilters.startDate}
                onChange={(e) => handleAdvancedFilterChange('startDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Calendar className="inline h-4 w-4 mr-1" />
                To Date
              </label>
              <input
                type="date"
                value={localFilters.endDate}
                onChange={(e) => handleAdvancedFilterChange('endDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
              />
            </div>

            {/* Employee Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <User className="inline h-4 w-4 mr-1" />
                Employee ID/Name
              </label>
              <input
                type="text"
                placeholder="Enter employee ID or name..."
                value={localFilters.employeeId}
                onChange={(e) => handleAdvancedFilterChange('employeeId', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>

          {/* HR-Specific Filters */}
          {showHRActions && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              {/* Days Old Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Clock className="inline h-4 w-4 mr-1" />
                  Days in System
                </label>
                <select
                  value={localFilters.daysOld}
                  onChange={(e) => handleAdvancedFilterChange('daysOld', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="">Any Age</option>
                  <option value="today">Today</option>
                  <option value="yesterday">Yesterday</option>
                  <option value="3">Last 3 days</option>
                  <option value="7">Last 7 days</option>
                  <option value="14">Last 14 days</option>
                  <option value="30">Last 30 days</option>
                  <option value="older">Older than 30 days</option>
                </select>
              </div>

              {/* Has Return Reason */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Return Status
                </label>
                <select
                  value={localFilters.hasReturnReason}
                  onChange={(e) => handleAdvancedFilterChange('hasReturnReason', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="">All Claims</option>
                  <option value="true">Has Return Reason</option>
                  <option value="false">No Return Reason</option>
                </select>
              </div>

              {/* Has HR Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  HR Notes Status
                </label>
                <select
                  value={localFilters.hasHRNotes}
                  onChange={(e) => handleInputChange('hasHRNotes', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="">All Claims</option>
                  <option value="true">Has HR Notes</option>
                  <option value="false">No HR Notes</option>
                </select>
              </div>
            </div>
          )}

          {/* Apply Advanced Filters Button */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={applyAdvancedFilters}
                disabled={!hasPendingChanges() && !hasActiveFilters()}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
              >
                <Filter className="h-4 w-4" />
                <span>Apply Filters</span>
                {hasPendingChanges() && (
                  <span className="bg-green-800 text-xs px-2 py-0.5 rounded-full">
                    {Object.keys(pendingAdvancedFilters).length}
                  </span>
                )}
              </button>
              
              {hasPendingChanges() && (
                <span className="text-sm text-orange-600 dark:text-orange-400">
                  {Object.keys(pendingAdvancedFilters).length} pending change(s)
                </span>
              )}
            </div>
            
            {loading && (
              <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-500"></div>
                <span>Applying filters...</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Active Filters Display */}
      {hasActiveFilters() && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Active Filters:
            </span>
            
            {localFilters.claimStatus && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                Status: {localFilters.claimStatus === 'hr' ? 'Pending HR' : 
                         localFilters.claimStatus === 'insurer' ? 'With Insurer' :
                         localFilters.claimStatus === 'employee' ? 'With Employee' : 
                         localFilters.claimStatus}
                <button
                  onClick={() => handleInputChange('claimStatus', '')}
                  className="ml-2 text-blue-600 hover:text-blue-800 dark:text-blue-400"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            
            {localFilters.claimType && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                Type: {localFilters.claimType === 'life' ? 'Life Insurance' : 'Vehicle Insurance'}
                <button
                  onClick={() => handleInputChange('claimType', '')}
                  className="ml-2 text-green-600 hover:text-green-800 dark:text-green-400"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            
            {localFilters.searchTerm && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                Search: "{localFilters.searchTerm}"
                <button
                  onClick={() => handleInputChange('searchTerm', '')}
                  className="ml-2 text-purple-600 hover:text-purple-800 dark:text-purple-400"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}

            {localFilters.urgency && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                Urgency: {localFilters.urgency}
                <button
                  onClick={() => {
                    handleAdvancedFilterChange('urgency', '');
                    applyAdvancedFilters();
                  }}
                  className="ml-2 text-yellow-600 hover:text-yellow-800 dark:text-yellow-400"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}

            {localFilters.daysOld && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
                Age: {localFilters.daysOld === 'today' ? 'Today' :
                      localFilters.daysOld === 'yesterday' ? 'Yesterday' :
                      localFilters.daysOld === 'older' ? '30+ days' :
                      `${localFilters.daysOld} days`}
                <button
                  onClick={() => {
                    handleAdvancedFilterChange('daysOld', '');
                    applyAdvancedFilters();
                  }}
                  className="ml-2 text-orange-600 hover:text-orange-800 dark:text-orange-400"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}

            {localFilters.hasReturnReason && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                Return: {localFilters.hasReturnReason === 'true' ? 'Has Reason' : 'No Reason'}
                <button
                  onClick={() => {
                    handleAdvancedFilterChange('hasReturnReason', '');
                    applyAdvancedFilters();
                  }}
                  className="ml-2 text-red-600 hover:text-red-800 dark:text-red-400"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}

            {localFilters.hasHRNotes && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200">
                HR Notes: {localFilters.hasHRNotes === 'true' ? 'Has Notes' : 'No Notes'}
                <button
                  onClick={() => {
                    handleAdvancedFilterChange('hasHRNotes', '');
                    applyAdvancedFilters();
                  }}
                  className="ml-2 text-indigo-600 hover:text-indigo-800 dark:text-indigo-400"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}

            {(localFilters.startDate || localFilters.endDate) && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200">
                Date: {localFilters.startDate || 'Start'} to {localFilters.endDate || 'End'}
                <button
                  onClick={() => {
                    handleAdvancedFilterChange('startDate', '');
                    handleAdvancedFilterChange('endDate', '');
                    applyAdvancedFilters();
                  }}
                  className="ml-2 text-gray-600 hover:text-gray-800 dark:text-gray-400"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}

            {localFilters.employeeId && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200">
                Employee: {localFilters.employeeId}
                <button
                  onClick={() => {
                    handleAdvancedFilterChange('employeeId', '');
                    applyAdvancedFilters();
                  }}
                  className="ml-2 text-teal-600 hover:text-teal-800 dark:text-teal-400"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
          </div>
        </div>
      )}

      {/* Filter Summary */}
      {showHRActions && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center justify-between">
              <span>
                {hasActiveFilters() 
                  ? `Filtering claims with ${Object.values(localFilters).filter(v => v).length} active filter(s)`
                  : 'Showing all claims'
                }
                {hasPendingChanges() && (
                  <span className="ml-2 text-orange-600 dark:text-orange-400">
                    • {Object.keys(pendingAdvancedFilters).length} pending change(s) - click Apply Filters
                  </span>
                )}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};