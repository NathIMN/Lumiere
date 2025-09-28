import React, { useState, useEffect } from 'react';
import { 
  X, 
  Search, 
  User, 
  Mail, 
  Building, 
  UserPlus, 
  UserMinus, 
  Check, 
  AlertTriangle, 
  Loader2,
  Users
} from 'lucide-react';

export const BeneficiaryManagementModal = ({ 
  isOpen, 
  onClose, 
  policy, 
  onAddBeneficiary, 
  onRemoveBeneficiary, 
  mode // 'add' or 'remove'
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const searchUsers = (term) => {
    setLoading(true);
    try {
      let users = [];
      
      if (mode === 'remove') {
        // For remove mode, show current beneficiaries
        users = policy.beneficiaries || [];
      } else {
        // For add mode, you need to provide user data from your existing system
        users = [];
      }

      // Filter by search term if provided
      if (term) {
        const searchTerm = term.toLowerCase();
        users = users.filter(user => 
          user.firstName?.toLowerCase().includes(searchTerm) ||
          user.lastName?.toLowerCase().includes(searchTerm) ||
          user.email?.toLowerCase().includes(searchTerm) ||
          user.employeeId?.toLowerCase().includes(searchTerm)
        );
      }
      
      setAvailableUsers(users);
      setError('');
    } catch (err) {
      console.error('Error filtering users:', err);
      setError('Failed to load users: ' + err.message);
      setAvailableUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      setSelectedUsers([]);
      setError('');
      searchUsers(searchTerm);
    }
  }, [isOpen, searchTerm, mode, policy]);

  const handleUserToggle = (user) => {
    setSelectedUsers(prev => {
      const isSelected = prev.find(u => (u._id || u.id) === (user._id || user.id));
      if (isSelected) {
        return prev.filter(u => (u._id || u.id) !== (user._id || user.id));
      } else {
        return [...prev, user];
      }
    });
  };

  const handleSave = async () => {
    if (selectedUsers.length === 0) return;
    
    setSaving(true);
    setError('');
    try {
      const policyId = policy._id || policy.id;
      
      if (mode === 'add') {
        // Add beneficiaries one by one
        for (const user of selectedUsers) {
          await onAddBeneficiary(policyId, user._id || user.id);
        }
      } else {
        // Remove beneficiaries one by one
        for (const user of selectedUsers) {
          await onRemoveBeneficiary(policyId, user._id || user.id);
        }
      }
      
      setSelectedUsers([]);
      onClose();
    } catch (err) {
      console.error(`Error ${mode}ing beneficiaries:`, err);
      setError(err.message || `Failed to ${mode} beneficiaries`);
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    setSelectedUsers([]);
    setSearchTerm('');
    setError('');
    onClose();
  };

  if (!isOpen || !policy) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen p-4">
        <div 
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" 
          onClick={handleClose}
        ></div>
        
        <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {mode === 'add' ? 'Add Beneficiaries' : 'Remove Beneficiaries'}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Policy: {policy.policyId || policy.policyNumber} • Current beneficiaries: {policy.beneficiaries?.length || 0}
              </p>
            </div>
            <button 
              onClick={handleClose} 
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-hidden flex flex-col p-6">
            {/* Search */}
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name, email, or employee ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                {loading && (
                  <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-gray-400" />
                )}
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <div className="flex items-center">
                  <AlertTriangle className="h-4 w-4 text-red-600 mr-2" />
                  <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
                </div>
              </div>
            )}

            {/* Selection Summary */}
            {selectedUsers.length > 0 && (
              <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <div className="flex items-center">
                  <Check className="h-4 w-4 text-blue-600 mr-2" />
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    {selectedUsers.length} user{selectedUsers.length > 1 ? 's' : ''} selected to {mode}
                  </p>
                </div>
              </div>
            )}

            {/* Add Mode Notice */}
            {mode === 'add' && availableUsers.length === 0 && (
              <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <div className="flex items-center">
                  <AlertTriangle className="h-4 w-4 text-yellow-600 mr-2" />
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">
                    To add beneficiaries, integrate this with your existing user data or user management system.
                  </p>
                </div>
              </div>
            )}

            {/* Users List */}
            <div className="flex-1 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg">
              {loading && availableUsers.length === 0 ? (
                <div className="p-8 text-center">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-3 text-gray-400" />
                  <p className="text-sm text-gray-500">Loading...</p>
                </div>
              ) : availableUsers.length === 0 ? (
                <div className="p-8 text-center">
                  <Users className="h-8 w-8 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {mode === 'add' 
                      ? 'No users available. Integrate with your user management system.' 
                      : 'No beneficiaries to remove'
                    }
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {availableUsers.map((user) => {
                    const userId = user._id || user.id;
                    const isSelected = selectedUsers.find(u => (u._id || u.id) === userId);
                    
                    return (
                      <div
                        key={userId}
                        className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors ${
                          isSelected ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500' : ''
                        }`}
                        onClick={() => handleUserToggle(user)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="bg-gray-100 dark:bg-gray-600 p-2 rounded-full">
                              <User className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900 dark:text-white">
                                {user.firstName} {user.lastName}
                              </p>
                              <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                                <div className="flex items-center">
                                  <Mail className="h-3 w-3 mr-1" />
                                  {user.email}
                                </div>
                                {user.employeeId && (
                                  <div className="flex items-center">
                                    <Building className="h-3 w-3 mr-1" />
                                    {user.employeeId}
                                  </div>
                                )}
                              </div>
                              {user.employment && (
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  {user.employment.position} - {user.employment.department}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center">
                            {isSelected && (
                              <div className="bg-blue-100 dark:bg-blue-900 p-1 rounded-full mr-2">
                                <Check className="h-3 w-3 text-blue-600 dark:text-blue-300" />
                              </div>
                            )}
                            <input
                              type="checkbox"
                              checked={!!isSelected}
                              onChange={() => handleUserToggle(user)}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-between items-center px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
            <button
              onClick={handleClose}
              className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-md transition-colors"
            >
              Cancel
            </button>
            
            <button
              onClick={handleSave}
              disabled={selectedUsers.length === 0 || saving}
              className={`px-6 py-2 text-sm font-medium rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 ${
                mode === 'add'
                  ? 'bg-green-600 hover:bg-green-700 text-white'
                  : 'bg-red-600 hover:bg-red-700 text-white'
              }`}
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  {mode === 'add' ? (
                    <UserPlus className="h-4 w-4" />
                  ) : (
                    <UserMinus className="h-4 w-4" />
                  )}
                  <span>
                    {mode === 'add' ? 'Add' : 'Remove'} ({selectedUsers.length})
                  </span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};