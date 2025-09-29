/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import {
  Search,
  Filter,
  X,
  Calendar,
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

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  // Immediate filter change
  const handleImmediateChange = (field, value) => {
    const updatedFilters = { ...localFilters, [field]: value };
    setLocalFilters(updatedFilters);
    onFilterChange(updatedFilters);
  };

  // Advanced filter changes
  const handleAdvancedChange = (field, value) => {
    let updatedFilters = { ...localFilters };

    if (field === "daysOld") {
      const today = new Date();

      if (value === "") {
        updatedFilters = { ...updatedFilters, daysOld: "", startDate: "", endDate: "" };
      } else {
        const endOfToday = new Date(today);
        endOfToday.setHours(23, 59, 59, 999);

        if (value === "today") {
          const startOfToday = new Date(today);
          startOfToday.setHours(0, 0, 0, 0);
          updatedFilters = {
            ...updatedFilters,
            daysOld: value,
            startDate: startOfToday.toISOString(),
            endDate: endOfToday.toISOString(),
          };
        } else if (value === "3") {
          const threeDaysAgo = new Date(today);
          threeDaysAgo.setDate(today.getDate() - 3);
          threeDaysAgo.setHours(0, 0, 0, 0);
          updatedFilters = {
            ...updatedFilters,
            daysOld: value,
            startDate: threeDaysAgo.toISOString(),
            endDate: endOfToday.toISOString(),
          };
        }
      }
    } else if (field === "hasHRNotes" || field === "hasReturnReason") {
      updatedFilters[field] = value === "" ? "" : value === "true";
    } else {
      updatedFilters[field] = value;
    }

    setLocalFilters(updatedFilters);
  };

  const applyAdvancedFilters = () => {
    const filtersToApply = { ...localFilters };

    // Ensure proper start/end dates
    if (filtersToApply.startDate && !filtersToApply.daysOld) {
      const startDate = new Date(filtersToApply.startDate);
      startDate.setHours(0, 0, 0, 0);
      filtersToApply.startDate = startDate.toISOString();
    }

    if (filtersToApply.endDate && !filtersToApply.daysOld) {
      const endDate = new Date(filtersToApply.endDate);
      endDate.setHours(23, 59, 59, 999);
      filtersToApply.endDate = endDate.toISOString();
    }

    // Clean up empty values
    Object.keys(filtersToApply).forEach((key) => {
      if (!filtersToApply[key] && filtersToApply[key] !== false) {
        delete filtersToApply[key];
      }
    });

    onFilterChange(filtersToApply);
  };

  const validateDateRange = () => {
    if (localFilters.startDate && localFilters.endDate) {
      return new Date(localFilters.startDate) <= new Date(localFilters.endDate);
    }
    return true;
  };

  const handleClearFilters = () => {
    const cleared = {
      claimStatus: "",
      claimType: "",
      startDate: "",
      endDate: "",
      searchTerm: "",
      hrAction: "",
      urgency: "",
      hasReturnReason: "",
      hasHRNotes: "",
      daysOld: "",
    };
    setLocalFilters(cleared);
    onFilterChange(cleared);
  };

  const hasActiveFilters = () =>
    Object.entries(localFilters).some(([key, value]) => value !== "" && value !== null && value !== undefined);

  const hasPendingChanges = () => JSON.stringify(localFilters) !== JSON.stringify(filters);

  const handleReset = () => {
    const defaults = {
      claimStatus: "",
      claimType: "",
      startDate: "",
      endDate: "",
      searchTerm: "",
      hrAction: "",
      urgency: "",
      hasReturnReason: "",
      hasHRNotes: "",
      daysOld: "",
    };
    setLocalFilters(defaults);
    onFilterChange(defaults);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      {/* Quick HR Filters */}
      {showHRActions && (
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Quick Status Filters
          </h4>
          <div className="flex flex-wrap gap-2">
            {[
              { key: "", label: "All Claims", color: "gray" },
              { key: "hr", label: "Pending HR Review", color: "yellow", icon: <Clock className="h-3 w-3" /> },
              { key: "insurer", label: "With Insurer", color: "blue", icon: <Send className="h-3 w-3" /> },
              { key: "employee", label: "Returned to Employee", color: "orange", icon: <ArrowLeft className="h-3 w-3" /> },
            ].map(({ key, label, color, icon }) => (
              <button
                key={key}
                onClick={() => handleImmediateChange("claimStatus", key)}
                className={`inline-flex items-center gap-1 px-3 py-1.5 text-sm rounded-full border transition-colors
                  ${
                    localFilters.claimStatus === key
                      ? `bg-${color}-600 text-white border-${color}-600`
                      : `bg-${color}-100 text-${color}-700 border-${color}-300 hover:bg-${color}-200
                         dark:bg-${color}-900/20 dark:text-${color}-300 dark:border-${color}-700`
                  }`}
              >
                {icon}
                <span>{label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Basic Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 items-end">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search claims..."
            value={localFilters.searchTerm || ""}
            onChange={(e) => handleImmediateChange("searchTerm", e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-md focus:ring-2 focus:ring-green-500 
                       border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          />
        </div>

        {/* Claim Type */}
        <div className="flex flex-col">
          <label className="text-sm text-gray-600 dark:text-gray-400 mb-1">Claim Type</label>
          <select
            value={localFilters.claimType || ""}
            onChange={(e) => handleImmediateChange("claimType", e.target.value)}
            className="px-3 py-2 border rounded-md focus:ring-2 focus:ring-green-500 
                       border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          >
            <option value="">All Types</option>
            <option value="life">Life Insurance</option>
            <option value="vehicle">Vehicle Insurance</option>
          </select>
        </div>

        {/* Urgency (HR only) */}
        {showHRActions && (
          <div className="flex flex-col">
            <label className="text-sm text-gray-600 dark:text-gray-400 mb-1">Urgency</label>
            <select
              value={localFilters.urgency || ""}
              onChange={(e) => handleImmediateChange("urgency", e.target.value)}
              className="px-3 py-2 border rounded-md focus:ring-2 focus:ring-green-500 
                         border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            >
              <option value="">All</option>
              <option value="high">High (7+ days)</option>
              <option value="medium">Medium (3+ days)</option>
              <option value="normal">Normal (&lt; 3 days)</option>
            </select>
          </div>
        )}

        {/* Toggle + Clear */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-2 text-green-600 hover:text-green-700 dark:text-green-400 font-medium"
          >
            <Filter className="h-4 w-4" />
            <span>{showAdvanced ? "Less" : "More"} Filters</span>
          </button>

          {hasActiveFilters() && (
            <button
              onClick={handleClearFilters}
              className="flex items-center gap-1 text-gray-600 hover:text-gray-700 dark:text-gray-400 text-sm"
            >
              <X className="h-4 w-4" />
              <span>Clear</span>
            </button>
          )}
        </div>
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mt-4">
          {/* Grid of Advanced Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {/* Date Range */}
            <div className="flex flex-col gap-3">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <Calendar className="h-4 w-4" /> Date Range
              </label>
              <input
                type="date"
                value={localFilters.startDate ? localFilters.startDate.split("T")[0] : ""}
                onChange={(e) => handleAdvancedChange("startDate", e.target.value)}
                min="2000-01-01"
                max="2025-12-31"
                className="px-3 py-2 border rounded-md focus:ring-2 focus:ring-green-500 
                           border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
              <input
                type="date"
                value={localFilters.endDate ? localFilters.endDate.split("T")[0] : ""}
                onChange={(e) => handleAdvancedChange("endDate", e.target.value)}
                min="2000-01-01"
                max="2025-12-31"
                className="px-3 py-2 border rounded-md focus:ring-2 focus:ring-green-500 
                           border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>

            {/* Age of Claim (HR only) */}
            {showHRActions && (
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <Clock className="h-4 w-4" /> Age of Claim
                </label>
                <select
                  value={localFilters.daysOld || ""}
                  onChange={(e) => handleAdvancedChange("daysOld", e.target.value)}
                  className="px-3 py-2 border rounded-md focus:ring-2 focus:ring-green-500 
                             border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                >
                  <option value="">Select time range</option>
                  <option value="today">Today</option>
                  <option value="3">Last 3 days</option>
                </select>
              </div>
            )}
          </div>

          {/* HR-specific extra filters */}
          {showHRActions && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Return Reason */}
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Return Status
                </label>
                <select
                  value={
                    localFilters.hasReturnReason === true
                      ? "true"
                      : localFilters.hasReturnReason === false
                      ? "false"
                      : ""
                  }
                  onChange={(e) => handleAdvancedChange("hasReturnReason", e.target.value)}
                  className="px-3 py-2 border rounded-md focus:ring-2 focus:ring-green-500 
                             border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                >
                  <option value="">All</option>
                  <option value="true">Has Return Reason</option>
                  <option value="false">No Return Reason</option>
                </select>
              </div>

              {/* HR Notes */}
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  HR Notes Status
                </label>
                <select
                  value={
                    localFilters.hasHRNotes === true
                      ? "true"
                      : localFilters.hasHRNotes === false
                      ? "false"
                      : ""
                  }
                  onChange={(e) => handleAdvancedChange("hasHRNotes", e.target.value)}
                  className="px-3 py-2 border rounded-md focus:ring-2 focus:ring-green-500 
                             border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                >
                  <option value="">All</option>
                  <option value="true">Has HR Notes</option>
                  <option value="false">No HR Notes</option>
                </select>
              </div>
            </div>
          )}

          {/* Apply + Reset */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-4">
              <button
                onClick={applyAdvancedFilters}
                disabled={!validateDateRange()}
                className={`px-4 py-2 rounded-md flex items-center gap-2 transition-colors ${
                  validateDateRange()
                    ? "bg-green-600 hover:bg-green-700 text-white"
                    : "bg-gray-200 dark:bg-gray-700 text-gray-500 cursor-not-allowed"
                }`}
              >
                <Filter className="h-4 w-4" />
                <span>Apply</span>
              </button>
              <button
                onClick={handleReset}
                className="text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
              >
                Reset
              </button>
            </div>

            {hasPendingChanges() && (
              <span className="text-sm text-orange-600 dark:text-orange-400">
                You have unsaved filter changes
              </span>
            )}
          </div>

          {!validateDateRange() && (
            <div className="mt-2 text-sm text-red-600 dark:text-red-400">
              End date must be after start date
            </div>
          )}
        </div>
      )}
    </div>
  );
};
