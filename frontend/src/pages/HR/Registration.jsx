import React, { useState } from 'react';
import { Shield } from 'lucide-react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import SteppedProgress from '../../components/common/SteppedProgress';
import BasicInformation from "../../components/registration/BasicInformation";
import PersonalInformation from "../../components/registration/PersonalInformation";
import EmploymentDetails from "../../components/registration/EmploymentDetails";
import BankDetails from "../../components/registration/BankDetails";
import Dependents from "../../components/registration/Dependents";
import InsuranceProviderDetails from '../../components/registration/InsuaranceProviderDetails';

import { validateForm } from '../../utils/validation';
import { initialFormData } from '../../utils/constants';
import userApiService from '../../services/user-api';

export const Registration = () => {
  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [allowSubmission, setAllowSubmission] = useState(false);

  const totalSteps = 5;

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

  const validateCurrentStep = () => {
    const validationErrors = validateForm(formData);
    
    let stepErrors = {};
    
    switch (currentStep) {
      case 1:
        // Basic Information validation
        ['email', 'password', 'confirmPassword'].forEach(field => {
          if (validationErrors[field]) {
            stepErrors[field] = validationErrors[field];
          }
        });
        break;
        
      case 2:
        // Personal Information validation
        ['firstName', 'lastName', 'dateOfBirth', 'nic', 'phoneNumber', 'address'].forEach(field => {
          if (validationErrors[field]) {
            stepErrors[field] = validationErrors[field];
          }
        });
        break;
        
      case 3:
        // Employment Details validation
        ['department', 'designation', 'joinDate', 'salary'].forEach(field => {
          if (validationErrors[field]) {
            stepErrors[field] = validationErrors[field];
          }
        });
        break;
        
      case 4:
        // Bank Details validation
        ['accountHolderName', 'bankName', 'branchName', 'accountNumber'].forEach(field => {
          if (validationErrors[field]) {
            stepErrors[field] = validationErrors[field];
          }
        });
        break;
        
      case 5:
        // Dependents validation (optional step - no required fields)
        break;
    }
    
    setErrors(stepErrors);
    return Object.keys(stepErrors).length === 0;
  };

  const handleNext = () => {
   console.log("cliacked next ")
    if (validateCurrentStep()) {
      // Mark current step as completed
      if (!completedSteps.includes(currentStep)) {
        setCompletedSteps(prev => [...prev, currentStep]);
      }
      
      if (currentStep < totalSteps) {
        const nextStep = currentStep + 1;
        setCurrentStep(nextStep);
        // Reset submission permission for new step
        setAllowSubmission(false);
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async (e) => {
   console.log("clicked submit ")
    e.preventDefault();
    e.stopPropagation();
    
    // Prevent double submissions
    if (isSubmitting) {
      return;
    }
    
    // Prevent auto-submission - require explicit user action
    if (!allowSubmission) {
      return;
    }
    
    // Ensure we're on the final step before submitting
    if (currentStep !== totalSteps) {
      return;
    }
    
    // Add a small delay to ensure this is an intentional submission
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const validationErrors = validateForm(formData);
    setErrors(validationErrors);
    
    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Create user data in the exact format your API expects
      const userData = {
        email: formData.email,
        password: formData.password,
        role: 'employee',
        profile: {
          firstName: formData.profile?.firstName || '',
          lastName: formData.profile?.lastName || '',
          dateOfBirth: formData.profile?.dateOfBirth || '',
          nic: formData.profile?.nic || '',
          phoneNumber: formData.profile?.phoneNumber || '',
          address: formData.profile?.address || ''
        },
        employment: {
          department: formData.employment?.department || '',
          designation: formData.employment?.designation || '',
          employmentType: formData.employment?.employmentType || 'permanent',
          joinDate: formData.employment?.joinDate || new Date().toISOString().split('T')[0],
          salary: Number(formData.employment?.salary) || 0
        },
        bankDetails: {
          accountHolderName: formData.bankDetails?.accountHolderName || '',
          bankName: formData.bankDetails?.bankName || '',
          branchName: formData.bankDetails?.branchName || '',
          accountNumber: formData.bankDetails?.accountNumber || ''
        }
      };

      // Only add dependents if they exist and are complete
      if (formData.dependents && formData.dependents.length > 0) {
        userData.dependents = formData.dependents
          .filter(dep => dep.name && dep.relationship && dep.dateOfBirth)
          .map(dep => ({
            name: dep.name,
            relationship: dep.relationship,
            dateOfBirth: dep.dateOfBirth,
            nic: dep.nic || ''
          }));
      }

      // Register the user
      const response = await userApiService.register(userData);
      
      alert('Employee registered successfully!');
      
      // Reset form
      setFormData(initialFormData);
      setCurrentStep(1);
      setCompletedSteps([]);
      
    } catch (error) {
      // Show more detailed error message to user
      let errorMessage = 'Registration failed. Please try again.';
      if (error.details && error.details.message) {
        errorMessage = `Registration failed: ${error.details.message}`;
      } else if (error.message && error.message !== 'API request failed') {
        errorMessage = `Registration failed: ${error.message}`;
      }
      
      alert(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
         console.log("step: ", currentStep);
        return (
          <BasicInformation 
            formData={formData} 
            errors={errors} 
            onChange={handleInputChange} 
          />
        );
      case 2:
         console.log("step: ", currentStep);
        return (
          <PersonalInformation 
            formData={formData.profile || {}} 
            errors={errors} 
            onChange={handleInputChange} 
          />
        );
      case 3:
         console.log("step: ", currentStep);
        return (
          <EmploymentDetails 
            formData={formData.employment || {}} 
            errors={errors} 
            onChange={handleInputChange} 
          />
        );
      case 4:
         console.log("step: ", currentStep);
        return (
          <BankDetails 
            formData={formData.bankDetails || {}} 
            errors={errors} 
            onChange={handleInputChange} 
          />
        );
      case 5:
         console.log("step: ", currentStep);
        return (
          <Dependents 
            dependents={formData.dependents || []}
            onAdd={addDependent}
            onRemove={removeDependent}
            onUpdate={updateDependent}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen">
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

          {/* Stepped Progress */}
          <SteppedProgress currentStep={currentStep} completedSteps={completedSteps} />

          <form onSubmit={handleSubmit} className="space-y-8" noValidate>
            {/* Current Step Content */}
            {renderCurrentStep()}

            {/* Navigation Buttons */}
            <div className="flex justify-between items-center pt-6">
              <button
                type="button"
                onClick={handlePrevious}
                disabled={currentStep === 1}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
                  currentStep === 1
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-600 text-white hover:bg-gray-700 hover:shadow-lg transform hover:-translate-y-0.5'
                }`}
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </button>

              <div className="text-sm text-gray-500">
                {currentStep} of {totalSteps}
              </div>

              {currentStep < totalSteps ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 hover:shadow-lg transform hover:-translate-y-0.5 transition-all"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={async (e) => {
                    // Manually trigger form submission
                    const form = e.target.closest('form');
                    if (form) {
                      setAllowSubmission(true);
                      // Small delay to ensure state is updated
                      setTimeout(() => {
                        const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
                        form.dispatchEvent(submitEvent);
                      }, 10);
                    }
                  }}
                  className={`px-8 py-3 rounded-lg font-medium text-white transition-all ${
                    isSubmitting 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-green-600 hover:bg-green-700 hover:shadow-lg transform hover:-translate-y-0.5'
                  }`}
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Registering...
                    </div>
                  ) : (
                    'Register Employee'
                  )}
                </button>
              )}
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