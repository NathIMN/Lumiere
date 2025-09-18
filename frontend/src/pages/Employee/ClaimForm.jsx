

import React, { useState } from 'react';
import { ChevronLeft, FileText, Car, Heart, Upload, Calendar, AlertCircle, Check } from 'lucide-react';
import InsuranceApiService from "../../services/insurance-api";

export const ClaimForm = () => {
  const [step, setStep] = useState(1);
  const [claimType, setClaimType] = useState('');
  const [claimOption, setClaimOption] = useState('');
  const [template, setTemplate] = useState(null);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});

  const claimOptions = {
    life: ["hospitalization", "channelling", "medication", "death"],
    vehicle: ["accident", "theft", "fire", "naturalDisaster"]
  };

  const claimTypeIcons = {
    life: Heart,
    vehicle: Car
  };

  const handleClaimTypeSelect = (type) => {
    setClaimType(type);
    setClaimOption('');
    setTemplate(null);
    setStep(2);
  };

  const handleClaimOptionSelect = async (option) => {
    setClaimOption(option);
    setLoading(true);
    setErrors({});

    try {
      const response = await InsuranceApiService.getTemplateByTypeAndOption(claimType, option);
      if (response.success) {
        setTemplate(response.template);
        setCurrentSectionIndex(0);
        setStep(3);
      } else {
        setErrors({ api: 'Failed to load claim form template' });
      }
    } catch (error) {
      console.error('Error fetching template:', error);
      setErrors({ api: 'Error loading claim form. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (questionId, value) => {
    setFormData(prev => ({
      ...prev,
      [questionId]: value
    }));

    // Clear error for this field
    if (errors[questionId]) {
      setErrors(prev => ({
        ...prev,
        [questionId]: ''
      }));
    }
  };

  const validateCurrentSection = () => {
    if (!template || !template.sections[currentSectionIndex]) return {};
    
    const newErrors = {};
    const currentSection = template.sections.sort((a, b) => a.order - b.order)[currentSectionIndex];
    
    currentSection.questions.forEach(question => {
      if (question.isRequired && !formData[question.questionId]) {
        newErrors[question.questionId] = `${question.questionText} is required`;
      }

      // Date validation
      if (question.questionType === 'date' && formData[question.questionId]) {
        const date = new Date(formData[question.questionId]);
        const today = new Date();
        
        if (question.validation?.message === "Admission date cannot be in the future" && date > today) {
          newErrors[question.questionId] = question.validation.message;
        }
        
        if (question.validation?.message === "Discharge date must be after admission date") {
          const admissionDate = new Date(formData['admission_date']);
          if (date <= admissionDate) {
            newErrors[question.questionId] = question.validation.message;
          }
        }
      }
    });

    return newErrors;
  };

  const handleNext = () => {
    const validationErrors = validateCurrentSection();
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    if (currentSectionIndex < template.sections.length - 1) {
      setCurrentSectionIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentSectionIndex > 0) {
      setCurrentSectionIndex(prev => prev - 1);
      setErrors({});
    }
  };

  const handleSubmit = () => {
    const validationErrors = validateCurrentSection();
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    // Handle form submission here
    console.log('Form submitted:', {
      claimType,
      claimOption,
      formData
    });
    
    alert('Claim submitted successfully!');
  };

  const renderQuestion = (question) => {
    const value = formData[question.questionId] || '';
    const hasError = errors[question.questionId];

    switch (question.questionType) {
      case 'text':
        return (
          <div key={question.questionId} className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {question.questionText}
              {question.isRequired && <span className="text-red-500 ml-1">*</span>}
            </label>
            {question.helpText && (
              <p className="text-xs text-gray-500">{question.helpText}</p>
            )}
            <input
              type="text"
              value={value}
              onChange={(e) => handleInputChange(question.questionId, e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                hasError ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder={question.helpText || ''}
            />
            {hasError && (
              <p className="text-red-500 text-sm flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors[question.questionId]}
              </p>
            )}
          </div>
        );

      case 'date':
        return (
          <div key={question.questionId} className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {question.questionText}
              {question.isRequired && <span className="text-red-500 ml-1">*</span>}
            </label>
            <div className="relative">
              <input
                type="date"
                value={value}
                onChange={(e) => handleInputChange(question.questionId, e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  hasError ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              <Calendar className="absolute right-3 top-2.5 w-5 h-5 text-gray-400 pointer-events-none" />
            </div>
            {hasError && (
              <p className="text-red-500 text-sm flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors[question.questionId]}
              </p>
            )}
          </div>
        );

      case 'select':
        return (
          <div key={question.questionId} className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {question.questionText}
              {question.isRequired && <span className="text-red-500 ml-1">*</span>}
            </label>
            <select
              value={value}
              onChange={(e) => handleInputChange(question.questionId, e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                hasError ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">Select an option</option>
              {question.options.map((option, index) => (
                <option key={index} value={option}>{option}</option>
              ))}
            </select>
            {hasError && (
              <p className="text-red-500 text-sm flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors[question.questionId]}
              </p>
            )}
          </div>
        );

      case 'file':
        return (
          <div key={question.questionId} className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {question.questionText}
              {question.isRequired && <span className="text-red-500 ml-1">*</span>}
            </label>
            {question.helpText && (
              <p className="text-xs text-gray-500">{question.helpText}</p>
            )}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
              <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Click to upload or drag and drop files here</p>
              <input
                type="file"
                multiple
                onChange={(e) => handleInputChange(question.questionId, Array.from(e.target.files))}
                className="hidden"
              />
            </div>
            {hasError && (
              <p className="text-red-500 text-sm flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors[question.questionId]}
              </p>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  const goBack = () => {
    if (step === 2) {
      setStep(1);
      setClaimType('');
    } else if (step === 3) {
      if (currentSectionIndex > 0) {
        handlePrevious();
      } else {
        setStep(2);
        setClaimOption('');
        setTemplate(null);
        setCurrentSectionIndex(0);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Insurance Claim Request</h1>
          <p className="text-gray-600">Submit your claim by following the steps below</p>
        </div>

        {/* Progress Indicator - Only show for form sections */}
        {step === 3 && template && (
          <div className="mb-8">
            <div className="flex items-center justify-center space-x-6 overflow-x-auto px-4">
              {template.sections
                .sort((a, b) => a.order - b.order)
                .map((section, index) => (
                  <div key={section._id} className="flex flex-col items-center flex-shrink-0 min-w-0">
                    <div className="flex items-center mb-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300 ${
                        index < currentSectionIndex 
                          ? 'bg-green-500 text-white' 
                          : index === currentSectionIndex
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 text-gray-600'
                      }`}>
                        {index < currentSectionIndex ? (
                          <Check className="w-6 h-6" />
                        ) : (
                          index + 1
                        )}
                      </div>
                      {index < template.sections.length - 1 && (
                        <div className={`w-16 h-1 mx-3 transition-all duration-300 ${
                          index < currentSectionIndex ? 'bg-green-500' : 'bg-gray-200'
                        }`} />
                      )}
                    </div>
                    <span className={`text-xs text-center max-w-28 leading-tight transition-colors duration-300 ${
                      index === currentSectionIndex 
                        ? 'font-semibold text-blue-600' 
                        : index < currentSectionIndex
                        ? 'text-green-600 font-medium'
                        : 'text-gray-500'
                    }`}>
                      {section.title}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          {step > 1 && (
            <button
              onClick={goBack}
              className="flex items-center text-gray-600 hover:text-gray-800 mb-6 transition-colors"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Back
            </button>
          )}

          {/* Step 1: Claim Type Selection */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">Select Claim Type</h2>
                <p className="text-gray-600">Choose the type of insurance claim you want to submit</p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {Object.keys(claimOptions).map((type) => {
                  const IconComponent = claimTypeIcons[type];
                  return (
                    <button
                      key={type}
                      onClick={() => handleClaimTypeSelect(type)}
                      className="p-8 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 text-center group"
                    >
                      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-200 transition-colors">
                        <IconComponent className="w-8 h-8 text-blue-600" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 capitalize mb-2">{type} Insurance</h3>
                      <p className="text-gray-600">Submit a claim for your {type} insurance policy</p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 2: Claim Option Selection */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                  Select {claimType.charAt(0).toUpperCase() + claimType.slice(1)} Claim Type
                </h2>
                <p className="text-gray-600">Choose the specific type of claim you want to submit</p>
              </div>

              {errors.api && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                  <p className="text-red-700 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    {errors.api}
                  </p>
                </div>
              )}

              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {claimOptions[claimType].map((option) => (
                  <button
                    key={option}
                    onClick={() => handleClaimOptionSelect(option)}
                    disabled={loading}
                    className="p-6 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 text-center disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <FileText className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                    <h3 className="font-medium text-gray-900 capitalize">{option}</h3>
                  </button>
                ))}
              </div>

              {loading && (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <p className="mt-2 text-gray-600">Loading claim form...</p>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Form Details - One Section at a Time */}
          {step === 3 && template && (
            <div className="space-y-8">
              {(() => {
                const sortedSections = template.sections.sort((a, b) => a.order - b.order);
                const currentSection = sortedSections[currentSectionIndex];
                const isLastSection = currentSectionIndex === sortedSections.length - 1;

                return (
                  <>
                    <div className="text-center mb-8">
                      <h2 className="text-2xl font-semibold text-gray-900 mb-2">{currentSection.title}</h2>
                      <p className="text-gray-600">{currentSection.description}</p>
                      <p className="text-sm text-gray-500 mt-2">
                        Section {currentSectionIndex + 1} of {sortedSections.length}
                      </p>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-6">
                      <div className="space-y-6">
                        {currentSection.questions
                          .sort((a, b) => a.order - b.order)
                          .map(renderQuestion)}
                      </div>
                    </div>

                    <div className="flex justify-between pt-6">
                      <button
                        onClick={goBack}
                        className="bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                      >
                        {currentSectionIndex === 0 ? 'Back to Options' : 'Previous'}
                      </button>

                      {isLastSection ? (
                        <button
                          onClick={handleSubmit}
                          className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium"
                        >
                          Submit Claim
                        </button>
                      ) : (
                        <button
                          onClick={handleNext}
                          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                        >
                          Next Section
                        </button>
                      )}
                    </div>
                  </>
                );
              })()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

