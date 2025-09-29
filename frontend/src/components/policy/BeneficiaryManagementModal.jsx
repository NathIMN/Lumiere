/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import {
  X,
  Search,
  UserPlus,
  UserMinus,
  User,
  Mail,
  Phone,
  Users,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  Trash2,
} from "lucide-react";
import userApiService from "../../services/user-api";
import policyService from "../../services/policyService";

export const BeneficiaryManagementModal = ({
  isOpen,
  onClose,
  policy,
  onAddBeneficiary,
  onRemoveBeneficiary,
  mode, // 'add' or 'remove'
}) => {
  // States
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [currentBeneficiaries, setCurrentBeneficiaries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  //  Utility: Safe name builder
  const formatName = (user) =>
    `${user?.profile?.firstName || user?.firstName || ""} ${
      user?.profile?.lastName || user?.lastName || ""
    }`.trim() || "Unnamed User";

  //  Utility: Safe ID getter
  const getId = (item) => item?._id || item?.id;

  //  Notification system
  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  //  Search employees (debounced via useEffect)
  const searchEmployees = async (searchQuery) => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    setSearchLoading(true);
    try {
      const response = await userApiService.getUsers({
        role: "employee",
        search: searchQuery,
        limit: 20,
        searchFields: ["firstName", "lastName", "email", "userId", "employeeId"],
      });

      let employees = [];
      if (response?.users) {
        employees = response.users;
      } else if (response?.data) {
        employees = Array.isArray(response.data)
          ? response.data
          : [response.data];
      } else if (Array.isArray(response)) {
        employees = response;
      }

      // Client-side filtering
      const searchLower = searchQuery.toLowerCase();
      employees = employees.filter((emp) => {
        const firstName = (emp?.profile?.firstName || emp?.firstName || "").toLowerCase();
        const lastName = (emp?.profile?.lastName || emp?.lastName || "").toLowerCase();
        const email = (emp?.email || "").toLowerCase();
        const userId = (emp?.userId || "").toLowerCase();
        const employeeId = (emp?.employeeId || "").toLowerCase();
        return (
          firstName.includes(searchLower) ||
          lastName.includes(searchLower) ||
          email.includes(searchLower) ||
          userId.includes(searchLower) ||
          employeeId.includes(searchLower)
        );
      });

      // Exclude existing beneficiaries
      const existingIds = currentBeneficiaries.map(getId);
      const filtered = employees.filter((emp) => !existingIds.includes(getId(emp)));

      setSearchResults(filtered);
    } catch (error) {
      console.error("Error searching employees:", error);
      showNotification("Failed to search employees: " + error.message, "error");
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  // ✅ Load beneficiaries
  const loadCurrentBeneficiaries = async () => {
    if (!policy?.beneficiaries) {
      setCurrentBeneficiaries([]);
      return;
    }
    setLoading(true);
    try {
      if (
        policy.beneficiaries.length > 0 &&
        typeof policy.beneficiaries[0] === "object"
      ) {
        setCurrentBeneficiaries(policy.beneficiaries);
      } else {
        const details = await Promise.all(
          policy.beneficiaries.map(async (id) => {
            try {
              const response = await userApiService.getUsers({ id });
              return response?.data || response;
            } catch (error) {
              console.error("Error fetching beneficiary:", id, error);
              return null;
            }
          })
        );
        setCurrentBeneficiaries(details.filter(Boolean));
      }
    } catch (error) {
      console.error("Error loading beneficiaries:", error);
      showNotification("Failed to load beneficiaries", "error");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Add
  const handleAddBeneficiary = async (employee) => {
    if (!employee || !policy) return;
    setActionLoading(true);
    try {
      await policyService.addBeneficiary(policy._id, getId(employee));
      setCurrentBeneficiaries((prev) => [...prev, employee]);
      setSearchResults((prev) => prev.filter((emp) => getId(emp) !== getId(employee)));
      showNotification(`Added ${formatName(employee)} as beneficiary`);
      if (onAddBeneficiary) onAddBeneficiary(employee);
    } catch (error) {
      console.error("Error adding beneficiary:", error);
      showNotification("Failed to add beneficiary: " + error.message, "error");
    } finally {
      setActionLoading(false);
    }
  };

  // ✅ Remove
  const handleRemoveBeneficiary = async (beneficiary) => {
    if (!beneficiary || !policy) return;
    setActionLoading(true);
    try {
      await policyService.removeBeneficiary(policy._id, getId(beneficiary));
      setCurrentBeneficiaries((prev) =>
        prev.filter((b) => getId(b) !== getId(beneficiary))
      );
      showNotification(`Removed ${formatName(beneficiary)} from beneficiaries`);
      if (onRemoveBeneficiary) onRemoveBeneficiary(getId(beneficiary));
    } catch (error) {
      console.error("Error removing beneficiary:", error);
      showNotification("Failed to remove beneficiary: " + error.message, "error");
    } finally {
      setActionLoading(false);
    }
  };

  // ✅ Effects
  useEffect(() => {
    if (isOpen && policy) loadCurrentBeneficiaries();
  }, [isOpen, policy]);

  useEffect(() => {
    if (mode === "add" && searchTerm) {
      const t = setTimeout(() => searchEmployees(searchTerm), 300);
      return () => clearTimeout(t);
    }
  }, [searchTerm, mode, currentBeneficiaries]);

  useEffect(() => {
    if (!isOpen) {
      setSearchTerm("");
      setSearchResults([]);
      setNotification(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-4xl h-[700px] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            {mode === "add" ? (
              <UserPlus className="h-6 w-6 text-blue-600" />
            ) : (
              <UserMinus className="h-6 w-6 text-red-600" />
            )}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {mode === "add" ? "Add Beneficiary" : "Remove Beneficiary"}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Policy: {policy?.policyId || policy?._id} •{" "}
                {policy?.policyType || "Insurance"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Notification */}
        {notification && (
          <div
            className={`p-4 m-4 rounded-lg border ${
              notification.type === "error"
                ? "bg-red-50 border-red-200 text-red-800"
                : "bg-green-50 border-green-200 text-green-800"
            }`}
          >
            <div className="flex items-center gap-2">
              {notification.type === "error" ? (
                <AlertCircle className="h-4 w-4" />
              ) : (
                <CheckCircle className="h-4 w-4" />
              )}
              <span className="text-sm font-medium">
                {notification.message}
              </span>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 p-6 overflow-y-auto min-h-0">
          {mode === "add" ? (
            // 🔵 Add Mode
            <div className="space-y-6">
              {/* Current Beneficiaries */}
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                    Current Beneficiaries: {currentBeneficiaries.length}
                  </span>
                </div>
                {currentBeneficiaries.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {currentBeneficiaries.map((b) => (
                      <span
                        key={getId(b)}
                        className="inline-flex items-center px-2 py-1 bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200 text-xs rounded-md"
                      >
                        {formatName(b)}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Search */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Search Employees
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by name, email, employee ID, or user ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  {searchLoading && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <RefreshCw className="h-4 w-4 text-gray-400 animate-spin" />
                    </div>
                  )}
                </div>
              </div>

              {/* Search Results */}
              {searchTerm && (
                <div>
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Search Results ({searchResults.length})
                  </h3>
                  {searchResults.length > 0 ? (
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {searchResults.map((emp) => (
                        <div
                          key={getId(emp)}
                          className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                              <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900 dark:text-white">
                                {formatName(emp)}
                              </h4>
                              <div className="flex items-center gap-4 text-sm text-gray-500">
                                <div className="flex items-center gap-1">
                                  <Mail className="h-3 w-3" />
                                  {emp?.email || "N/A"}
                                </div>
                                {emp?.profile?.phoneNumber || emp?.phone ? (
                                  <div className="flex items-center gap-1">
                                    <Phone className="h-3 w-3" />
                                    {emp?.profile?.phoneNumber || emp?.phone}
                                  </div>
                                ) : null}
                              </div>
                              <div className="text-xs text-gray-400 mt-1">
                                Employee ID:{" "}
                                {emp?.userId || emp?.employeeId || "N/A"} •{" "}
                                {emp?.employment?.department || "N/A"}
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => handleAddBeneficiary(emp)}
                            disabled={actionLoading}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50"
                          >
                            {actionLoading ? (
                              <RefreshCw className="h-4 w-4 animate-spin" />
                            ) : (
                              <UserPlus className="h-4 w-4" />
                            )}
                            Add
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    !searchLoading && (
                      <div className="text-center py-8 text-gray-500">
                        <User className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                        <p>No employees found matching "{searchTerm}"</p>
                      </div>
                    )
                  )}
                </div>
              )}
            </div>
          ) : (
            // 🔴 Remove Mode
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Current Beneficiaries ({currentBeneficiaries.length})
              </h3>
              {loading ? (
                <p>Loading...</p>
              ) : currentBeneficiaries.length > 0 ? (
                <div className="space-y-3">
                  {currentBeneficiaries.map((b) => (
                    <div
                      key={getId(b)}
                      className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
                          <User className="h-5 w-5 text-red-600 dark:text-red-400" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white">
                            {formatName(b)}
                          </h4>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <div className="flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {b?.email || "N/A"}
                            </div>
                            {b?.profile?.phoneNumber || b?.phone ? (
                              <div className="flex items-center gap-1">
                                <Phone className="h-3 w-3" />
                                {b?.profile?.phoneNumber || b?.phone}
                              </div>
                            ) : null}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemoveBeneficiary(b)}
                        disabled={actionLoading}
                        className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg disabled:opacity-50"
                      >
                        {actionLoading ? (
                          <RefreshCw className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <Users className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No Beneficiaries
                  </h3>
                  <p>This policy doesn't have any beneficiaries yet.</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
          <div className="text-sm text-gray-500">
            {mode === "add"
              ? "Search and select an employee to add as a beneficiary"
              : "Select beneficiaries to remove from this policy"}
          </div>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
