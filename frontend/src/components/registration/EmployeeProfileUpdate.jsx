import React, { useState, useEffect } from 'react';
import { User, Shield, Phone, MapPin, CreditCard, Users, Save, X, Edit3, Check, AlertCircle } from 'lucide-react';
import UserApiService from '../../services/user-api';

const EmployeeProfileUpdate = () => {
  const [profileData, setProfileData] = useState({
    profile: {
      firstName: '',
      lastName: '',
      dateOfBirth: '',
      nic: '',
      phoneNumber: '',
      address: ''
    },
    bankDetails: {
      accountHolderName: '',
      bankName: '',
      branchName: '',
      accountNumber: ''
    },
    dependents: []
  });

  const [editableSection, setEditableSection] = useState(null);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Fetch current profile data on component mount
  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      setIsLoading(true);
      // Assuming there's an API endpoint to get current user profile
      const response = await UserApiService.getProfile('/users/profile');
      
      setProfileData({
        profile: {
          firstName: response.data.profile?.firstName || '',
          lastName: response.data.profile?.lastName || '',
          dateOfBirth: response.data.profile?.dateOfBirth || '',
          nic: response.data.profile?.nic || '',
          phoneNumber: response.data.profile?.phoneNumber || '',
          address: response.data.profile?.address || ''
        },
        bankDetails: {
          accountHolderName: response.data.bankDetails?.accountHolderName || '',
          bankName: response.data.bankDetails?.bankName || '',
          branchName: response.data.bankDetails?.branchName || '',
          accountNumber: response.data.bankDetails?.accountNumber || ''
        },
        dependents: response.data.dependents || []
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
      setErrors({ fetch: 'Failed to load profile data. Please refresh the page.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e, section, validationType = null) => {
    const { name, value } = e.target;
    let processedValue = value;

    // Apply validation based on type
    if (validationType === 'name') {
      const nameRegex = /^[a-zA-Z\s]*$/;
      if (!nameRegex.test(value)) {
        return; // Don't update if invalid
      }
    } else if (validationType === 'phone') {
      const phoneRegex = /^[0-9]*$/;
      if (!phoneRegex.test(value)) {
        return; // Don't update if invalid
      }
      processedValue = value.substring(0, 10);
    } else if (validationType === 'accountNumber') {
      const accountRegex = /^[0-9]*$/;
      if (!accountRegex.test(value)) {
        return; // Don't update if invalid
      }
    }

    if (section) {
      setProfileData(prev => ({
        ...prev,
        [section]: {
          ...prev[section],
          [name]: processedValue
        }
      }));
    } else {
      setProfileData(prev => ({
        ...prev,
        [name]: processedValue
      }));
    }

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleNicChange = (e) => {
    let value = e.target.value.toUpperCase();
    
    // Remove any invalid characters
    value = value.replace(/[^0-9V]/g, '');
    
    if (value.includes('V')) {
      const vIndex = value.indexOf('V');
      if (vIndex === 9 && value.length <= 10) {
        value = value.substring(0, 10);
      } else if (vIndex < 9) {
        value = value.replace('V', '');
      } else {
        value = value.substring(0, 9) + 'V';
      }
    } else {
      value = value.substring(0, 12);
    }
    
    setProfileData(prev => ({
      ...prev,
      profile: {
        ...prev.profile,
        nic: value
      }
    }));
  };

  const addDependent = () => {
    const spouseCount = profileData.dependents.filter(dep => dep.relationship === 'spouse').length;
    
    setProfileData(prev => ({
      ...prev,
      dependents: [...prev.dependents, {
        name: '',
        relationship: spouseCount > 0 ? 'child' : 'spouse',
        dateOfBirth: '',
        nic: ''
      }]
    }));
  };

  const removeDependent = (index) => {
    setProfileData(prev => ({
      ...prev,
      dependents: prev.dependents.filter((_, i) => i !== index)
    }));
  };

  const updateDependent = (index, field, value, validationType = null) => {
    let processedValue = value;
    
    // Apply validation for dependent fields
    if (validationType === 'name') {
      const nameRegex = /^[a-zA-Z\s]*$/;
      if (!nameRegex.test(value)) {
        return; // Don't update if invalid
      }
    }

    setProfileData(prev => ({
      ...prev,
      dependents: prev.dependents.map((dep, i) => 
        i === index ? { ...dep, [field]: processedValue } : dep
      )
    }));
  };

  const validateSection = (sectionName) => {
    const sectionErrors = {};
    
    if (sectionName === 'profile') {
      if (!profileData.profile.firstName.trim()) {
        sectionErrors.firstName = 'First name is required';
      }
      if (!profileData.profile.lastName.trim()) {
        sectionErrors.lastName = 'Last name is required';
      }
      if (!profileData.profile.phoneNumber.trim()) {
        sectionErrors.phoneNumber = 'Phone number is required';
      } else if (profileData.profile.phoneNumber.length !== 10) {
        sectionErrors.phoneNumber = 'Phone number must be 10 digits';
      }
      if (!profileData.profile.address.trim()) {
        sectionErrors.address = 'Address is required';
      }
      if (profileData.profile.nic && profileData.profile.nic.length !== 10 && profileData.profile.nic.length !== 12) {
        sectionErrors.nic = 'Invalid NIC format';
      }
    } else if (sectionName === 'bankDetails') {
      if (!profileData.bankDetails.accountHolderName.trim()) {
        sectionErrors.accountHolderName = 'Account holder name is required';
      }
      if (!profileData.bankDetails.bankName.trim()) {
        sectionErrors.bankName = 'Bank name is required';
      }
      if (!profileData.bankDetails.branchName.trim()) {
        sectionErrors.branchName = 'Branch name is required';
      }
      if (!profileData.bankDetails.accountNumber.trim()) {
        sectionErrors.accountNumber = 'Account number is required';
      }
    }
    
    setErrors(sectionErrors);
    return Object.keys(sectionErrors).length === 0;
  };

  const handleSectionSave = async (sectionName) => {
    if (!validateSection(sectionName)) {
      return;
    }

    setIsUpdating(true);
    try {
      let updateData = {};
      
      if (sectionName === 'profile') {
        updateData = { profile: profileData.profile };
      } else if (sectionName === 'bankDetails') {
        updateData = { bankDetails: profileData.bankDetails };
      } else if (sectionName === 'dependents') {
        updateData = { dependents: profileData.dependents };
      }

      await insuranceApiService.request('/users/profile', {
        method: 'PATCH',
        body: JSON.stringify(updateData)
      });

      setEditableSection(null);
      setSuccessMessage(`${sectionName.charAt(0).toUpperCase() + sectionName.slice(1)} updated successfully!`);
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
      
    } catch (error) {
      console.error('Error updating profile:', error);
      setErrors({ update: 'Failed to update profile. Please try again.' });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSectionCancel = () => {
    setEditableSection(null);
    setErrors({});
    // Reload original data
    fetchProfileData();
  };

  const renderPersonalInformation = () => {
    const isEditing = editableSection === 'profile';
    
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <User className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
          </div>
          {!isEditing && (
            <button
              onClick={() => setEditableSection('profile')}
              className="flex items-center gap-2 px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            >
              <Edit3 className="w-4 h-4" />
              Edit
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
            {isEditing ? (
              <input
                type="text"
                name="firstName"
                value={profileData.profile.firstName}
                onChange={(e) => handleInputChange(e, 'profile', 'name')}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.firstName ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="Enter first name"
              />
            ) : (
              <p className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
                {profileData.profile.firstName || 'Not provided'}
              </p>
            )}
            {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
            {isEditing ? (
              <input
                type="text"
                name="lastName"
                value={profileData.profile.lastName}
                onChange={(e) => handleInputChange(e, 'profile', 'name')}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.lastName ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="Enter last name"
              />
            ) : (
              <p className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
                {profileData.profile.lastName || 'Not provided'}
              </p>
            )}
            {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
            {isEditing ? (
              <input
                type="date"
                name="dateOfBirth"
                value={profileData.profile.dateOfBirth}
                onChange={(e) => handleInputChange(e, 'profile')}
                min="1970-01-01"
                max="2005-12-31"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            ) : (
              <p className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
                {profileData.profile.dateOfBirth ? new Date(profileData.profile.dateOfBirth).toLocaleDateString() : 'Not provided'}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">NIC Number</label>
            {isEditing ? (
              <input
                type="text"
                name="nic"
                value={profileData.profile.nic}
                onChange={handleNicChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.nic ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="Enter NIC (e.g., 123456789V or 123456789012)"
              />
            ) : (
              <p className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
                {profileData.profile.nic || 'Not provided'}
              </p>
            )}
            {errors.nic && <p className="text-red-500 text-sm mt-1">{errors.nic}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
            {isEditing ? (
              <input
                type="tel"
                name="phoneNumber"
                value={profileData.profile.phoneNumber}
                onChange={(e) => handleInputChange(e, 'profile', 'phone')}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.phoneNumber ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="Enter 10-digit phone number"
              />
            ) : (
              <p className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
                {profileData.profile.phoneNumber || 'Not provided'}
              </p>
            )}
            {errors.phoneNumber && <p className="text-red-500 text-sm mt-1">{errors.phoneNumber}</p>}
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
            {isEditing ? (
              <textarea
                name="address"
                value={profileData.profile.address}
                onChange={(e) => handleInputChange(e, 'profile')}
                rows={3}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none ${errors.address ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="Enter full address"
              />
            ) : (
              <p className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 min-h-[80px]">
                {profileData.profile.address || 'Not provided'}
              </p>
            )}
            {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
          </div>
        </div>

        {isEditing && (
          <div className="flex gap-3 mt-6 pt-4 border-t border-gray-200">
            <button
              onClick={() => handleSectionSave('profile')}
              disabled={isUpdating}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {isUpdating ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              onClick={handleSectionCancel}
              disabled={isUpdating}
              className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50"
            >
              <X className="w-4 h-4" />
              Cancel
            </button>
          </div>
        )}
      </div>
    );
  };

  const renderBankDetails = () => {
    const isEditing = editableSection === 'bankDetails';
    
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <CreditCard className="w-5 h-5 text-green-600" />
            <h3 className="text-lg font-semibold text-gray-900">Bank Details</h3>
          </div>
          {!isEditing && (
            <button
              onClick={() => setEditableSection('bankDetails')}
              className="flex items-center gap-2 px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            >
              <Edit3 className="w-4 h-4" />
              Edit
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Account Holder Name</label>
            {isEditing ? (
              <input
                type="text"
                name="accountHolderName"
                value={profileData.bankDetails.accountHolderName}
                onChange={(e) => handleInputChange(e, 'bankDetails', 'name')}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.accountHolderName ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="Enter account holder name"
              />
            ) : (
              <p className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
                {profileData.bankDetails.accountHolderName || 'Not provided'}
              </p>
            )}
            {errors.accountHolderName && <p className="text-red-500 text-sm mt-1">{errors.accountHolderName}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Bank Name</label>
            {isEditing ? (
              <input
                type="text"
                name="bankName"
                value={profileData.bankDetails.bankName}
                onChange={(e) => handleInputChange(e, 'bankDetails', 'name')}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.bankName ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="Enter bank name"
              />
            ) : (
              <p className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
                {profileData.bankDetails.bankName || 'Not provided'}
              </p>
            )}
            {errors.bankName && <p className="text-red-500 text-sm mt-1">{errors.bankName}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Branch Name</label>
            {isEditing ? (
              <input
                type="text"
                name="branchName"
                value={profileData.bankDetails.branchName}
                onChange={(e) => handleInputChange(e, 'bankDetails', 'name')}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.branchName ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="Enter branch name"
              />
            ) : (
              <p className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
                {profileData.bankDetails.branchName || 'Not provided'}
              </p>
            )}
            {errors.branchName && <p className="text-red-500 text-sm mt-1">{errors.branchName}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Account Number</label>
            {isEditing ? (
              <input
                type="text"
                name="accountNumber"
                value={profileData.bankDetails.accountNumber}
                onChange={(e) => handleInputChange(e, 'bankDetails', 'accountNumber')}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.accountNumber ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="Enter account number"
              />
            ) : (
              <p className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
                {profileData.bankDetails.accountNumber ? '****' + profileData.bankDetails.accountNumber.slice(-4) : 'Not provided'}
              </p>
            )}
            {errors.accountNumber && <p className="text-red-500 text-sm mt-1">{errors.accountNumber}</p>}
          </div>
        </div>

        {isEditing && (
          <div className="flex gap-3 mt-6 pt-4 border-t border-gray-200">
            <button
              onClick={() => handleSectionSave('bankDetails')}
              disabled={isUpdating}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {isUpdating ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              onClick={handleSectionCancel}
              disabled={isUpdating}
              className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50"
            >
              <X className="w-4 h-4" />
              Cancel
            </button>
          </div>
        )}
      </div>
    );
  };

  const renderDependents = () => {
    const isEditing = editableSection === 'dependents';
    
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Users className="w-5 h-5 text-purple-600" />
            <h3 className="text-lg font-semibold text-gray-900">Dependents</h3>
          </div>
          {!isEditing && (
            <button
              onClick={() => setEditableSection('dependents')}
              className="flex items-center gap-2 px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            >
              <Edit3 className="w-4 h-4" />
              Edit
            </button>
          )}
        </div>

        {profileData.dependents.length === 0 ? (
          <p className="text-gray-500 text-center py-4">
            {isEditing ? 'Click "Add Dependent" to add family members' : 'No dependents added yet'}
          </p>
        ) : (
          <div className="space-y-4">
            {profileData.dependents.map((dependent, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-medium text-gray-900">Dependent {index + 1}</h4>
                  {isEditing && (
                    <button
                      type="button"
                      onClick={() => removeDependent(index)}
                      className="text-red-600 hover:text-red-800 p-1"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={dependent.name}
                        onChange={(e) => updateDependent(index, 'name', e.target.value, 'name')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter dependent name"
                      />
                    ) : (
                      <p className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-900">
                        {dependent.name || 'Not provided'}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Relationship</label>
                    {isEditing ? (
                      <select
                        value={dependent.relationship}
                        onChange={(e) => updateDependent(index, 'relationship', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="spouse">Spouse</option>
                        <option value="child">Child</option>
                      </select>
                    ) : (
                      <p className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-900 capitalize">
                        {dependent.relationship || 'Not specified'}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                    {isEditing ? (
                      <input
                        type="date"
                        value={dependent.dateOfBirth}
                        onChange={(e) => updateDependent(index, 'dateOfBirth', e.target.value)}
                        min="1970-01-01"
                        max="2025-12-31"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    ) : (
                      <p className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-900">
                        {dependent.dateOfBirth ? new Date(dependent.dateOfBirth).toLocaleDateString() : 'Not provided'}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">NIC (Optional)</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={dependent.nic}
                        onChange={(e) => {
                          let value = e.target.value.toUpperCase().replace(/[^0-9V]/g, '');
                          if (value.includes('V')) {
                            const vIndex = value.indexOf('V');
                            if (vIndex === 9 && value.length <= 10) {
                              value = value.substring(0, 10);
                            } else if (vIndex < 9) {
                              value = value.replace('V', '');
                            } else {
                              value = value.substring(0, 9) + 'V';
                            }
                          } else {
                            value = value.substring(0, 12);
                          }
                          updateDependent(index, 'nic', value);
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter NIC (e.g., 123456789V or 123456789012)"
                      />
                    ) : (
                      <p className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-900">
                        {dependent.nic || 'Not provided'}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {isEditing && (
          <div className="mt-4">
            <button
              onClick={addDependent}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Users className="w-4 h-4" />
              Add Dependent
            </button>
          </div>
        )}

        {isEditing && (
          <div className="flex gap-3 mt-6 pt-4 border-t border-gray-200">
            <button
              onClick={() => handleSectionSave('dependents')}
              disabled={isUpdating}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {isUpdating ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              onClick={handleSectionCancel}
              disabled={isUpdating}
              className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50"
            >
              <X className="w-4 h-4" />
              Cancel
            </button>
          </div>
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
                <Shield className="w-8 h-8 text-white" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">My Profile</h1>
            <p className="text-gray-600">Manage your personal information and details</p>
          </div>

          {/* Success Message */}
          {successMessage && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-3">
                <Check className="w-5 h-5 text-green-600" />
                <p className="text-green-800">{successMessage}</p>
              </div>
            </div>
          )}

          {/* Error Message */}
          {errors.update && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <p className="text-red-800">{errors.update}</p>
              </div>
            </div>
          )}

          <div className="space-y-8">
            {/* Personal Information Section */}
            {renderPersonalInformation()}

            {/* Bank Details Section */}
            {renderBankDetails()}

            {/* Dependents Section */}
            {renderDependents()}
          </div>

          {/* Footer */}
          <div className="text-center mt-8 text-gray-500">
            <p className="text-sm">
              Need help updating your profile? 
              <a href="#" className="text-blue-600 hover:text-blue-800 font-medium ml-1">
                Contact Support
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeProfileUpdate;