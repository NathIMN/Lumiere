import React, { useState } from 'react';
import { Shield } from 'lucide-react';
import BasicInformation from "../../components/registration/BasicInformation";
import PersonalInformation from "../../components/registration/PersonalInformation";
import EmploymentDetails from "../../components/registration/EmploymentDetails";
import BankDetails from "../../components/registration/BankDetails";
import Dependents from "../../components/registration/Dependents";
import InsuranceProviderDetails from '../../components/registration/InsuaranceProviderDetails';

import { validateForm } from '../../utils/validation';
import { initialFormData } from '../../utils/constants';

const UserRegistrationPage = () => {
  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e, section = null, validationType = null) => {
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
    }

    if (section) {
      setFormData(prev => ({
        ...prev,
        [section]: {
          ...prev[section],
          [name]: processedValue
        }
      }));
    } else {
      setFormData(prev => ({
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
    
    // Special handling for confirm password validation
    if (name === 'confirmPassword' && errors.confirmPassword) {
      setErrors(prev => ({
        ...prev,
        confirmPassword: ''
      }));
    }
    
    // Clear confirm password error when password changes
    if (name === 'password' && errors.confirmPassword) {
      setErrors(prev => ({
        ...prev,
        confirmPassword: ''
      }));
    }
  };

  const addDependent = () => {
    const spouseCount = formData.dependents.filter(dep => dep.relationship === 'spouse').length;
    
    setFormData(prev => ({
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
    setFormData(prev => ({
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

    setFormData(prev => ({
      ...prev,
      dependents: prev.dependents.map((dep, i) => 
        i === index ? { ...dep, [field]: processedValue } : dep
      )
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationErrors = validateForm(formData);
    setErrors(validationErrors);
    
    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Remove confirmPassword before sending - using underscore to indicate intentionally unused
      const { confirmPassword: _, ...submitData } = formData;
      
      console.log('Registration data:', submitData);
      alert('Registration successful! (This is a demo)');
      
    } catch (error) {
      console.error('Registration error:', error);
      alert('Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderRoleSpecificFields = () => {
    if (formData.role === 'employee') {
      return (
        <>
          <EmploymentDetails 
            formData={formData.employment} 
            errors={errors} 
            onChange={handleInputChange} 
          />
          <BankDetails 
            formData={formData.bankDetails} 
            errors={errors} 
            onChange={handleInputChange} 
          />
          <Dependents 
            dependents={formData.dependents}
            onAdd={addDependent}
            onRemove={removeDependent}
            onUpdate={updateDependent}
          />
        </>
      );
    }

    if (formData.role === 'insurance_agent') {
      return (
        <InsuranceProviderDetails 
          formData={formData.insuranceProvider} 
          errors={errors} 
          onChange={handleInputChange} 
        />
      );
    }

    return null;
  };

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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Employee Registration</h1>
            <p className="text-gray-600">Insurance Claim Management System</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <BasicInformation 
              formData={formData} 
              errors={errors} 
              onChange={handleInputChange} 
            />
            
            <PersonalInformation 
              formData={formData.profile} 
              errors={errors} 
              onChange={handleInputChange} 
            />

            {renderRoleSpecificFields()}

            {/* Submit Button */}
            <div className="flex justify-center">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`px-8 py-3 rounded-lg font-medium text-white transition-all ${
                  isSubmitting 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-700 hover:shadow-lg transform hover:-translate-y-0.5'
                }`}
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Registering...
                  </div>
                ) : (
                  'Register User'
                )}
              </button>
            </div>
          </form>

          {/* Footer */}
          <div className="text-center mt-8 text-gray-500">
            <p className="text-sm">
              Already have an account? 
              <a href="#" className="text-blue-600 hover:text-blue-800 font-medium ml-1">
                Sign in here
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserRegistrationPage;