/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import {
  X,
  Eye,
  Calendar,
  DollarSign,
  Shield,
  Users,
  FileText,
  User,
  Mail,
  Phone,
  Building,
  Clock,
  CheckCircle,
  AlertCircle,
  Info,
  CreditCard,
  Tag,
  AlertTriangle,
} from "lucide-react";

export const PolicyDetailsModal = ({
  isOpen,
  onClose,
  policy,
  loading = false,
}) => {
  // Debug logging
  useEffect(() => {
    if (isOpen) {
      console.log("PolicyDetailsModal opened with data:", {
        policy,
        loading,
        policyKeys: policy ? Object.keys(policy) : "No policy object",
        rawPolicy: policy,
      });
    }
  }, [isOpen, policy, loading]);

  if (!isOpen) return null;

  // Show loading state
  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <Eye className="h-6 w-6 text-blue-600" />
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Loading Policy Details...
                </h2>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>
          <div className="flex-1 p-6">
            <div className="animate-pulse space-y-6">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="h-20 bg-gray-300 dark:bg-gray-600 rounded"
                ></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Extract policy data from different possible structures
  let actualPolicy = null;

  if (policy) {
    // Handle different response structures
    if (policy.policy) {
      actualPolicy = policy.policy; // { success: true, policy: {...} }
    } else if (policy.data) {
      actualPolicy = policy.data; // { data: {...} }
    } else if (policy._id || policy.id || policy.policyId) {
      actualPolicy = policy; // Direct policy object
    }
  }

  // Show error state if no policy data
  if (!actualPolicy) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-2xl">
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-6 w-6 text-red-600" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Error Loading Policy
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>
          <div className="p-6">
            <div className="text-center">
              <AlertTriangle className="h-12 w-12 text-red-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Policy data not available
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                The policy information could not be loaded. Please try again.
              </p>
              <div className="bg-gray-100 dark:bg-gray-700 rounded p-3 mb-4">
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Debug info:
                </p>
                <pre className="text-xs text-gray-800 dark:text-gray-200 mt-1 overflow-auto">
                  {JSON.stringify(policy, null, 2)}
                </pre>
              </div>
              <button
                onClick={onClose}
                className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Helper functions with better error handling
  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined || amount === "") return "N/A";
    const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;
    if (isNaN(numAmount)) return "N/A";

    return new Intl.NumberFormat("en-LK", {
      style: "currency",
      currency: "LKR",
    }).format(numAmount);
  };

  const formatDate = (date) => {
    if (!date) return "N/A";
    try {
      const parsedDate = typeof date === "string" ? new Date(date) : date;
      if (isNaN(parsedDate.getTime())) return "Invalid Date";

      return parsedDate.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch (error) {
      console.error("Date formatting error:", error);
      return "Invalid Date";
    }
  };

  // Safe property access with fallbacks
  const safeGet = (obj, path, fallback = "N/A") => {
    if (!obj) return fallback;
    try {
      const value = path
        .split(".")
        .reduce((current, key) => current?.[key], obj);
      return value !== null && value !== undefined ? value : fallback;
    } catch {
      return fallback;
    }
  };

  // Get status display with safe access
  const getStatusDisplay = (status) => {
    const statusConfig = {
      active: {
        color:
          "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800",
        icon: CheckCircle,
        label: "Active",
      },
      expired: {
        color:
          "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800",
        icon: AlertCircle,
        label: "Expired",
      },
      cancelled: {
        color:
          "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/20 dark:text-gray-300 dark:border-gray-800",
        icon: X,
        label: "Cancelled",
      },
      suspended: {
        color:
          "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-800",
        icon: AlertCircle,
        label: "Suspended",
      },
      pending: {
        color:
          "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800",
        icon: Clock,
        label: "Pending",
      },
    };

    return (
      statusConfig[status] || {
        color:
          "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/20 dark:text-gray-300 dark:border-gray-800",
        icon: AlertCircle,
        label: status
          ? status.charAt(0).toUpperCase() + status.slice(1)
          : "Unknown",
      }
    );
  };

  // Get policy type display
  const getPolicyTypeDisplay = (type) => {
    const typeConfig = {
      life: {
        label: "Life Insurance",
        color:
          "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800",
        icon: Shield,
      },
      vehicle: {
        label: "Vehicle Insurance",
        color:
          "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-800",
        icon: Shield,
      },
    };

    return (
      typeConfig[type] || {
        label: type ? type.charAt(0).toUpperCase() + type.slice(1) : "Unknown",
        color:
          "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-900/20 dark:text-gray-300 dark:border-gray-800",
        icon: Shield,
      }
    );
  };

  // Extract data with safe access
  const policyId =
    safeGet(actualPolicy, "policyId") ||
    safeGet(actualPolicy, "policyNumber") ||
    safeGet(actualPolicy, "_id");
  const statusDisplay = getStatusDisplay(safeGet(actualPolicy, "status"));
  const StatusIcon = statusDisplay.icon;
  const policyTypeDisplay = getPolicyTypeDisplay(
    safeGet(actualPolicy, "policyType")
  );
  const PolicyTypeIcon = policyTypeDisplay.icon;

  // Calculate days until expiry safely
  const getDaysUntilExpiry = () => {
    const endDate = safeGet(actualPolicy, "validity.endDate");
    if (!endDate || endDate === "N/A") return null;

    try {
      const expiryDate = new Date(endDate);
      const today = new Date();
      if (isNaN(expiryDate.getTime())) return null;

      const diffTime = expiryDate - today;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays;
    } catch {
      return null;
    }
  };

  const daysUntilExpiry = getDaysUntilExpiry();

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-6xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <Eye className="h-6 w-6 text-blue-600" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Policy Details
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {policyId}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">
            {/* Policy Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Status Card */}
              <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-700 dark:to-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-600">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Status
                  </h3>
                  <StatusIcon className="h-5 w-5 text-gray-400" />
                </div>
                <div
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${statusDisplay.color}`}
                >
                  <StatusIcon className="h-4 w-4 mr-1" />
                  {statusDisplay.label}
                </div>
                {daysUntilExpiry !== null && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    {daysUntilExpiry > 0
                      ? `Expires in ${daysUntilExpiry} days`
                      : daysUntilExpiry === 0
                      ? "Expires today"
                      : `Expired ${Math.abs(daysUntilExpiry)} days ago`}
                  </p>
                )}
              </div>

              {/* Policy Type Card */}
              <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-700 dark:to-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-600">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Policy Type
                  </h3>
                  <PolicyTypeIcon className="h-5 w-5 text-gray-400" />
                </div>
                <div
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${policyTypeDisplay.color}`}
                >
                  <PolicyTypeIcon className="h-4 w-4 mr-1" />
                  {policyTypeDisplay.label}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 capitalize">
                  {safeGet(actualPolicy, "policyCategory")} policy
                </p>
              </div>

              {/* Coverage Card */}
              <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-700 dark:to-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-600">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Coverage
                  </h3>
                  <DollarSign className="h-5 w-5 text-gray-400" />
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatCurrency(
                    safeGet(actualPolicy, "coverage.coverageAmount", 0)
                  )}
                </div>
                {safeGet(actualPolicy, "coverage.deductible", 0) > 0 && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Deductible:{" "}
                    {formatCurrency(
                      safeGet(actualPolicy, "coverage.deductible")
                    )}
                  </p>
                )}
              </div>
            </div>

            {/* Basic Information */}
            <div className="bg-white dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-600">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <Info className="h-5 w-5 text-blue-600" />
                  Basic Information
                </h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                      Policy ID
                    </label>
                    <p className="text-sm font-mono bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                      {policyId}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                      Start Date
                    </label>
                    <p className="text-sm text-gray-900 dark:text-white">
                      {formatDate(safeGet(actualPolicy, "validity.startDate"))}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                      End Date
                    </label>
                    <p className="text-sm text-gray-900 dark:text-white">
                      {formatDate(safeGet(actualPolicy, "validity.endDate"))}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                      Premium Amount
                    </label>
                    <p className="text-sm text-gray-900 dark:text-white">
                      {formatCurrency(
                        safeGet(actualPolicy, "premium.amount", 0)
                      )}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                      Premium Frequency
                    </label>
                    <p className="text-sm text-gray-900 dark:text-white capitalize">
                      {safeGet(actualPolicy, "premium.frequency")}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                      Created On
                    </label>
                    <p className="text-sm text-gray-900 dark:text-white">
                      {formatDate(safeGet(actualPolicy, "createdAt"))}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Insurance Agent */}
            {safeGet(actualPolicy, "insuranceAgent") &&
              ((safeGet(actualPolicy, "insuranceAgent.firstName") &&
                safeGet(actualPolicy, "insuranceAgent.firstName") !== "N/A") ||
                (safeGet(actualPolicy, "insuranceAgent.email") &&
                  safeGet(actualPolicy, "insuranceAgent.email") !== "N/A")) && (
                <div className="bg-white dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600">
                  <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-600">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                      <User className="h-5 w-5 text-blue-600" />
                      Insurance Agent
                    </h3>
                  </div>
                  <div className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                        <User className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 dark:text-white">
                          {[
                            safeGet(
                              actualPolicy,
                              "insuranceAgent.profile.firstName"
                            ),
                            safeGet(actualPolicy, "insuranceAgent.firstName"),
                          ].find((v) => v && v !== "N/A") || ""}{" "}
                          {[
                            safeGet(
                              actualPolicy,
                              "insuranceAgent.profile.lastName"
                            ),
                            safeGet(actualPolicy, "insuranceAgent.lastName"),
                          ].find((v) => v && v !== "N/A") || ""}
                        </h4>

                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
                          {safeGet(actualPolicy, "insuranceAgent.email") &&
                            safeGet(actualPolicy, "insuranceAgent.email") !==
                              "N/A" && (
                              <div className="flex items-center gap-1">
                                <Mail className="h-4 w-4" />
                                {safeGet(actualPolicy, "insuranceAgent.email")}
                              </div>
                            )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

            {/* Beneficiaries */}
            {safeGet(actualPolicy, "beneficiaries")?.length > 0 && (
              <div className="bg-white dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-600">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <Users className="h-5 w-5 text-purple-600" />
                    Beneficiaries
                  </h3>
                </div>
                <div className="p-6 space-y-4">
                  {safeGet(actualPolicy, "beneficiaries").map((b, idx) => (
                    <div key={idx} className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
                        <User className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 dark:text-white">
                          {(b.firstName ?? "") + " " + (b.lastName ?? "")}
                        </h4>
                        {b.email && b.email !== "N/A" && (
                          <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 mt-1">
                            <Mail className="h-4 w-4" />
                            {b.email}
                          </div>
                        )}
                        {b.employeeId && (
                          <p className="text-xs text-gray-400 mt-1">
                            Employee ID: {b.employeeId} –{" "}
                            {b.department || "No Department"}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Notes */}
            {safeGet(actualPolicy, "notes") &&
              safeGet(actualPolicy, "notes") !== "N/A" && (
                <div className="bg-white dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600">
                  <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-600">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                      <FileText className="h-5 w-5 text-blue-600" />
                      Notes
                    </h3>
                  </div>
                  <div className="p-6">
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                      <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                        {safeGet(actualPolicy, "notes")}
                      </p>
                    </div>
                  </div>
                </div>
              )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
