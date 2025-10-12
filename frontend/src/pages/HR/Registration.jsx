/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { Shield, CheckCircle, Users } from 'lucide-react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import SteppedProgress from '../../components/common/SteppedProgress';
import BasicInformation from "../../components/registration/BasicInformation";
import PersonalInformation from "../../components/registration/PersonalInformation";
import EmploymentDetails from "../../components/registration/EmploymentDetails";
import BankDetails from "../../components/registration/BankDetails";
import Dependents from "../../components/registration/Dependents";

import { validateForm } from '../../utils/validation';
import { initialFormData } from '../../utils/constants';
import userApiService from '../../services/user-api';

export const Registration = () => {
  const navigate = useNavigate();
  
  // Debug: Check if navigate is available
  useEffect(() => {
    console.log('Navigate function available:', typeof navigate === 'function');
  }, []);
  
  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [allowSubmission, setAllowSubmission] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [registeredEmployee, setRegisteredEmployee] = useState(null);

  const totalSteps = 5;

  const handleInputChange = (e, section = null, validationType = null) => {
    const { name, value } = e.target;
    let processedValue = value;

    // Apply validation based on type
    if (validationType === 'name') {
      const nameRegex = /^[a-zA-Z\s]*$/;
      if (!nameRegex.test(value)) {
        return;
      }
    } else if (validationType === 'phone') {
      const phoneRegex = /^[0-9]*$/;
      if (!phoneRegex.test(value)) {
        return;
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
    
    if (name === 'confirmPassword' && errors.confirmPassword) {
      setErrors(prev => ({
        ...prev,
        confirmPassword: ''
      }));
    }
    
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
    
    if (validationType === 'name') {
      const nameRegex = /^[a-zA-Z\s]*$/;
      if (!nameRegex.test(value)) {
        return;
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
        ['email', 'password', 'confirmPassword'].forEach(field => {
          if (validationErrors[field]) {
            stepErrors[field] = validationErrors[field];
          }
        });
        break;
        
      case 2:
        ['firstName', 'lastName', 'dateOfBirth', 'nic', 'phoneNumber', 'address'].forEach(field => {
          if (validationErrors[field]) {
            stepErrors[field] = validationErrors[field];
          }
        });
        break;
        
      case 3:
        ['department', 'designation', 'joinDate', 'salary'].forEach(field => {
          if (validationErrors[field]) {
            stepErrors[field] = validationErrors[field];
          }
        });
        break;
        
      case 4:
        ['accountHolderName', 'bankName', 'branchName', 'accountNumber'].forEach(field => {
          if (validationErrors[field]) {
            stepErrors[field] = validationErrors[field];
          }
        });
        break;
        
      case 5:
        break;
    }
    
    setErrors(stepErrors);
    return Object.keys(stepErrors).length === 0;
  };

  const handleNext = () => {
    if (validateCurrentStep()) {
      if (!completedSteps.includes(currentStep)) {
        setCompletedSteps(prev => [...prev, currentStep]);
      }
      
      if (currentStep < totalSteps) {
        const nextStep = currentStep + 1;
        setCurrentStep(nextStep);
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
    e.preventDefault();
    e.stopPropagation();
    
    if (isSubmitting) {
      return;
    }
    
    if (!allowSubmission) {
      return;
    }
    
    if (currentStep !== totalSteps) {
      return;
    }
    
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const validationErrors = validateForm(formData);
    setErrors(validationErrors);
    
    if (Object.keys(validationErrors).length > 0) {
      console.error('Validation errors:', validationErrors);
      alert('Please fix validation errors before submitting');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Log the form data before sending
      console.log('Form Data being submitted:', formData);
      
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

      // Log the userData being sent to API
      console.log('User Data being sent to API:', JSON.stringify(userData, null, 2));

      const response = await userApiService.register(userData);
      
      console.log('Registration response:', response);
      
      // Store registered employee data
      setRegisteredEmployee({
        fullName: `${formData.profile.firstName} ${formData.profile.lastName}`,
        email: formData.email,
        department: formData.employment.department,
        designation: formData.employment.designation
      });
      
      // Show success modal
      setShowSuccessModal(true);
      
    } catch (error) {
      console.error('Registration error:', error);
      console.error('Error details:', error.details);
      console.error('Error response:', error.response);
      
      let errorMessage = 'Registration failed. Please try again.';
      
      // Better error handling
      if (error.response?.data?.message) {
        errorMessage = `Registration failed: ${error.response.data.message}`;
      } else if (error.details?.message) {
        errorMessage = `Registration failed: ${error.details.message}`;
      } else if (error.message && error.message !== 'API request failed') {
        errorMessage = `Registration failed: ${error.message}`;
      }
      
      // Show detailed error in console for debugging
      console.error('Full error object:', JSON.stringify(error, null, 2));
      
      alert(errorMessage);
    } finally {
      setIsSubmitting(false);
      setAllowSubmission(false);
    }
  };

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
    // Reset form
    setFormData(initialFormData);
    setCurrentStep(1);
    setCompletedSteps([]);
    setRegisteredEmployee(null);
  };

  const handleViewEmployees = () => {
    console.log('Navigating to employee directory...');
    
    // Close modal first
    setShowSuccessModal(false);
    
    // Navigate to the correct route with underscore (as defined in AllRoutes.jsx)
    setTimeout(() => {
      try {
        navigate('/hr/employee', { 
          state: { refresh: true, newEmployee: registeredEmployee },
          replace: false 
        });
        console.log('✓ Navigation successful');
      } catch (error) {
        console.error('Navigation error:', error);
        window.location.href = '/hr/employee';
      }
    }, 100);
  };

  const SuccessModal = () => {
    if (!showSuccessModal || !registeredEmployee) return null;

    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg max-w-md w-full p-8 shadow-2xl animate-fadeIn">
          {/* Success Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
          </div>

          {/* Success Message */}
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Registration Successful!
            </h2>
            <p className="text-gray-600">
              Employee has been successfully registered in the system.
            </p>
          </div>

          {/* Employee Details */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6 space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Name:</span>
              <span className="text-sm font-medium text-gray-900">{registeredEmployee.fullName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Email:</span>
              <span className="text-sm font-medium text-gray-900">{registeredEmployee.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Department:</span>
              <span className="text-sm font-medium text-gray-900">{registeredEmployee.department}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Designation:</span>
              <span className="text-sm font-medium text-gray-900">{registeredEmployee.designation}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={handleViewEmployees}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              <Users className="w-5 h-5" />
              View Employee Directory
            </button>
            
            <button
              onClick={handleCloseSuccessModal}
              className="w-full px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
            >
              Register Another Employee
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <BasicInformation 
            formData={formData} 
            errors={errors} 
            onChange={handleInputChange} 
          />
        );
      case 2:
        return (
          <PersonalInformation 
            formData={formData.profile || {}} 
            errors={errors} 
            onChange={handleInputChange} 
          />
        );
      case 3:
        return (
          <EmploymentDetails 
            formData={formData.employment || {}} 
            errors={errors} 
            onChange={handleInputChange} 
          />
        );
      case 4:
        return (
          <BankDetails 
            formData={formData.bankDetails || {}} 
            errors={errors} 
            onChange={handleInputChange} 
          />
        );
      case 5:
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
              <div className="w-16 h-16 bg-red-900 rounded-full flex items-center justify-center">
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
                    const form = e.target.closest('form');
                    if (form) {
                      setAllowSubmission(true);
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

      {/* Success Modal */}
      <SuccessModal />

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};