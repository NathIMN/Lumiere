/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import {
  Search,
  Filter,
  X,
  Calendar,
  User,
  FileText,
  Clock,
  Send,
  ArrowLeft,
} from "lucide-react";

export const ClaimFilters = ({
  filters,
  onFilterChange,
  loading,
  showHRActions = false,
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [localFilters, setLocalFilters] = useState(filters);
  const [hasAdvancedChanges, setHasAdvancedChanges] = useState(false);

  // Update useEffect to track advanced changes
  useEffect(() => {
    setLocalFilters(filters);
    setHasAdvancedChanges(false);
  }, [filters]);

  // Split filter handling between immediate and advanced
  const handleImmediateChange = (field, value) => {
    const updatedFilters = { ...localFilters, [field]: value };
    setLocalFilters(updatedFilters);
    onFilterChange(updatedFilters);
  };

  // Helper function to get date for filter
  const getDateForFilter = (filterValue) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    switch (filterValue) {
      case "today": {
        return today.toISOString();
      }
      case "3": {
        const threeDaysAgo = new Date(today);
        threeDaysAgo.setDate(today.getDate() - 3);
        threeDaysAgo.setHours(0, 0, 0, 0);
        return threeDaysAgo.toISOString();
      }
      default: {
        return "";
      }
    }
  };

  const handleAdvancedChange = (field, value) => {
    const updatedFilters = { ...localFilters, [field]: value };

    if (field === "daysOld") {
      const today = new Date();

      if (value === "today") {
        // Set start to beginning of today
        const startOfToday = new Date(today);
        startOfToday.setHours(0, 0, 0, 0);
        updatedFilters.startDate = startOfToday.toISOString();

        // Set end to end of today
        const endOfToday = new Date(today);
        endOfToday.setHours(23, 59, 59, 999);
        updatedFilters.endDate = endOfToday.toISOString();

        setLocalFilters(updatedFilters);
        setHasAdvancedChanges(true);
        return;
      } else if (value === "3") {
        // Set start to 3 days ago
        const threeDaysAgo = new Date(today);
        threeDaysAgo.setDate(today.getDate() - 3);
        threeDaysAgo.setHours(0, 0, 0, 0);
        updatedFilters.startDate = threeDaysAgo.toISOString();

        // Set end to end of today
        const endOfToday = new Date(today);
        endOfToday.setHours(23, 59, 59, 999);
        updatedFilters.endDate = endOfToday.toISOString();
      }
    } else if (field === "hasHRNotes" || field === "hasReturnReason") {
      // Convert string to boolean for boolean filters
      updatedFilters[field] =
        value === "true" ? true : value === "false" ? false : "";
    }
    setLocalFilters(updatedFilters);
    setHasAdvancedChanges(true);
  };

  const applyAdvancedFilters = () => {
    const filtersToApply = { ...localFilters };

    // Handle both manual date selection and daysOld filter
    if (filtersToApply.startDate) {
      const startDate = new Date(filtersToApply.startDate);
      startDate.setHours(0, 0, 0, 0);
      filtersToApply.startDate = startDate.toISOString();
    }

    if (filtersToApply.endDate) {
      const endDate = new Date(filtersToApply.endDate);
      endDate.setHours(23, 59, 59, 999);
      filtersToApply.endDate = endDate.toISOString();
    }
    onFilterChange(filtersToApply);
    setHasAdvancedChanges(false);
  };

  // Add this function to handle date range validation
  const validateDateRange = () => {
    if (localFilters.startDate && localFilters.endDate) {
      if (new Date(localFilters.startDate) > new Date(localFilters.endDate)) {
        return false;
      }
    }
    return true;
  };

  const handleClearFilters = () => {
    const clearedFilters = {
      claimStatus: "",
      claimType: "",
      employeeId: "",
      startDate: "",
      endDate: "",
      searchTerm: "",
      hrAction: "",
      urgency: "",
      hasReturnReason: "",
      hasHRNotes: "",
      daysOld: "",
    };
    setLocalFilters(clearedFilters);
    onFilterChange(clearedFilters);
    setHasAdvancedChanges(false);
  };

  const hasActiveFilters = () => {
    return Object.entries(localFilters).some(([key, value]) => {
      if (value === null) return false;
      if (typeof value === "boolean") return true;
      return value && value !== "";
    });
  };

  const hasPendingChanges = () => {
    return JSON.stringify(localFilters) !== JSON.stringify(filters);
  };

  const handleReset = () => {
    // Create a default filters object with empty values
    const defaultFilters = {
      claimStatus: "",
      claimType: "",
      employeeId: "",
      startDate: "",
      endDate: "",
      searchTerm: "",
      hrAction: "",
      urgency: "",
      hasReturnReason: null,
      hasHRNotes: null,
      daysOld: "",
    };
    setLocalFilters(defaultFilters);
    setHasAdvancedChanges(false);
    // Apply the reset to parent component
    onFilterChange(defaultFilters);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      {/* Quick Status Filters - HR specific */}
      {showHRActions && (
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Quick Status Filters
          </h4>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleImmediateChange("claimStatus", "")}
              className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
                localFilters.claimStatus === ""
                  ? "bg-gray-600 text-white border-gray-600"
                  : "bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600"
              }`}
            >
              All Claims
            </button>

            <button
              onClick={() => handleImmediateChange("claimStatus", "hr")}
              className={`flex items-center space-x-1 px-3 py-1.5 text-sm rounded-full border transition-colors ${
                localFilters.claimStatus === "hr"
                  ? "bg-yellow-600 text-white border-yellow-600"
                  : "bg-yellow-100 text-yellow-700 border-yellow-300 hover:bg-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-700"
              }`}
            >
              <Clock className="h-3 w-3" />
              <span>Pending HR Review</span>
            </button>

            <button
              onClick={() => handleImmediateChange("claimStatus", "insurer")}
              className={`flex items-center space-x-1 px-3 py-1.5 text-sm rounded-full border transition-colors ${
                localFilters.claimStatus === "insurer"
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-blue-100 text-blue-700 border-blue-300 hover:bg-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-700"
              }`}
            >
              <Send className="h-3 w-3" />
              <span>With Insurer</span>
            </button>

            <button
              onClick={() => handleImmediateChange("claimStatus", "employee")}
              className={`flex items-center space-x-1 px-3 py-1.5 text-sm rounded-full border transition-colors ${
                localFilters.claimStatus === "employee"
                  ? "bg-orange-600 text-white border-orange-600"
                  : "bg-orange-100 text-orange-700 border-orange-300 hover:bg-orange-200 dark:bg-orange-900/20 dark:text-orange-300 dark:border-orange-700"
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
            value={localFilters.searchTerm || ""}
            onChange={(e) =>
              handleImmediateChange("searchTerm", e.target.value)
            }
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
          />
        </div>

        {/* Claim Type Filter */}
        <div>
          <select
            value={localFilters.claimType || ""}
            onChange={(e) => handleImmediateChange("claimType", e.target.value)}
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
              value={localFilters.urgency || ""}
              onChange={(e) => handleImmediateChange("urgency", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="">All Urgency</option>
              <option value="high">High Priority (7+ days)</option>
              <option value="medium">Medium Priority (3+ days)</option>
              <option value="normal">Normal (&lt; 3 days)</option>
            </select>
          </div>
        )}

        {/* Advanced Filters Toggle & Clear All */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center space-x-2 text-green-600 hover:text-green-700 dark:text-green-400 font-medium"
          >
            <Filter className="h-4 w-4" />
            <span>{showAdvanced ? "Less" : "More"} Filters</span>
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
        <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mt-4">
          {/* Advanced Filters Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {/* Date Range */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                <Calendar className="inline h-4 w-4 mr-2" />
                Date Range
              </label>
              <div className="space-y-3">
                <div>
                  <input
                    type="date"
                    value={localFilters.startDate || ""}
                    onChange={(e) =>
                      handleAdvancedChange("startDate", e.target.value)
                    }
                    min="2000-01-01"
                    max="2025-12-31"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
                  />
                  <span className="text-xs text-gray-500 dark:text-gray-400 mt-1 block">
                    From date (2000-2025)
                  </span>
                </div>
                <div>
                  <input
                    type="date"
                    value={localFilters.endDate || ""}
                    onChange={(e) =>
                      handleAdvancedChange("endDate", e.target.value)
                    }
                    min="2000-01-01"
                    max="2025-12-31"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
                  />
                  <span className="text-xs text-gray-500 dark:text-gray-400 mt-1 block">
                    To date (2000-2025)
                  </span>
                </div>
              </div>
            </div>

            {/* Employee Filter */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                <User className="inline h-4 w-4 mr-2" />
                Employee Search
              </label>
              <input
                type="text"
                placeholder="Search by ID or name..."
                value={localFilters.employeeId || ""}
                onChange={(e) =>
                  handleAdvancedChange("employeeId", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
              />
            </div>

            {/* HR-Specific Filters - Age of Claim */}
            {showHRActions && (
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  <Clock className="inline h-4 w-4 mr-2" />
                  Age of Claim
                </label>
                <select
                  value={localFilters.daysOld || ""}
                  onChange={(e) =>
                    handleAdvancedChange("daysOld", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="">Select time range</option>
                  <option value="today">Today only</option>
                  <option value="3">Last 3 days</option>
                </select>
                {localFilters.daysOld && (
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {localFilters.daysOld === "today" ? (
                      <span>Showing claims from today only</span>
                    ) : localFilters.daysOld === "3" ? (
                      <span>Showing claims from the last 3 days</span>
                    ) : null}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Second row of advanced filters - Only show if HR actions enabled */}
          {showHRActions && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Has Return Reason */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Return Status
                </label>
                <select
                  value={String(localFilters.hasReturnReason ?? "")}
                  onChange={(e) =>
                    handleAdvancedChange("hasReturnReason", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="">All Claims</option>
                  <option value="true">Has Return Reason</option>
                  <option value="false">No Return Reason</option>
                </select>
              </div>

              {/* Has HR Notes */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  HR Notes Status
                </label>
                <select
                  value={String(localFilters.hasHRNotes ?? "")}
                  onChange={(e) =>
                    handleAdvancedChange("hasHRNotes", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="">All Claims</option>
                  <option value="true">Has HR Notes</option>
                  <option value="false">No HR Notes</option>
                </select>
              </div>
            </div>
          )}

          {/* Apply Advanced Filters Section */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-4">
              <button
                onClick={applyAdvancedFilters}
                disabled={!hasAdvancedChanges || !validateDateRange()}
                className={`px-4 py-2 rounded-md transition-colors flex items-center space-x-2
                  ${
                    hasAdvancedChanges && validateDateRange()
                      ? "bg-green-600 hover:bg-green-700 text-white"
                      : "bg-gray-200 dark:bg-gray-700 text-gray-500 cursor-not-allowed"
                  }`}
              >
                <Filter className="h-4 w-4" />
                <span>Apply Filters</span>
                {hasAdvancedChanges && (
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                  </span>
                )}
              </button>
              <button
                onClick={handleReset}
                disabled={!hasAdvancedChanges}
                className={`text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 ${
                  !hasAdvancedChanges ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                Reset Changes
              </button>
            </div>

            {hasAdvancedChanges && (
              <span className="text-sm text-orange-600 dark:text-orange-400">
                You have unsaved filter changes
              </span>
            )}
          </div>

          {/* Date validation error */}
          {!validateDateRange() && (
            <div className="mt-2 text-sm text-red-600 dark:text-red-400">
              End date must be after start date
            </div>
          )}
        </div>
      )}

      {/* Active Filters Display */}
      {hasActiveFilters() && (
        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Active Filters:
            </span>

            {localFilters.claimStatus && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                Status:{" "}
                {localFilters.claimStatus === "hr"
                  ? "Pending HR"
                  : localFilters.claimStatus === "insurer"
                  ? "With Insurer"
                  : localFilters.claimStatus === "employee"
                  ? "With Employee"
                  : localFilters.claimStatus}
                <button
                  onClick={() => handleImmediateChange("claimStatus", "")}
                  className="ml-2 text-blue-600 hover:text-blue-800 dark:text-blue-400"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}

            {localFilters.claimType && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                Type:{" "}
                {localFilters.claimType === "life"
                  ? "Life Insurance"
                  : "Vehicle Insurance"}
                <button
                  onClick={() => handleImmediateChange("claimType", "")}
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
                  onClick={() => handleImmediateChange("searchTerm", "")}
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
                  onClick={() => handleImmediateChange("urgency", "")}
                  className="ml-2 text-yellow-600 hover:text-yellow-800 dark:text-yellow-400"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}

            {localFilters.daysOld && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
                Age:{" "}
                {localFilters.daysOld === "today"
                  ? "Today"
                  : localFilters.daysOld === "yesterday"
                  ? "Yesterday"
                  : localFilters.daysOld === "older"
                  ? "30+ days"
                  : `${localFilters.daysOld} days`}
                <button
                  onClick={() => {
                    const newFilters = { ...localFilters, daysOld: "" };
                    setLocalFilters(newFilters);
                    onFilterChange(newFilters);
                  }}
                  className="ml-2 text-orange-600 hover:text-orange-800 dark:text-orange-400"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}

            {typeof localFilters.hasReturnReason === "boolean" && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                Return:{" "}
                {localFilters.hasReturnReason ? "Has Reason" : "No Reason"}
                <button
                  onClick={() => {
                    const newFilters = { ...localFilters, hasReturnReason: "" };
                    setLocalFilters(newFilters);
                    onFilterChange(newFilters);
                  }}
                  className="ml-2 text-red-600 hover:text-red-800 dark:text-red-400"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}

            {typeof localFilters.hasHRNotes === "boolean" && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200">
                HR Notes: {localFilters.hasHRNotes ? "Has Notes" : "No Notes"}
                <button
                  onClick={() => {
                    const newFilters = { ...localFilters, hasHRNotes: "" };
                    setLocalFilters(newFilters);
                    onFilterChange(newFilters);
                  }}
                  className="ml-2 text-indigo-600 hover:text-indigo-800 dark:text-indigo-400"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}

            {(localFilters.startDate || localFilters.endDate) && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200">
                Date: {localFilters.startDate || "Start"} to{" "}
                {localFilters.endDate || "End"}
                <button
                  onClick={() => {
                    const newFilters = {
                      ...localFilters,
                      startDate: "",
                      endDate: "",
                    };
                    setLocalFilters(newFilters);
                    onFilterChange(newFilters);
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
                    const newFilters = { ...localFilters, employeeId: "" };
                    setLocalFilters(newFilters);
                    onFilterChange(newFilters);
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
                  ? `Filtering claims with ${
                      Object.values(localFilters).filter((v) => v && v !== "")
                        .length
                    } active filter(s)`
                  : "Showing all claims"}
                {hasPendingChanges() && (
                  <span className="ml-2 text-orange-600 dark:text-orange-400">
                    • Unsaved changes - click Apply Filters
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
