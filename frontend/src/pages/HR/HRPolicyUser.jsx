/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useCallback } from "react";
import {
  Search,
  Filter,
  Grid,
  List,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  MoreVertical,
  Eye,
  UserPlus,
  UserMinus,
  AlertTriangle,
  Shield,
  Users,
  User,
  Phone,
  Mail,
  X,
  ChevronDown,
  Heart,
  Car,
  FileBarChart,
  CheckCircle2,
  Clock,
  Download
} from "lucide-react";

import insuranceApiService from "../../services/insurance-api";
import reportsApiService from "../../services/reports-api";
import { PolicyUsersList } from "../../components/policy/PolicyUsersList";
import { BeneficiaryManagementModal } from "../../components/policy/BeneficiaryManagementModal";
import { PolicyDetailsModal } from "../../components/policy/PolicyDetailsModal";

// Format currency
const formatCurrency = (amount) => {
  if (!amount && amount !== 0) return "N/A";
  return new Intl.NumberFormat("en-LK", {
    style: "currency",
    currency: "LKR",
  }).format(amount);
};

// Format date
const formatDate = (date) => {
  if (!date) return "N/A";
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

// Format expiry status
const formatExpiryStatus = (endDate) => {
  if (!endDate) return { text: "N/A", color: "text-gray-500" };

  const today = new Date();
  const expiry = new Date(endDate);
  const diffTime = expiry.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0)
    return {
      text: `Expired ${Math.abs(diffDays)} days ago`,
      color: "text-red-600",
    };
  if (diffDays <= 30)
    return { text: `Expires in ${diffDays} days`, color: "text-yellow-600" };
  return { text: `Expires in ${diffDays} days`, color: "text-green-600" };
};

// Notification Component
const Notification = ({ message, type = "success", onClose }) => {
  const getNotificationStyles = () => {
    switch (type) {
      case "success":
        return {
          bg: "bg-green-100 dark:bg-green-900/20",
          border: "border-green-200 dark:border-green-800",
          text: "text-green-800 dark:text-green-200",
        };
      case "error":
        return {
          bg: "bg-red-100 dark:bg-red-900/20",
          border: "border-red-200 dark:border-red-800",
          text: "text-red-800 dark:text-red-200",
        };
      default:
        return {
          bg: "bg-blue-100 dark:bg-blue-900/20",
          border: "border-blue-200 dark:border-blue-800",
          text: "text-blue-800 dark:text-blue-200",
        };
    }
  };

  const styles = getNotificationStyles();

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm w-full">
      <div
        className={`${styles.bg} ${styles.border} border rounded-lg shadow-lg p-4`}
      >
        <div className="flex items-start space-x-3">
          <div className="flex-1 min-w-0">
            <p className={`text-sm font-medium ${styles.text}`}>{message}</p>
          </div>
          <button onClick={onClose} className="flex-shrink-0">
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

// PolicyStats Component
const PolicyStats = ({ stats, loading, policies }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, index) => (
          <div
            key={index}
            className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border"
          >
            <div className="animate-pulse">
              <div className="w-8 h-8 bg-gray-300 rounded mb-3"></div>
              <div className="h-4 bg-gray-300 rounded mb-2"></div>
              <div className="h-6 bg-gray-300 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  const calculateStatsFromPolicies = () => {
    if (!policies || !Array.isArray(policies)) {
      return {
        totalCount: 0,
        activeCount: 0,
        lifeCount: 0,
        vehicleCount: 0,
      };
    }

    return {
      totalCount: policies.length,
      activeCount: policies.filter((p) => p.status === "active").length,
      lifeCount: policies.filter((p) => p.policyType === "life").length,
      vehicleCount: policies.filter((p) => p.policyType === "vehicle").length,
    };
  };

  const calculatedStats = calculateStatsFromPolicies();

  // Use stats from API if available, otherwise fall back to calculated stats
  const totalPolicies =
    stats?.totalCount || stats?.totalPolicies || calculatedStats.totalCount;
  const activePolicies =
    stats?.byStatus?.find((s) => s._id === "active")?.count ||
    stats?.activePolicies ||
    calculatedStats.activeCount;
  const lifePolicies =
    stats?.byType?.find((s) => s._id === "life")?.count ||
    stats?.typeStats?.find((s) => s._id === "life")?.count ||
    calculatedStats.lifeCount;
  const vehiclePolicies =
    stats?.byType?.find((s) => s._id === "vehicle")?.count ||
    stats?.typeStats?.find((s) => s._id === "vehicle")?.count ||
    calculatedStats.vehicleCount;

  const statCards = [
    {
      title: "Total Policies",
      value: totalPolicies,
      icon: Shield,
      bgColor: "bg-blue-50",
      iconColor: "text-blue-600",
      textColor: "text-blue-700",
      borderColor: "border-l-4 border-blue-500",
    },
    {
      title: "Active Policies",
      value: activePolicies,
      icon: CheckCircle2,
      bgColor: "bg-green-50",
      iconColor: "text-green-600",
      textColor: "text-green-700",
      borderColor: "border-l-4 border-green-500",
    },
    {
      title: "Life Policies",
      value: lifePolicies,
      icon: Heart,
      bgColor: "bg-red-50",
      iconColor: "text-red-600",
      textColor: "text-red-700",
      borderColor: "border-l-4 border-red-500",
    },
    {
      title: "Vehicle Policies",
      value: vehiclePolicies,
      icon: Car,
      bgColor: "bg-purple-50",
      iconColor: "text-purple-600",
      textColor: "text-purple-700",
      borderColor: "border-l-4 border-purple-500",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {statCards.map((stat) => {
        const IconComponent = stat.icon;
        return (
          <div
            key={stat.title}
            className={`bg-white ${stat.bgColor} p-6 rounded-lg shadow-sm border ${stat.borderColor}`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">
                  {stat.title}
                </p>
                <p className={`text-3xl font-bold ${stat.textColor}`}>
                  {stat.value || 0}
                </p>
              </div>
              <div className={`p-3 rounded-lg ${stat.bgColor.replace("50", "100")}`}>
                <IconComponent className={`h-8 w-8 ${stat.iconColor}`} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

// Reports Panel Component
const ReportsPanel = ({ filters, onClose, showNotification, policies }) => {
  const [reportLoading, setReportLoading] = useState(null);
  const [selectedPolicy, setSelectedPolicy] = useState("");
  const [dateRange, setDateRange] = useState({
    startDate: "",
    endDate: "",
  });

  // Debug log to check if policies are being passed
  console.log('ReportsPanel - Policies received:', policies);

  // Debug: Log policies data
  console.log('ReportsPanel - Policies data:', policies);
  console.log('ReportsPanel - Policies length:', policies?.length || 0);

  const reportTypes = [
    {
      id: "policies",
      title: "Policies Report",
      description:
        "Comprehensive report of all policies with details, coverage, premiums, beneficiaries, and status information",
      icon: Shield,
      color: "blue",
      needsDateFilter: true,
      needsPolicySelector: false,
    },
    {
      id: "policy-users",
      title: "Policy Beneficiaries Report",
      description:
        "Report listing all beneficiaries for a specific policy",
      icon: Users,
      color: "green",
      needsDateFilter: false,
      needsPolicySelector: true,
    },
  ];

  const handleGenerateReport = async (reportType) => {
    try {
      setReportLoading(reportType);
      let blob;

      if (reportType === "policies") {
        // ✅ FIXED: Map startDate/endDate to dateFrom/dateTo for backend
        const reportFilters = {
          ...(filters.policyType && { policyType: filters.policyType }),
          ...(filters.policyCategory && { policyCategory: filters.policyCategory }),
          ...(filters.status && { status: filters.status }),
          // ✅ Map to backend expected field names
          ...(dateRange.startDate && { dateFrom: dateRange.startDate }),
          ...(dateRange.endDate && { dateTo: dateRange.endDate }),
        };

        console.log('Generating policies report with filters:', reportFilters);

        // Generate policies report
        blob = await reportsApiService.generatePoliciesReport(reportFilters);
      } else if (reportType === "policy-users") {
        if (!selectedPolicy) {
          showNotification("Please select a policy for the Policy Beneficiaries report", "error");
          return;
        }

        console.log('Generating policy users report for policy:', selectedPolicy);

        // Generate policy users report
        blob = await reportsApiService.generatePolicyUsersReport(selectedPolicy);
      }

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${reportType}-report-${
        new Date().toISOString().split("T")[0]
      }.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      showNotification(
        `${
          reportType.charAt(0).toUpperCase() + reportType.slice(1)
        } report generated successfully`
      );
    } catch (error) {
      console.error(`Error generating ${reportType} report:`, error);
      showNotification(
        `Failed to generate ${reportType} report: ${error.message}`,
        "error"
      );
    } finally {
      setReportLoading(null);
    }
  };

   const getColorClasses = (color) => {
    const colors = {
      blue: {
        bg: "bg-blue-50 dark:bg-blue-900/20",
        border: "border-blue-200 dark:border-blue-800",
        icon: "text-blue-600 dark:text-blue-400",
        button: "bg-blue-600 hover:bg-blue-700 text-white",
      },
      green: {
        bg: "bg-green-50 dark:bg-green-900/20",
        border: "border-green-200 dark:border-green-800",
        icon: "text-green-600 dark:text-green-400",
        button: "bg-green-600 hover:bg-green-700 text-white",
      },
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 mb-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <FileBarChart className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Generate Reports
          </h3>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        )}
      </div>

      {/* Report Types Grid with Inline Filters */}
      <div className="grid grid-cols-1 gap-6">
        {reportTypes.map((report) => {
          const IconComponent = report.icon;
          const colors = getColorClasses(report.color);
          const isLoading = reportLoading === report.id;

          return (
            <div
              key={report.id}
              className={`${colors.bg} border ${colors.border} rounded-lg p-6 transition-all hover:shadow-md`}
            >
              <div className="space-y-4">
                {/* Report Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div
                      className={`p-3 rounded-lg ${colors.bg
                        .replace("50", "100")
                        .replace("900/20", "800/30")}`}
                    >
                      <IconComponent className={`h-8 w-8 ${colors.icon}`} />
                    </div>
                    <div>
                      <h4 className="text-xl font-semibold text-gray-900 dark:text-white">
                        {report.title}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {report.description}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {report.needsDateFilter && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                            Date Filter Available
                          </span>
                        )}
                        {report.needsPolicySelector && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                            Requires Policy Selection
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Conditional Filters for Each Report Type */}
                {report.needsDateFilter && (
                  <div className="bg-white dark:bg-gray-700 rounded-lg p-4 border border-blue-200 dark:border-blue-700">
                    <div className="mb-3">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Date Range (Optional)
                      </label>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Start Date
                        </label>
                        <input
                          type="date"
                          value={dateRange.startDate}
                          max={new Date().toISOString().split("T")[0]} 
                          onChange={(e) =>
                            setDateRange((prev) => ({
                              ...prev,
                              startDate: e.target.value,
                            }))
                          }
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          End Date
                        </label>
                        <input
                          type="date"
                          value={dateRange.endDate}
                          max={new Date().toISOString().split("T")[0]} 
                          onChange={(e) =>
                            setDateRange((prev) => ({ ...prev, endDate: e.target.value }))
                          }
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                    <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
                      Filter policies by creation date within the specified range.
                    </p>
                  </div>
                )}

                {report.needsPolicySelector && (
                  <div className="bg-white dark:bg-gray-700 rounded-lg p-4 border border-green-200 dark:border-green-700">
                    <div className="mb-3">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Select Policy <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={selectedPolicy}
                        onChange={(e) => setSelectedPolicy(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      >
                        <option value="">Choose a policy...</option>
                        {policies && Array.isArray(policies) && policies.length > 0 ? (
                          policies.map((policy) => (
                            <option key={policy._id || policy.id} value={policy._id || policy.id}>
                              {policy.policyId} - {policy.policyType} ({policy.status})
                              {policy.employees && ` - ${policy.employees.length} users`}
                            </option>
                          ))
                        ) : (
                          <option value="" disabled>No policies available</option>
                        )}
                      </select>
                      
                      {/* Policy Information */}
                      <div className="mt-2 text-sm">
                        {!policies || !Array.isArray(policies) ? (
                          <p className="text-red-600 dark:text-red-400">
                            ⚠️ No policies found. Please ensure policies are loaded and you have the necessary permissions.
                          </p>
                        ) : policies.length === 0 ? (
                          <p className="text-amber-600 dark:text-amber-400">
                            📋 No policies available. Create policies first to generate user reports.
                          </p>
                        ) : (
                          <p className="text-green-600 dark:text-green-400">
                            ✅ {policies.length} policies available for selection.
                          </p>
                        )}
                      </div>
                      
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                        Select a policy to generate a detailed report of all beneficiaries associated with that policy.
                      </p>
                    </div>
                  </div>
                )}

                {/* Generate Button */}
                <div className="flex justify-end">
                  <button
                    onClick={() => handleGenerateReport(report.id)}
                    disabled={isLoading || (report.needsPolicySelector && !selectedPolicy)}
                    className={`flex items-center justify-center gap-2 px-6 py-3 ${colors.button} rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-w-[140px]`}
                  >
                    {isLoading ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Download className="h-4 w-4" />
                        Generate Report
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <p className="text-xs text-gray-600 dark:text-gray-400">
          <strong>Note:</strong> Policies Report includes all policies with optional date filtering. 
          Policy Beneficiaries Report generates a detailed list of all beneficiaries for a specific policy.
        </p>
      </div>
    </div>
  );
};

// Enhanced PolicyFilters Component
const PolicyFilters = ({ filters, updateFilter, clearFilters, onClose }) => {
  const policyTypeOptions = [
    { value: "", label: "All Policy Types" },
    { value: "life", label: "Life Insurance" },
    { value: "vehicle", label: "Vehicle Insurance" },
  ];

  const policyCategoryOptions = [
    { value: "", label: "All Categories" },
    { value: "individual", label: "Individual Policy" },
    { value: "group", label: "Group Policy" },
  ];

  const policyStatusOptions = [
    { value: "", label: "All Statuses" },
    { value: "active", label: "Active" },
    { value: "suspended", label: "Suspended" },
    { value: "cancelled", label: "Cancelled" },
    { value: "expired", label: "Expired" },
    { value: "pending", label: "Pending" },
  ];

  const hasActiveFilters = Object.values(filters).some((value) => value !== "");

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Policy Filters
          </h3>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        {/* Policy Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Policy Type
          </label>
          <select
            value={filters.policyType || ""}
            onChange={(e) => updateFilter("policyType", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {policyTypeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Policy Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Policy Category
          </label>
          <select
            value={filters.policyCategory || ""}
            onChange={(e) => updateFilter("policyCategory", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-green-500"
          >
            {policyCategoryOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Status
          </label>
          <select
            value={filters.status || ""}
            onChange={(e) => updateFilter("status", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
          >
            {policyStatusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Clear Filters */}
        <div className="flex items-end">
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="w-full px-4 py-2 text-sm font-medium text-red-700 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800 transition-colors"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// Interactive Policy Actions Component
const InteractivePolicyActions = ({
  policy,
  onViewPolicy,
  onAddBeneficiary,
  onRemoveBeneficiary,
}) => {
  const [showTooltip, setShowTooltip] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const actions = [
    {
      key: "view",
      label: "View Details",
      icon: Eye,
      onClick: () => onViewPolicy(policy),
      color: "text-blue-600 hover:text-blue-700",
      bgHover: "hover:bg-blue-50",
    },
    {
      key: "add-beneficiary",
      label: "Add Beneficiary",
      icon: UserPlus,
      onClick: () => onAddBeneficiary(policy._id || policy.id),
      color: "text-green-600 hover:text-green-700",
      bgHover: "hover:bg-green-50",
    },
    {
      key: "remove-beneficiary",
      label: "Remove Beneficiary",
      icon: UserMinus,
      onClick: () => onRemoveBeneficiary(policy._id || policy.id),
      color: "text-red-600 hover:text-red-700",
      bgHover: "hover:bg-red-50",
      disabled: !policy.beneficiaries || policy.beneficiaries.length === 0,
    },
  ];

  return (
    <div className="flex items-center justify-end gap-1">
      {actions.map((action) => {
        const IconComponent = action.icon;
        return (
          <div
            key={action.key}
            className="relative"
            onMouseEnter={() => setShowTooltip(action.key)}
            onMouseLeave={() => setShowTooltip("")}
          >
            <button
              onClick={action.onClick}
              disabled={action.disabled}
              className={`p-2 rounded-lg transition-all ${action.color} ${action.bgHover} disabled:opacity-50 disabled:cursor-not-allowed`}
              title={action.label}
            >
              <IconComponent className="h-4 w-4" />
            </button>

            {showTooltip === action.key && (
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-900 rounded shadow-lg whitespace-nowrap z-50">
                {action.label}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

// PolicyTable Component
const PolicyTable = ({
  policies,
  loading,
  onViewPolicy,
  onAddBeneficiary,
  onRemoveBeneficiary,
}) => {
  const getStatusColor = (status) => {
    const colors = {
      active: "bg-green-100 text-green-800",
      expired: "bg-red-100 text-red-800",
      cancelled: "bg-red-100 text-red-800",
      suspended: "bg-yellow-100 text-yellow-800",
      pending: "bg-blue-100 text-blue-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  if (loading) {
    return (
      <div className="bg-white shadow-sm rounded-lg border">
        <div className="p-6 animate-pulse space-y-4">
          {[...Array(5)].map((_, index) => (
            <div key={index} className="h-12 bg-gray-300 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!policies || policies.length === 0) {
    return (
      <div className="bg-white shadow-sm rounded-lg border p-12 text-center">
        <AlertTriangle className="h-12 w-12 text-gray-300 mx-auto mb-3" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No policies found
        </h3>
        <p className="text-gray-500">
          No policies match your current filter criteria.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-sm rounded-lg border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Policy Details
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Type & Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Coverage
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Premium
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Validity
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Beneficiaries
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {policies.map((policy) => {
              const expiryStatus = formatExpiryStatus(policy.validity?.endDate);

              return (
                <tr key={policy._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-medium text-gray-900">
                        {policy.policyNumber || policy.policyId}
                      </div>
                      <div className="text-sm text-gray-500 capitalize">
                        {policy.policyCategory} Policy
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <span className="inline-flex px-2 py-1 text-xs font-medium rounded-md bg-blue-100 text-blue-800">
                        {policy.policyType === "life" ? "Life" : "Vehicle"}
                      </span>
                      <br />
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-medium rounded-md ${getStatusColor(
                          policy.status
                        )}`}
                      >
                        {policy.status?.charAt(0).toUpperCase() +
                          policy.status?.slice(1) || "Unknown"}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-medium text-gray-900">
                        {formatCurrency(policy.coverage?.coverageAmount)}
                      </div>
                      <div className="text-sm text-gray-500">
                        Deductible: {formatCurrency(policy.coverage?.deductible)}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-medium text-gray-900">
                        {formatCurrency(policy.premium?.amount)}
                      </div>
                      <div className="text-sm text-gray-500">
                        {policy.premium?.frequency}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm text-gray-900">
                        {formatDate(policy.validity?.startDate)} -{" "}
                        {formatDate(policy.validity?.endDate)}
                      </div>
                      <div className={`text-xs ${expiryStatus.color}`}>
                        {expiryStatus.text}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4 text-gray-400" />
                      <span className="text-sm font-medium text-gray-900">
                        {policy.beneficiaries?.length || 0}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <InteractivePolicyActions
                      policy={policy}
                      onViewPolicy={onViewPolicy}
                      onAddBeneficiary={onAddBeneficiary}
                      onRemoveBeneficiary={onRemoveBeneficiary}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Main HRPolicyUser Component
export const HRPolicyUser = () => {
  const [viewMode, setViewMode] = useState("table");
  const [showFilters, setShowFilters] = useState(true);
  const [showReports, setShowReports] = useState(false);
  const [policies, setPolicies] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(false);
  const [statsLoading, setStatsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    policyType: "",
    policyCategory: "",
    status: "",
  });
  const [totalPolicies, setTotalPolicies] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [notification, setNotification] = useState(null);

  // Modal states
  const [selectedPolicy, setSelectedPolicy] = useState(null);
  const [showPolicyModal, setShowPolicyModal] = useState(false);
  const [showBeneficiaryModal, setShowBeneficiaryModal] = useState(false);
  const [beneficiaryModalMode, setBeneficiaryModalMode] = useState("add");

  // Notification helper
  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  // Fetch policies
  const fetchPolicies = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        ...filters,
        search: searchTerm,
        page: currentPage,
        limit: 10,
      };

      Object.keys(params).forEach((key) => {
        if (params[key] === "" || params[key] === null || params[key] === undefined) {
          delete params[key];
        }
      });

      const response = await insuranceApiService.getPolicies(params);

      if (response && response.success !== false) {
        let policiesData = [];
        let totalCount = 0;

        if (response.data) {
          if (Array.isArray(response.data)) {
            policiesData = response.data;
            totalCount = response.totalCount || response.data.length;
          } else if (response.data.policies) {
            policiesData = response.data.policies;
            totalCount = response.data.totalCount || response.data.policies.length;
          }
        } else if (Array.isArray(response)) {
          policiesData = response;
          totalCount = response.length;
        } else if (response.policies) {
          policiesData = response.policies;
          totalCount = response.totalCount || response.policies.length;
        }

        setPolicies(policiesData);
        setTotalPolicies(totalCount);
        setTotalPages(Math.ceil(totalCount / 10));
      } else {
        setPolicies([]);
        setTotalPolicies(0);
        setTotalPages(0);
      }
    } catch (error) {
      console.error("Error fetching policies:", error);
      showNotification("Failed to fetch policies: " + error.message, "error");
      setPolicies([]);
    } finally {
      setLoading(false);
    }
  }, [filters, searchTerm, currentPage]);

  // Fetch stats
  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const response = await insuranceApiService.getPolicyStatistics();
      if (response && response.success !== false) {
        if (response.data) {
          setStats(response.data);
        } else if (response.statistics) {
          setStats(response.statistics);
        } else {
          setStats(response);
        }
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  // Effects
  useEffect(() => {
    fetchPolicies();
  }, [fetchPolicies]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Enhanced handlers
  const updateFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({ policyType: "", policyCategory: "", status: "" });
    setSearchTerm("");
    setCurrentPage(1);
  };

  // FIXED handleViewPolicy function with comprehensive debugging
  const handleViewPolicy = async (policyData) => {
    console.log('=== handleViewPolicy DEBUG ===');
    console.log('1. Input policyData:', policyData);
    console.log('2. Type of policyData:', typeof policyData);
    
    try {
      let policy = null;

      // If policyData is already a complete policy object, use it directly
      if (policyData && typeof policyData === 'object' && 
          (policyData.policyId || policyData.policyNumber)) {
        console.log('3. Using policy object directly');
        policy = policyData;
      } 
      // If it's a string ID, fetch the full policy details
      else if (typeof policyData === "string") {
        console.log('3. Fetching policy by ID:', policyData);
        const response = await insuranceApiService.getPolicyById(policyData);
        console.log('4. API Response:', response);
        
        // Handle different response structures from the API
        if (response) {
          if (response.success && response.policy) {
            policy = response.policy;
          } else if (response.data && response.data.policy) {
            policy = response.data.policy;
          } else if (response.data) {
            policy = response.data;
          } else if (response.policy) {
            policy = response.policy;
          } else if (response._id || response.policyId || response.policyNumber) {
            policy = response;
          }
        }
      }
      // If policyData has an ID but not complete data, fetch it
      else if (policyData && (policyData._id || policyData.id)) {
        const policyId = policyData._id || policyData.id;
        console.log('3. Fetching policy by object ID:', policyId);
        const response = await insuranceApiService.getPolicyById(policyId);
        console.log('4. API Response:', response);
        
        if (response) {
          if (response.success && response.policy) {
            policy = response.policy;
          } else if (response.data && response.data.policy) {
            policy = response.data.policy;
          } else if (response.data) {
            policy = response.data;
          } else if (response.policy) {
            policy = response.policy;
          } else if (response._id || response.policyId || response.policyNumber) {
            policy = response;
          }
        }
      }

      console.log('5. Final policy data:', policy);

      // Validate that we have a valid policy object
      if (!policy) {
        throw new Error('Policy data could not be loaded');
      }

      // Ensure policy has required fields
      if (!policy.policyId && !policy.policyNumber) {
        console.error('6. Policy missing required fields:', policy);
        throw new Error('Invalid policy data - missing policy ID or number');
      }

      // Ensure policy has all necessary nested objects
      if (!policy.coverage) {
        console.warn('Policy missing coverage data');
        policy.coverage = {};
      }
      if (!policy.premium) {
        console.warn('Policy missing premium data');
        policy.premium = {};
      }
      if (!policy.validity) {
        console.warn('Policy missing validity data');
        policy.validity = {};
      }
      if (!policy.beneficiaries) {
        console.warn('Policy missing beneficiaries data');
        policy.beneficiaries = [];
      }

      console.log('6. Setting selectedPolicy and opening modal');
      console.log('7. Policy to display:', {
        id: policy._id,
        policyId: policy.policyId,
        policyNumber: policy.policyNumber,
        hasCoverage: !!policy.coverage,
        hasPremium: !!policy.premium,
        hasValidity: !!policy.validity,
        beneficiariesCount: policy.beneficiaries?.length || 0
      });

      setSelectedPolicy(policy);
      setShowPolicyModal(true);
      
    } catch (error) {
      console.error("=== ERROR in handleViewPolicy ===");
      console.error("Error details:", error);
      console.error("Error message:", error.message);
      
      showNotification(
        "Failed to load policy details: " + (error.message || 'Unknown error'),
        "error"
      );
      
      // Reset modal state
      setShowPolicyModal(false);
      setSelectedPolicy(null);
    }
  };

  const handleAddBeneficiary = async (policyId) => {
    try {
      const policy = policies.find((p) => (p._id || p.id) === policyId);

      if (!policy) {
        const response = await insuranceApiService.getPolicyById(policyId);
        const fetchedPolicy = response.success && response.policy ? response.policy : response.data || response;
        setSelectedPolicy(fetchedPolicy);
      } else {
        setSelectedPolicy(policy);
      }

      setBeneficiaryModalMode("add");
      setShowBeneficiaryModal(true);
    } catch (error) {
      console.error("Error preparing to add beneficiary:", error);
      showNotification(
        "Failed to load policy for beneficiary management: " + error.message,
        "error"
      );
    }
  };

  const handleRemoveBeneficiary = async (policyId) => {
    try {
      const policy = policies.find((p) => (p._id || p.id) === policyId);

      if (!policy) {
        const response = await insuranceApiService.getPolicyById(policyId);
        const fetchedPolicy = response.success && response.policy ? response.policy : response.data || response;
        setSelectedPolicy(fetchedPolicy);
      } else {
        setSelectedPolicy(policy);
      }

      setBeneficiaryModalMode("remove");
      setShowBeneficiaryModal(true);
    } catch (error) {
      console.error("Error preparing to remove beneficiary:", error);
      showNotification(
        "Failed to load policy for beneficiary management: " + error.message,
        "error"
      );
    }
  };

  const handleModalAddBeneficiary = async (policyId, beneficiaryId) => {
    const response = await insuranceApiService.addPolicyBeneficiary(
      policyId,
      beneficiaryId
    );

    if (response && response.success !== false) {
      return response;
    } else {
      throw new Error(response?.message || "Failed to add beneficiary");
    }
  };

  const handleModalRemoveBeneficiary = async (policyId, beneficiaryId) => {
    const response = await insuranceApiService.removePolicyBeneficiary(
      policyId,
      beneficiaryId
    );

    if (response && response.success !== false) {
      return response;
    } else {
      throw new Error(response?.message || "Failed to remove beneficiary");
    }
  };

  const handleBeneficiaryModalClose = () => {
    setShowBeneficiaryModal(false);
    setSelectedPolicy(null);
    fetchPolicies();
    fetchStats();
    showNotification(
      beneficiaryModalMode === "add"
        ? "Beneficiaries updated successfully"
        : "Beneficiaries removed successfully"
    );
  };

  const handleRefresh = () => {
    fetchPolicies();
    fetchStats();
    showNotification("Data refreshed successfully");
  };

  const getFilterDescription = () => {
    let description = [];

    if (filters.policyType) {
      description.push(
        `${filters.policyType === "life" ? "Life" : "Vehicle"} Insurance`
      );
    }

    if (filters.policyCategory) {
      description.push(
        `${
          filters.policyCategory === "individual" ? "Individual" : "Group"
        } Policy`
      );
    }

    if (filters.status) {
      description.push(
        `Status: ${
          filters.status.charAt(0).toUpperCase() + filters.status.slice(1)
        }`
      );
    }

    return description.length > 0 ? description.join(" • ") : "All Policies";
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Notification */}
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Policy Management
            </h1>
            <p className="text-gray-600 mt-2">
              {getFilterDescription()} • {totalPolicies} policies found
            </p>
          </div>
          <button
            onClick={handleRefresh}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
        </div>

        <PolicyStats stats={stats} loading={statsLoading} policies={policies} />
      </div>

      {/* Search and Controls */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search policies..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

            {/* Controls */}
          <div className="flex items-center gap-3">
            {/* Reports Button */}
            <button
              onClick={() => setShowReports(!showReports)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors ${
                showReports
                  ? "bg-green-50 border-green-200 text-green-700 dark:bg-green-900/20 dark:border-green-800 dark:text-green-300"
                  : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300"
              }`}
            >
              <FileBarChart className="h-4 w-4" />
              Reports
            </button>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors ${
                showFilters
                  ? "bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-300"
                  : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300"
              }`}
            >
          
              <Filter className="h-4 w-4" />
              Filters
              <ChevronDown
                className={`h-4 w-4 transition-transform ${
                  showFilters ? "rotate-180" : ""
                }`}
              />
            </button>

            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode("table")}
                className={`flex items-center gap-2 px-3 py-1 rounded-md text-sm transition-colors ${
                  viewMode === "table"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <List className="h-4 w-4" />
                Table
              </button>
              <button
                onClick={() => setViewMode("grid")}
                className={`flex items-center gap-2 px-3 py-1 rounded-md text-sm transition-colors ${
                  viewMode === "grid"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <Grid className="h-4 w-4" />
                Grid
              </button>
            </div>
          </div>
        </div>

         {/* Reports Panel */}
        {showReports && (
          <div className="mt-4">
            <ReportsPanel
              filters={filters}
              policies={policies}
              onClose={() => setShowReports(false)}
              showNotification={showNotification}
            />
          </div>
        )}

        {showFilters && (
          <div className="mt-4">
            <PolicyFilters
              filters={filters}
              updateFilter={updateFilter}
              clearFilters={clearFilters}
              onClose={() => setShowFilters(false)}
            />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="mb-6">
        {viewMode === "table" ? (
          <PolicyTable
            policies={policies}
            loading={loading}
            onViewPolicy={handleViewPolicy}
            onAddBeneficiary={handleAddBeneficiary}
            onRemoveBeneficiary={handleRemoveBeneficiary}
          />
        ) : (
          <PolicyUsersList
            policies={policies}
            loading={loading}
            view="grid"
            onViewDetails={handleViewPolicy}
            onAddBeneficiary={handleAddBeneficiary}
            onRemoveBeneficiary={handleRemoveBeneficiary}
            onRefresh={handleRefresh}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between bg-white px-6 py-3 border rounded-lg">
          <div className="text-sm text-gray-700">
            Showing {policies.length} of {totalPolicies} policies
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1 || loading}
              className="flex items-center gap-1 px-3 py-1 text-sm border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </button>

            <span className="px-3 py-1 text-sm text-gray-700">
              Page {currentPage} of {totalPages}
            </span>

            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages || loading}
              className="flex items-center gap-1 px-3 py-1 text-sm border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Policy Details Modal - CRITICAL: Check both conditions and log */}
      {console.log('Modal Render Check:', { showPolicyModal, hasSelectedPolicy: !!selectedPolicy })}
      {showPolicyModal && selectedPolicy && (
        <PolicyDetailsModal
          policy={selectedPolicy}
          isOpen={showPolicyModal}
          onClose={() => {
            console.log('Closing policy modal');
            setShowPolicyModal(false);
            setSelectedPolicy(null);
          }}
        />
      )}

      {/* Beneficiary Management Modal */}
      {showBeneficiaryModal && selectedPolicy && (
        <BeneficiaryManagementModal
          isOpen={showBeneficiaryModal}
          onClose={handleBeneficiaryModalClose}
          policy={selectedPolicy}
          onAddBeneficiary={handleModalAddBeneficiary}
          onRemoveBeneficiary={handleModalRemoveBeneficiary}
          mode={beneficiaryModalMode}
        />
      )}
    </div>
  );
};