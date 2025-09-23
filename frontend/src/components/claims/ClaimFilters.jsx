/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { Search, Filter, X, Calendar, User, FileText } from 'lucide-react';

export const ClaimFilters = ({ filters, onFilterChange, loading }) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [localFilters, setLocalFilters] = useState(filters);

  // Sync local filters with props
  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const handleInputChange = (field, value) => {
    const updatedFilters = { ...localFilters, [field]: value };
    setLocalFilters(updatedFilters);
    onFilterChange(updatedFilters);
  };

  const handleClearFilters = () => {
    const clearedFilters = {
      claimStatus: 'hr',
      claimType: '',
      employeeId: '',
      startDate: '',
      endDate: '',
      searchTerm: ''
    };
    setLocalFilters(clearedFilters);
    onFilterChange(clearedFilters);
  };

  const hasActiveFilters = () => {
    return localFilters.claimType || 
           localFilters.employeeId || 
           localFilters.startDate || 
           localFilters.endDate || 
           localFilters.searchTerm ||
           (localFilters.claimStatus && localFilters.claimStatus !== 'hr');
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
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

        {/* Status Filter */}
        <div>
          <select
            value={localFilters.claimStatus}
            onChange={(e) => handleInputChange('claimStatus', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="">All Statuses</option>
            <option value="hr">Pending HR Review</option>
            <option value="insurer">With Insurer</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="employee">Returned to Employee</option>
          </select>
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
              <span>Clear</span>
            </button>
          )}
        </div>
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Date Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Calendar className="inline h-4 w-4 mr-1" />
                From Date
              </label>
              <input
                type="date"
                value={localFilters.startDate}
                onChange={(e) => handleInputChange('startDate', e.target.value)}
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
                onChange={(e) => handleInputChange('endDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
              />
            </div>

            {/* Employee Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <User className="inline h-4 w-4 mr-1" />
                Employee ID
              </label>
              <input
                type="text"
                placeholder="Enter employee ID..."
                value={localFilters.employeeId}
                onChange={(e) => handleInputChange('employeeId', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>
        </div>
      )}

      {/* Active Filters Display */}
      {hasActiveFilters() && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex flex-wrap items-center space-x-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Active Filters:
            </span>
            
            {localFilters.claimStatus && localFilters.claimStatus !== 'hr' && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                Status: {localFilters.claimStatus}
                <button
                  onClick={() => handleInputChange('claimStatus', 'hr')}
                  className="ml-2 text-blue-600 hover:text-blue-800"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            
            {localFilters.claimType && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                Type: {localFilters.claimType}
                <button
                  onClick={() => handleInputChange('claimType', '')}
                  className="ml-2 text-green-600 hover:text-green-800"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            
            {localFilters.searchTerm && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                Search: {localFilters.searchTerm}
                <button
                  onClick={() => handleInputChange('searchTerm', '')}
                  className="ml-2 text-purple-600 hover:text-purple-800"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};