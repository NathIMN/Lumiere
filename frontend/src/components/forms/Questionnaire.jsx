// components/Questionnaire.jsx
import React, { useState, useEffect } from 'react';
import { ChevronLeft, FileText, Calendar, AlertCircle, Check, Upload } from 'lucide-react';
import InsuranceApiService from "../../services/insurance-api";

export const Questionnaire = ({ 
  claimId,
  questionnaire,
  setQuestionnaire,
  selectedPolicy,
  onComplete,
  initialFormData = {}
}) => {
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

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

  // Helper function to get sections from questionnaire
  const getSections = () => {
    if (!questionnaire?.sections) return [];

    return questionnaire.sections
      .sort((a, b) => a.order - b.order)
      .map(section => ({
        title: section.title,
        description: section.description,
        questions: section.responses || section.questions || [],
        order: section.order,
        sectionId: section.sectionId,
        isComplete: section.isComplete
      }));
  };

  const validateCurrentSection = () => {
    if (!questionnaire?.questions) return {};

    const newErrors = {};
    const sections = getSections();
    const currentSection = sections[currentSectionIndex];

    if (!currentSection) return {};

    currentSection.questions.forEach(question => {
      if (question.isRequired && !formData[question.questionId]) {
        newErrors[question.questionId] = `${question.questionText} is required`;
      }
    });

    return newErrors;
  };

  const saveAnswers = async (sectionId = null) => {
    if (!claimId || !questionnaire) return;

    setSaving(true);
    try {
      let answersToSave = Object.entries(formData)
        .filter(([_, value]) => value !== '' && value !== null && value !== undefined)
        .map(([questionId, value]) => ({
          questionId,
          value
        }));

      if (sectionId) {
        const sections = getSections();
        const targetSection = sections.find(s => s.sectionId === sectionId);
        if (targetSection) {
          const sectionQuestionIds = targetSection.questions.map(q => q.questionId);
          answersToSave = answersToSave.filter(answer =>
            sectionQuestionIds.includes(answer.questionId)
          );
        }
      }

      if (answersToSave.length === 0) {
        setSaving(false);
        return;
      }

      let response;

      if (sectionId) {
        response = await InsuranceApiService.submitQuestionnaireSectionAnswers(claimId, sectionId, answersToSave)
      } else {
        response = await InsuranceApiService.submitQuestionnaireAnswers(claimId, answersToSave);
      }

      if (response.success) {
        if (response.questionnaire) {
          setQuestionnaire(response.questionnaire);
        } else if (response.section && response.progress) {
          setQuestionnaire(prev => ({
            ...prev,
            isComplete: response.progress.questionnaireComplete,
            answeredQuestions: response.progress.answeredQuestions,
            sections: prev.sections.map(section =>
              section.sectionId === sectionId
                ? { ...section, ...response.section, isComplete: response.progress.sectionComplete }
                : section
            )
          }));
        }
      } else {
        setErrors({ save: 'Failed to save answers' });
      }
    } catch (error) {
      console.error('Error saving answers:', error);
      setErrors({ save: error.message || 'Error saving answers. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  const handleNext = async () => {
    const validationErrors = validateCurrentSection();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});

    const sections = getSections();
    const currentSection = sections[currentSectionIndex];
    if (currentSection?.sectionId) {
      await saveAnswers(currentSection.sectionId);
    } else {
      await saveAnswers();
    }

    if (questionnaire && currentSectionIndex < sections.length - 1) {
      setCurrentSectionIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentSectionIndex > 0) {
      setCurrentSectionIndex(prev => prev - 1);
      setErrors({});
    }
  };

  const handleSubmit = async () => {
    const validationErrors = validateCurrentSection();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    await saveAnswers();

    if (!questionnaire?.isComplete) {
      setErrors({ submit: 'Please complete all required questions before submitting' });
      return;
    }

    await InsuranceApiService.updateClaimStatus(claimId, 'employee');
    onComplete(formData);
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
            <input
              type="text"
              value={value}
              onChange={(e) => handleInputChange(question.questionId, e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                hasError ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {hasError && (
              <p className="text-red-500 text-sm flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors[question.questionId]}
              </p>
            )}
          </div>
        );

      case 'number':
        return (
          <div key={question.questionId} className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {question.questionText}
              {question.isRequired && <span className="text-red-500 ml-1">*</span>}
            </label>
            <input
              type="number"
              value={value}
              onChange={(e) => handleInputChange(question.questionId, e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                hasError ? 'border-red-500' : 'border-gray-300'
              }`}
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

      case 'boolean':
        return (
          <div key={question.questionId} className="space-y-2">
            <div className="flex items-start space-x-3">
              <input
                type="checkbox"
                id={question.questionId}
                checked={value === true || value === 'true'}
                onChange={(e) => handleInputChange(question.questionId, e.target.checked)}
                className={`mt-1 w-4 h-4 text-blue-600 border rounded focus:ring-blue-500 ${
                  hasError ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              <label htmlFor={question.questionId} className="block text-sm font-medium text-gray-700">
                {question.questionText}
                {question.isRequired && <span className="text-red-500 ml-1">*</span>}
              </label>
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
              {question.options?.map((option, index) => (
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
            <div className={`border-2 border-dashed rounded-lg p-6 text-center hover:border-gray-400 transition-colors ${
              hasError ? 'border-red-300' : 'border-gray-300'
            }`}>
              <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600 mb-2">Click to upload or drag and drop files here</p>
              <input
                type="file"
                multiple
                onChange={(e) => handleInputChange(question.questionId, Array.from(e.target.files))}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              {formData[question.questionId] && Array.isArray(formData[question.questionId]) && (
                <div className="mt-2 text-sm text-gray-600">
                  {formData[question.questionId].length} file(s) selected
                </div>
              )}
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

  if (!questionnaire) {
    return (
      <div className="text-center py-8">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="mt-2 text-gray-600">Loading questionnaire...</p>
      </div>
    );
  }

  const sections = getSections();
  const currentSection = sections[currentSectionIndex];
  const isLastSection = currentSectionIndex === sections.length - 1;

  return (
    <div className="space-y-8">
      {/* Progress Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-center space-x-6 overflow-x-auto px-4">
          {sections.map((section, index) => (
            <div key={index} className="flex flex-col items-center flex-shrink-0 min-w-0">
              <div className="flex items-center mb-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300 ${
                  index < currentSectionIndex || section.isComplete
                    ? 'bg-green-500 text-white'
                    : index === currentSectionIndex
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-600'
                }`}>
                  {index < currentSectionIndex || section.isComplete ? (
                    <Check className="w-6 h-6" />
                  ) : (
                    index + 1
                  )}
                </div>
                {index < sections.length - 1 && (
                  <div className={`w-16 h-1 mx-3 transition-all duration-300 ${
                    index < currentSectionIndex ? 'bg-green-500' : 'bg-gray-200'
                  }`} />
                )}
              </div>
              <span className={`text-xs text-center max-w-28 leading-tight transition-colors duration-300 ${
                section.isComplete
                  ? 'text-green-600 font-medium'
                  : index === currentSectionIndex
                    ? 'font-semibold text-blue-600'
                    : 'text-gray-500'
              }`}>
                {section.title}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Error display for save errors */}
      {errors.save && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-700 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            {errors.save}
          </p>
        </div>
      )}

      <div className='bg-white p-6 shadow-lg rounded-xl'>
      {/* Save button */}
      <div className="flex justify-end mb-6">
        <button
          onClick={() => saveAnswers()}
          disabled={saving}
          className="flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? (
            <>
              <div className="w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin"></div>
              Saving...
            </>
          ) : (
            <>
              <FileText className="w-4 h-4" />
              Save Draft
            </>
          )}
        </button>
      </div>

      {/* Current Section */}
      {currentSection ? (
        <>
          <div className="text-center mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">{currentSection.title}</h2>
            <p className="text-gray-600">Complete the questions in this section</p>
            <p className="text-sm text-gray-500 mt-2">
              Section {currentSectionIndex + 1} of {sections.length} | Policy: {selectedPolicy.policyId}
            </p>
            <div className="mt-4 bg-blue-50 rounded-lg p-3">
              <p className="text-sm text-blue-700">
                Progress: {questionnaire.answeredQuestions}/{questionnaire.totalQuestions} questions completed
                {questionnaire.isComplete && (
                  <span className="ml-2 text-green-700 font-medium">✓ All questions completed</span>
                )}
              </p>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-6">
            <div className="space-y-6">
              {currentSection.questions.map(renderQuestion)}
            </div>
          </div>

          <div className="flex justify-between pt-6">
            <button
              onClick={handlePrevious}
              disabled={currentSectionIndex === 0}
              className="bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>

            {isLastSection ? (
              <button
                onClick={handleSubmit}
                disabled={!questionnaire.isComplete}
                className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {questionnaire.isComplete ? 'Complete Questionnaire' : 'Complete All Questions First'}
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Save & Next Section
              </button>
            )}
          </div>
        </>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-600">No questions available for this section.</p>
        </div>
      )}
      </div>
    </div>
  );
};