import React, { useState, useEffect } from 'react';
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
  Trash2
} from 'lucide-react';
import userApiService from '../../services/user-api';
import policyService from '../../services/policyService';

export const BeneficiaryManagementModal = ({ 
  isOpen, 
  onClose, 
  policy, 
  onAddBeneficiary, 
  onRemoveBeneficiary, 
  mode // 'add' or 'remove'
}) => {
  // States
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [currentBeneficiaries, setCurrentBeneficiaries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  // Show notification
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // Search employees for adding beneficiaries
  const searchEmployees = async (searchQuery) => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    setSearchLoading(true);
    try {
      const response = await userApiService.getUsers({
        role: 'employee',
        search: searchQuery,
        limit: 20
      });

      let employees = [];
      // Handle your API response structure: { success: true, count: 6, users: [...] }
      if (response?.users) {
        employees = response.users;
      } else if (response?.data) {
        employees = Array.isArray(response.data) ? response.data : [response.data];
      } else if (Array.isArray(response)) {
        employees = response;
      }

      // Filter out users who are already beneficiaries
      const existingBeneficiaryIds = currentBeneficiaries.map(b => b._id || b.id);
      const filteredEmployees = employees.filter(emp => 
        !existingBeneficiaryIds.includes(emp._id || emp.id)
      );

      setSearchResults(filteredEmployees);
    } catch (error) {
      console.error('Error searching employees:', error);
      showNotification('Failed to search employees: ' + error.message, 'error');
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  // Load current beneficiaries
  const loadCurrentBeneficiaries = async () => {
    if (!policy?.beneficiaries) {
      setCurrentBeneficiaries([]);
      return;
    }

    setLoading(true);
    try {
      // If beneficiaries are already populated objects, use them directly
      if (policy.beneficiaries.length > 0 && typeof policy.beneficiaries[0] === 'object') {
        setCurrentBeneficiaries(policy.beneficiaries);
      } else if (policy.beneficiaries.length > 0) {
        // If beneficiaries are just IDs, we need to fetch user details
        const beneficiaryPromises = policy.beneficiaries.map(async (beneficiaryId) => {
          try {
            const response = await userApiService.getUsers({ id: beneficiaryId });
            return response?.data || response;
          } catch (error) {
            console.error(`Error fetching beneficiary ${beneficiaryId}:`, error);
            return null;
          }
        });

        const beneficiaryDetails = await Promise.all(beneficiaryPromises);
        setCurrentBeneficiaries(beneficiaryDetails.filter(b => b !== null));
      } else {
        setCurrentBeneficiaries([]);
      }
    } catch (error) {
      console.error('Error loading beneficiaries:', error);
      showNotification('Failed to load current beneficiaries', 'error');
      setCurrentBeneficiaries([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle adding beneficiary
  const handleAddBeneficiary = async (employee) => {
    if (!employee || !policy) return;

    setActionLoading(true);
    try {
      console.log("iygeowye : ",policy._id);
      await policyService.addBeneficiary(policy._id, employee._id);
      
      // Update local state
      setCurrentBeneficiaries(prev => [...prev, employee]);
      setSearchResults(prev => prev.filter(emp => (emp._id || emp.id) !== (employee._id || employee.id)));
      setSelectedUser(null);
      setSearchTerm('');
      
      showNotification(`Successfully added ${employee.firstName} ${employee.lastName} as beneficiary`);
    } catch (error) {
      console.error('Error adding beneficiary:', error);
      showNotification('Failed to add beneficiary: ' + error.message, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle removing beneficiary
  const handleRemoveBeneficiary = async (beneficiary) => {
    if (!beneficiary || !policy) return;

    setActionLoading(true);
    try {
      await policyService.removeBeneficiary(policy.policyId || policy._id, beneficiary._id || beneficiary.id);
      
      // Update local state
      setCurrentBeneficiaries(prev => 
        prev.filter(b => (b._id || b.id) !== (beneficiary._id || beneficiary.id))
      );
      
      showNotification(`Successfully removed ${beneficiary.firstName} ${beneficiary.lastName} as beneficiary`);
    } catch (error) {
      console.error('Error removing beneficiary:', error);
      showNotification('Failed to remove beneficiary: ' + error.message, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Effects
  useEffect(() => {
    if (isOpen && policy) {
      loadCurrentBeneficiaries();
    }
  }, [isOpen, policy]);

  useEffect(() => {
    if (mode === 'add') {
      const debounceTimer = setTimeout(() => {
        searchEmployees(searchTerm);
      }, 300);

      return () => clearTimeout(debounceTimer);
    }
  }, [searchTerm, mode]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSearchTerm('');
      setSearchResults([]);
      setSelectedUser(null);
      setNotification(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50  backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-4xl h-[700px] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            {mode === 'add' ? (
              <UserPlus className="h-6 w-6 text-blue-600" />
            ) : (
              <UserMinus className="h-6 w-6 text-red-600" />
            )}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {mode === 'add' ? 'Add Beneficiary' : 'Remove Beneficiary'}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Policy: {policy?.policyId} • {policy?.policyType === 'life' ? 'Life' : 'Vehicle'} Insurance
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

        {/* Notification */}
        {notification && (
          <div className={`p-4 m-4 rounded-lg border ${
            notification.type === 'error' 
              ? 'bg-red-50 border-red-200 text-red-800' 
              : 'bg-green-50 border-green-200 text-green-800'
          }`}>
            <div className="flex items-center gap-2">
              {notification.type === 'error' ? (
                <AlertCircle className="h-4 w-4" />
              ) : (
                <CheckCircle className="h-4 w-4" />
              )}
              <span className="text-sm font-medium">{notification.message}</span>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 p-6 overflow-y-auto min-h-0">
          {mode === 'add' ? (
            // Add Beneficiary Mode
            <div className="space-y-6">
              {/* Current Beneficiaries Info */}
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                    Current Beneficiaries: {currentBeneficiaries.length}
                  </span>
                </div>
                {currentBeneficiaries.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {currentBeneficiaries.map(beneficiary => (
                      <span 
                        key={beneficiary._id || beneficiary.id}
                        className="inline-flex items-center px-2 py-1 bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200 text-xs rounded-md"
                      >
                        {beneficiary.firstName} {beneficiary.lastName}
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
                    placeholder="Search by name, email, or employee ID..."
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
                      {searchResults.map(employee => (
                        <div
                          key={employee._id || employee.id}
                          className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                              <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900 dark:text-white">
                                {employee.profile?.firstName || employee.firstName} {employee.profile?.lastName || employee.lastName}
                              </h4>
                              <div className="flex items-center gap-4 text-sm text-gray-500">
                                <div className="flex items-center gap-1">
                                  <Mail className="h-3 w-3" />
                                  {employee.email}
                                </div>
                                {(employee.profile?.phoneNumber || employee.phone) && (
                                  <div className="flex items-center gap-1">
                                    <Phone className="h-3 w-3" />
                                    {employee.profile?.phoneNumber || employee.phone}
                                  </div>
                                )}
                              </div>
                              <div className="text-xs text-gray-400 mt-1">
                                {employee.userId} • {employee.employment?.department || 'N/A'}
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => handleAddBeneficiary(employee)}
                            disabled={actionLoading}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
                  ) : searchTerm && !searchLoading ? (
                    <div className="text-center py-8 text-gray-500">
                      <User className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                      <p>No employees found matching "{searchTerm}"</p>
                      <p className="text-sm">Try searching with a different term</p>
                    </div>
                  ) : null}
                </div>
              )}
            </div>
          ) : (
            // Remove Beneficiary Mode
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Current Beneficiaries ({currentBeneficiaries.length})
                </h3>
                
                {loading ? (
                  <div className="space-y-3">
                    {[...Array(3)].map((_, index) => (
                      <div key={index} className="animate-pulse">
                        <div className="flex items-center p-4 border border-gray-200 rounded-lg">
                          <div className="w-10 h-10 bg-gray-300 rounded-full mr-3"></div>
                          <div className="flex-1">
                            <div className="h-4 bg-gray-300 rounded mb-2"></div>
                            <div className="h-3 bg-gray-300 rounded w-3/4"></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : currentBeneficiaries.length > 0 ? (
                  <div className="space-y-3">
                    {currentBeneficiaries.map(beneficiary => (
                      <div
                        key={beneficiary._id || beneficiary.id}
                        className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
                            <User className="h-5 w-5 text-red-600 dark:text-red-400" />
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900 dark:text-white">
                              {beneficiary.profile?.firstName || beneficiary.firstName} {beneficiary.profile?.lastName || beneficiary.lastName}
                            </h4>
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <div className="flex items-center gap-1">
                                <Mail className="h-3 w-3" />
                                {beneficiary.email}
                              </div>
                              {(beneficiary.profile?.phoneNumber || beneficiary.phone) && (
                                <div className="flex items-center gap-1">
                                  <Phone className="h-3 w-3" />
                                  {beneficiary.profile?.phoneNumber || beneficiary.phone}
                                </div>
                              )}
                            </div>
                            <div className="text-xs text-gray-400 mt-1">
                              {beneficiary.userId} • {beneficiary.employment?.department || 'N/A'}
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => handleRemoveBeneficiary(beneficiary)}
                          disabled={actionLoading}
                          className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
                    <button
                      onClick={() => {
                        // Switch to add mode if needed
                        onClose();
                      }}
                      className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                    >
                      Add Beneficiaries
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
          <div className="text-sm text-gray-500">
            {mode === 'add' 
              ? 'Search and select an employee to add as a beneficiary'
              : 'Select beneficiaries to remove from this policy'
            }
          </div>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};