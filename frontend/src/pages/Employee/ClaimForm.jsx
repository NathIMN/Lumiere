import React, { useState, useEffect } from 'react';
import { ChevronLeft, FileText, Car, Heart, Upload, Calendar, AlertCircle, Check, X } from 'lucide-react';
import InsuranceApiService from "../../services/insurance-api";
import { useNavigate } from "react-router-dom";
//import { QuestionRenderer } from './QuestionRenderer'; // Add this import

export const ClaimForm = () => {
   const [step, setStep] = useState(1);
   const [selectedPolicy, setSelectedPolicy] = useState(null);
   const [claimOption, setClaimOption] = useState('');
   const [template, setTemplate] = useState(null);
   const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
   const [loading, setLoading] = useState(false);
   const [formData, setFormData] = useState({});
   const [errors, setErrors] = useState({});
   const [userPolicies, setUserPolicies] = useState([]);
   const [policiesLoading, setPoliciesLoading] = useState(true);
   const [claimId, setClaimId] = useState(null);
   const [questionnaire, setQuestionnaire] = useState(null);
   const [saving, setSaving] = useState(false);
   const [claimAmount, setClaimAmount] = useState('');
   const [submitting, setSubmitting] = useState(false);
   const [submitted, setSubmitted] = useState(false);
   const [additionalDocuments, setAdditionalDocuments] = useState([]);
   const [showSuccessModal, setShowSuccessModal] = useState(false);

   const navigate = useNavigate();

   const claimOptions = {
      life: ["hospitalization", "channelling", "medication", "death"],
      vehicle: ["accident", "theft", "fire", "naturalDisaster"]
   };

   const claimTypeIcons = {
      life: Heart,
      vehicle: Car
   };

   // Fetch user policies on component mount
   useEffect(() => {
      fetchUserPolicies();
   }, []);

   const fetchUserPolicies = async () => {
      setPoliciesLoading(true);
      try {
         const response = await InsuranceApiService.getUserPolicies({ status: 'active' });
         if (response.success) {
            setUserPolicies(response.policies);
         } else {
            setErrors({ policies: 'Failed to load your policies' });
         }
      } catch (error) {
         console.error('Error fetching policies:', error);
         setErrors({ policies: error.message || 'Error loading your policies. Please try again.' });
      } finally {
         setPoliciesLoading(false);
      }
   };

   const handlePolicySelect = (policy) => {
      setSelectedPolicy(policy);
      setClaimOption('');
      setTemplate(null);
      setStep(2);
   };

   const handleClaimOptionSelect = async (option) => {
      setClaimOption(option);
      setLoading(true);
      setErrors({});

      try {
         // Create claim draft - this returns both claim and questionnaire data
         const response = await InsuranceApiService.createClaim({
            policy: selectedPolicy._id, // Use MongoDB ObjectId instead of policyId
            claimType: selectedPolicy.policyType,
            claimOption: option
         });

         if (response.success) {
            const claim = response.claim;
            setClaimId(claim._id);

            // Extract questionnaire data from the claim response  
            const questionnaireData = {
               claimId: claim._id,
               claimType: claim.claimType,
               claimOption: option,
               isComplete: claim.questionnaire.isComplete,
               totalQuestions: 0,
               answeredQuestions: 0,
               sections: claim.questionnaire.sections || []
            };

            // Calculate totals from sections
            if (claim.questionnaire.sections) {
               questionnaireData.totalQuestions = claim.questionnaire.sections.reduce(
                  (sum, section) => sum + section.responses.length, 0);
               questionnaireData.answeredQuestions = claim.questionnaire.sections.reduce(
                  (sum, section) => sum + section.responses.filter(r => r.isAnswered).length, 0);
            }

            setQuestionnaire(questionnaireData);
            setCurrentSectionIndex(0);

            // Initialize form data with existing answers from all sections
            const initialFormData = {};
            if (claim.questionnaire.sections) {
               claim.questionnaire.sections.forEach(section => {
                  section.responses.forEach(response => {
                     if (response.isAnswered) {
                        // Extract the actual answer value based on question type
                        const answer = response.answer;
                        initialFormData[response.questionId] =
                           answer.textValue ||
                           answer.numberValue ||
                           answer.dateValue ||
                           answer.booleanValue ||
                           answer.selectValue ||
                           answer.multiselectValue ||
                           answer.fileValue || '';
                     }
                  });
               });
            }
            setFormData(initialFormData);

            setStep(3);
         } else {
            setErrors({ api: 'Failed to create claim draft' });
         }
      } catch (error) {
         console.error('Error creating claim:', error);
         setErrors({ api: error.message || 'Error creating claim. Please try again.' });
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

   // Helper function to get sections from questionnaire
   const getSections = () => {
      if (!questionnaire?.sections) return [];

      // Return sections directly from the questionnaire data
      return questionnaire.sections
         .sort((a, b) => a.order - b.order)
         .map(section => ({
            title: section.title,
            description: section.description,
            questions: section.responses || section.questions || [], // Handle both response formats
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

         // Add your existing date validation logic here
         if (question.questionType === 'date' && formData[question.questionId]) {
            const date = new Date(formData[question.questionId]);
            const today = new Date();

            // Add your date validation rules here
         }
      });

      return newErrors;
   };

   const saveAnswers = async (sectionId = null) => {
      if (!claimId || !questionnaire) return;

      setSaving(true);
      try {
         // Prepare answers in the format expected by the backend
         let answersToSave = Object.entries(formData)
            .filter(([_, value]) => value !== '' && value !== null && value !== undefined)
            .map(([questionId, value]) => ({
               questionId,
               value
            }));

         if (sectionId) {
            // Filter answers for specific section only
            console.log("section id : ", sectionId);
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
            // Use section-specific endpoint
            response = await InsuranceApiService.request(
               `/claims/${claimId}/questionnaire/section/${sectionId}/submit-answers`,
               {
                  method: 'PATCH',
                  body: JSON.stringify({ sectionId, answers: answersToSave })
               }
            );
         } else {
            console.log("no secionId");
            // Use general endpoint for all answers
            response = await InsuranceApiService.submitQuestionnaireAnswers(claimId, answersToSave);
         }

         if (response.success) {
            // Update questionnaire state with the response
            if (response.questionnaire) {
               setQuestionnaire(response.questionnaire);
            } else if (response.section && response.progress) {
               // Update specific section and overall progress
               console.log("i think i can remove this....")
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
            console.log('Answers saved successfully');
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

      // Save current section answers before proceeding
      const sections = getSections();
      const currentSection = sections[currentSectionIndex];
      if (currentSection?.sectionId) {
         await saveAnswers(currentSection.sectionId);
      } else {
         await saveAnswers(); // Fallback to general save
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

      // Save final answers first
      await saveAnswers();

      // Check if questionnaire is complete
      if (!questionnaire?.isComplete) {
         setErrors({ submit: 'Please complete all required questions before submitting' });
         return;
      }

      await InsuranceApiService.updateClaimStatus(claimId, 'employee');

      // For now, we'll just create the draft. The actual claim submission with amount
      // will be handled in a separate step/component
      console.log('Claim questionnaire completed:', {
         claimId,
         policyId: selectedPolicy.policyId,
         policyType: selectedPolicy.policyType,
         claimOption,
         questionnaireComplete: questionnaire.isComplete
      });

      alert('Questionnaire completed successfully! Next step: Set claim amount and submit for review.');
      setStep(4);
      // You can redirect to a claim amount/submission page here
      // or add another step to this form
   };

   const handleFinalSubmit = async () => {
      // Validation checks
      if (!claimAmount || parseFloat(claimAmount) <= 0) {
         setErrors({ amount: 'Please enter a valid claim amount' });
         return;
      }

      if (!formData['final-consent']) {
         setErrors({ consent: 'You must provide consent to submit the claim' });
         return;
      }

      // Validate file sizes (optional)
      const maxFileSize = 10 * 1024 * 1024; // 10MB
      const oversizedFiles = additionalDocuments.filter(file => file.size > maxFileSize);
      if (oversizedFiles.length > 0) {
         setErrors({
            documents: `Some files are too large. Maximum file size is 10MB. Large files: ${oversizedFiles.map(f => f.name).join(', ')}`
         });
         return;
      }

      setSubmitting(true);
      setErrors({});

      try {
         const submissionData = {
            claimAmount: parseFloat(claimAmount),
            documents: additionalDocuments.length > 0 ? additionalDocuments : []
         };

         const response = await InsuranceApiService.submitClaim(claimId, submissionData);

         if (response.success) {
            // Show success modal instead of alert
            setShowSuccessModal(true);
            console.log('Claim submitted:', response.claim);
         } else {
            setErrors({ submit: response.message || 'Failed to submit claim. Please try again.' });
         }

      } catch (error) {
         console.error('Error submitting claim:', error);
         setErrors({ submit: error.message || 'Error submitting claim. Please try again.' });
      } finally {
         setSubmitting(false);
         setSubmitted(true);
      }
   };

   const handleModalOk = () => {
      // Navigate to claims page
      //window.location.href = '/employee/claims';
      // Or if using React Router:
      navigate('/employee/claims');
   };

   const handleModalCancel = () => {
      setShowSuccessModal(false);
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
                     className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${hasError ? 'border-red-500' : 'border-gray-300'
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
                     className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${hasError ? 'border-red-500' : 'border-gray-300'
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
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${hasError ? 'border-red-500' : 'border-gray-300'
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
                        className={`mt-1 w-4 h-4 text-blue-600 border rounded focus:ring-blue-500 ${hasError ? 'border-red-500' : 'border-gray-300'
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
                     className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${hasError ? 'border-red-500' : 'border-gray-300'
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
                  <div className={`border-2 border-dashed rounded-lg p-6 text-center hover:border-gray-400 transition-colors ${hasError ? 'border-red-300' : 'border-gray-300'
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

   const goBack = () => {
      if (step === 2) {
         setStep(1);
         setSelectedPolicy(null);
      } else if (step === 3) {
         if (currentSectionIndex > 0) {
            handlePrevious();
         } else {
            setStep(2);
            setClaimOption('');
            setTemplate(null);
            setCurrentSectionIndex(0);
         }
      } else if (step === 4) {
         // Go back to last section of questionnaire
         const sections = getSections();
         setCurrentSectionIndex(sections.length - 1);
         setStep(3);
      }
   };

   const getCoverageTypesList = (policy) => {
      const coverageTypes = policy.policyType === 'life'
         ? policy.coverage.typeLife
         : policy.coverage.typeVehicle;

      return coverageTypes.slice(0, 3).join(', ') + (coverageTypes.length > 3 ? '...' : '');
   };

   return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
         <div className="max-w-4xl mx-auto">
            {/* Success Modal */}
            {showSuccessModal && (
               <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                  <div className="bg-white rounded-lg max-w-md w-full p-6 relative shadow-lg">
                     {/* Close button */}
                     <button
                        onClick={handleModalCancel}
                        className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                     >
                        <X className="w-6 h-6" />
                     </button>

                     {/* Success icon */}
                     <div className="flex items-center justify-center mb-4">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                           <Check className="w-8 h-8 text-green-600" />
                        </div>
                     </div>

                     {/* Content */}
                     <div className="text-center mb-6">
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                           Claim Submitted Successfully!
                        </h3>
                        <p className="text-gray-600">
                           Your insurance claim has been submitted for HR review. You will be notified of any updates.
                        </p>
                     </div>

                     {/* Buttons */}
                     <div className="flex space-x-3">
                        <button
                           onClick={handleModalCancel}
                           className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                           Stay Here
                        </button>
                        <button
                           onClick={handleModalOk}
                           className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                           View Claims
                        </button>
                     </div>
                  </div>
               </div>
            )}

            {/* Header */}
            <div className="text-center mb-8">
               <h1 className="text-3xl font-bold text-gray-900 mb-2">Insurance Claim Request</h1>
               <p className="text-gray-600">Submit your claim by following the steps below</p>
            </div>

            {/* Progress Indicator - Show for both questionnaire and final steps */}
            {(step === 3 || step === 4) && questionnaire && (
               <div className="mb-8">
                  <div className="flex items-center justify-center space-x-6 overflow-x-auto px-4">
                     {/* Questionnaire Sections */}
                     {getSections().map((section, index) => (
                        <div key={index} className="flex flex-col items-center flex-shrink-0 min-w-0">
                           <div className="flex items-center mb-3">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300 
                                    ${step === 4 || index < currentSectionIndex || section.isComplete || submitted
                                    ? 'bg-green-500 text-white'
                                    : index === currentSectionIndex && step === 3
                                       ? 'bg-blue-600 text-white'
                                       : 'bg-gray-200 text-gray-600'
                                 }`}>
                                 {step === 4 || index < currentSectionIndex || section.isComplete || submitted ? (
                                    <Check className="w-6 h-6" />
                                 ) : (
                                    index + 1
                                 )}
                              </div>
                              <div className={`w-16 h-1 mx-3 transition-all duration-300 ${step === 4 ||  index < currentSectionIndex  ? 'bg-green-500' : 'bg-gray-200'
                                 }`} />
                           </div>
                           <span className={`text-xs text-center max-w-28 leading-tight transition-colors duration-300 ${step === 4 || section.isComplete
                                 ? 'text-green-600 font-medium'
                                 : index === currentSectionIndex && step === 3
                                    ? 'font-semibold text-blue-600'
                                    : 'text-gray-500'
                              }`}>
                              {section.title}
                           </span>
                        </div>
                     ))}

                     {/* Final Review Step */}
                     <div className="flex flex-col items-center flex-shrink-0 min-w-0">
                        <div className="flex items-center mb-3">
                           <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300 ${step === 4
                                 ? 'bg-blue-600 text-white'
                                 : questionnaire.isComplete
                                    ? 'bg-gray-300 text-gray-600'
                                    : 'bg-gray-200 text-gray-600'
                              }`}>
                              {step === 4 ? (
                                 <FileText className="w-6 h-6" />
                              ) : (
                                 getSections().length + 1
                              )}
                           </div>
                        </div>
                        <span className={`text-xs text-center max-w-28 leading-tight transition-colors duration-300 ${step === 4
                              ? 'font-semibold text-blue-600'
                              : 'text-gray-500'
                           }`}>
                           Review & Submit
                        </span>
                     </div>
                  </div>
               </div>
            )}

            {/* Main Content */}
            <div className="bg-white rounded-xl shadow-lg p-8">
               <div className="flex justify-between items-center mb-6">
                  {step > 1 && (
                     <button
                        onClick={goBack}
                        className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
                     >
                        <ChevronLeft className="w-4 h-4 mr-1" />
                        Back
                     </button>
                  )}

                  {/* Save button - only show when in questionnaire step */}
                  {step === 3 && claimId && (
                     <button
                        onClick={() => saveAnswers()}
                        disabled={saving}
                        className="flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed ml-auto"
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
                  )}
               </div>

               {/* Error display for save/API errors */}
               {(errors.save || errors.api) && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                     <p className="text-red-700 flex items-center gap-2">
                        <AlertCircle className="w-5 h-5" />
                        {errors.save || errors.api}
                     </p>
                  </div>
               )}

               {/* Step 1: Policy Selection */}
               {step === 1 && (
                  <div className="space-y-6">
                     <div className="text-center mb-8">
                        <h2 className="text-2xl font-semibold text-gray-900 mb-2">Select Policy</h2>
                        <p className="text-gray-600">Choose the policy you want to submit a claim for</p>
                     </div>

                     {errors.policies && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                           <p className="text-red-700 flex items-center gap-2">
                              <AlertCircle className="w-5 h-5" />
                              {errors.policies}
                           </p>
                        </div>
                     )}

                     {policiesLoading ? (
                        <div className="text-center py-12">
                           <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                           <p className="mt-2 text-gray-600">Loading your policies...</p>
                        </div>
                     ) : userPolicies.length === 0 ? (
                        <div className="text-center py-12">
                           <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                           <p className="text-gray-600 text-lg mb-2">No Active Policies Found</p>
                           <p className="text-gray-500">You don't have any active policies to submit claims for.</p>
                        </div>
                     ) : (
                        <div className="grid gap-6">
                           {userPolicies.map((policy) => {
                              const IconComponent = claimTypeIcons[policy.policyType];
                              return (
                                 <button
                                    key={policy._id}
                                    onClick={() => handlePolicySelect(policy)}
                                    className="p-6 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 text-left group"
                                 >
                                    <div className="flex items-center gap-4">
                                       <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                                          <IconComponent className="w-6 h-6 text-blue-600" />
                                       </div>
                                       <div className="flex-1">
                                          <div className="flex items-center justify-between mb-2">
                                             <h3 className="text-lg font-semibold text-gray-900 capitalize">
                                                {policy.policyType} Insurance
                                             </h3>
                                             <span className="text-sm font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded">
                                                {policy.policyId}
                                             </span>
                                          </div>
                                          <p className="text-gray-600 text-sm mb-2">
                                             Coverage: ${policy.coverage.coverageAmount.toLocaleString()}
                                          </p>
                                          <p className="text-gray-500 text-xs">
                                             Coverage Types: {getCoverageTypesList(policy)}
                                          </p>
                                       </div>
                                    </div>
                                 </button>
                              );
                           })}
                        </div>
                     )}
                  </div>
               )}

               {/* Step 2: Claim Option Selection */}
               {step === 2 && selectedPolicy && (
                  <div className="space-y-6">
                     <div className="text-center mb-8">
                        <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                           Select Claim Type for {selectedPolicy.policyType.charAt(0).toUpperCase() + selectedPolicy.policyType.slice(1)} Policy
                        </h2>
                        <p className="text-gray-600">Policy ID: {selectedPolicy.policyId}</p>
                        <p className="text-sm text-gray-500 mt-1">
                           Choose the specific type of claim you want to submit
                        </p>
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
                        {claimOptions[selectedPolicy.policyType]?.map((option) => (
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
               {step === 3 && questionnaire && (
                  <div className="space-y-8">
                     {(() => {
                        const sections = getSections();
                        const currentSection = sections[currentSectionIndex];
                        const isLastSection = currentSectionIndex === sections.length - 1;

                        if (!currentSection) {
                           return (
                              <div className="text-center py-8">
                                 <p className="text-gray-600">No questions available for this section.</p>
                              </div>
                           );
                        }

                        return (
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
                                    onClick={goBack}
                                    className="bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                                 >
                                    {currentSectionIndex === 0 ? 'Back to Options' : 'Previous'}
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
                        );
                     })()}
                  </div>
               )}

               {/* Step 4: Review and Final Submission */}
               {step === 4 && questionnaire && (
                  <div className="space-y-8">
                     <div className="text-center mb-8">
                        <h2 className="text-2xl font-semibold text-gray-900 mb-2">Review & Submit Claim</h2>
                        <p className="text-gray-600">Review your information, enter claim amount, and submit for HR review</p>
                        <p className="text-sm text-gray-500 mt-2">Policy: {selectedPolicy.policyId}</p>
                     </div>

                     {/* Questionnaire Summary */}
                     <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
                        <div className="flex items-center gap-2 mb-4">
                           <Check className="w-6 h-6 text-green-600" />
                           <h3 className="text-lg font-semibold text-green-800">Questionnaire Completed</h3>
                        </div>
                        <div className="grid md:grid-cols-3 gap-4 text-sm">
                           <div>
                              <span className="text-gray-600">Total Questions:</span>
                              <span className="ml-2 font-medium">{questionnaire.totalQuestions}</span>
                           </div>
                           <div>
                              <span className="text-gray-600">Answered:</span>
                              <span className="ml-2 font-medium text-green-600">{questionnaire.answeredQuestions}</span>
                           </div>
                           <div>
                              <span className="text-gray-600">Completion:</span>
                              <span className="ml-2 font-medium text-green-600">100%</span>
                           </div>
                        </div>
                     </div>

                     {/* Claim Amount Input */}
                     <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Claim Amount</h3>
                        <div className="space-y-4">
                           <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                 Requested Claim Amount *
                              </label>
                              <div className="relative">
                                 <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                                 <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={claimAmount}
                                    onChange={(e) => {
                                       setClaimAmount(e.target.value);
                                       if (errors.amount) {
                                          setErrors(prev => ({ ...prev, amount: '' }));
                                       }
                                    }}
                                    className={`w-full pl-8 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.amount ? 'border-red-500' : 'border-gray-300'
                                       }`}
                                    placeholder="0.00"
                                 />
                              </div>
                              {errors.amount && (
                                 <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                                    <AlertCircle className="w-4 h-4" />
                                    {errors.amount}
                                 </p>
                              )}
                           </div>

                           <div className="bg-blue-50 rounded-lg p-4">
                              <p className="text-sm text-blue-700">
                                 <strong>Policy Coverage:</strong> ${selectedPolicy.coverage.coverageAmount.toLocaleString()}
                              </p>
                              <p className="text-xs text-blue-600 mt-1">
                                 Ensure your claim amount is within your policy coverage limits.
                              </p>
                           </div>
                        </div>
                     </div>

                     {/* Additional Documents Upload */}
                     <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Supporting Documents</h3>
                        <div className="space-y-4">
                           <p className="text-sm text-gray-600 mb-4">
                              Upload any additional documents that support your claim (optional)
                           </p>

                           <div className={`border-2 border-dashed rounded-lg p-6 text-center hover:border-gray-400 transition-colors ${errors.documents ? 'border-red-300' : 'border-gray-300'
                              }`}>
                              <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                              <p className="text-sm text-gray-600 mb-2">Click to upload additional documents</p>
                              <input
                                 type="file"
                                 multiple
                                 accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                                 onChange={(e) => {
                                    setAdditionalDocuments(Array.from(e.target.files));
                                    if (errors.documents) {
                                       setErrors(prev => ({ ...prev, documents: '' }));
                                    }
                                 }}
                                 className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                              />
                              {additionalDocuments.length > 0 && (
                                 <div className="mt-4">
                                    <p className="text-sm font-medium text-gray-700 mb-2">
                                       Selected Files ({additionalDocuments.length}):
                                    </p>
                                    <div className="max-h-32 overflow-y-auto">
                                       {additionalDocuments.map((file, index) => (
                                          <div key={index} className="flex items-center justify-between bg-gray-50 rounded px-3 py-2 mb-2">
                                             <span className="text-sm text-gray-700 truncate">{file.name}</span>
                                             <span className="text-xs text-gray-500 ml-2">
                                                {(file.size / 1024 / 1024).toFixed(1)} MB
                                             </span>
                                          </div>
                                       ))}
                                    </div>
                                 </div>
                              )}
                           </div>

                           {errors.documents && (
                              <p className="text-red-500 text-sm flex items-center gap-1">
                                 <AlertCircle className="w-4 h-4" />
                                 {errors.documents}
                              </p>
                           )}

                           <div className="bg-blue-50 rounded-lg p-4">
                              <p className="text-sm text-blue-700">
                                 <strong>Accepted formats:</strong> PDF, JPG, PNG, DOC, DOCX (Max 10MB per file)
                              </p>
                              <p className="text-xs text-blue-600 mt-1">
                                 Examples: Medical certificates, receipts, police reports, repair estimates, etc.
                              </p>
                           </div>
                        </div>
                     </div>

                     {/* Summary of Answers */}
                     <div className="bg-gray-50 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Answer Summary</h3>
                        <div className="space-y-4">
                           {getSections().map((section, sectionIndex) => (
                              <div key={sectionIndex} className="border-l-4 border-blue-200 pl-4">
                                 <h4 className="font-medium text-gray-800 mb-2">{section.title}</h4>
                                 <div className="space-y-2">
                                    {section.questions.filter(q => formData[q.questionId]).map((question, qIndex) => (
                                       <div key={qIndex} className="text-sm">
                                          <span className="text-gray-600">{question.questionText}:</span>
                                          <span className="ml-2 text-gray-800">
                                             {question.questionType === 'boolean'
                                                ? (formData[question.questionId] ? 'Yes' : 'No')
                                                : question.questionType === 'file'
                                                   ? `${Array.isArray(formData[question.questionId]) ? formData[question.questionId].length : 1} file(s)`
                                                   : formData[question.questionId]
                                             }
                                          </span>
                                       </div>
                                    ))}
                                 </div>
                              </div>
                           ))}
                        </div>
                     </div>

                     {/* Declaration & Consent */}
                     <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Declaration & Consent</h3>
                        <div className="space-y-4 text-sm text-gray-700">
                           <div className="bg-yellow-50 border border-yellow-200 rounded p-4">
                              <p className="font-medium text-yellow-800 mb-2">Please confirm the following:</p>
                              <ul className="space-y-2 text-yellow-700">
                                 <li>• All information provided is true and accurate to the best of my knowledge</li>
                                 <li>• I understand that false or misleading information may result in claim rejection</li>
                                 <li>• I authorize the processing of this claim according to company policy</li>
                                 <li>• I agree to provide additional documentation if requested</li>
                              </ul>
                           </div>

                           <div className="flex items-center space-x-3 pt-4">
                              <input
                                 type="checkbox"
                                 id="final-consent"
                                 checked={formData['final-consent'] || false}
                                 onChange={(e) => {
                                    handleInputChange('final-consent', e.target.checked);
                                    if (errors.consent) {
                                       setErrors(prev => ({ ...prev, consent: '' }));
                                    }
                                 }}
                                 className={`w-5 h-5 text-blue-600 border rounded focus:ring-blue-500 ${errors.consent ? 'border-red-500' : 'border-gray-300'
                                    }`}
                              />
                              <label htmlFor="final-consent" className="text-gray-700">
                                 <strong>I confirm that all the above statements are true and I consent to submit this claim</strong>
                              </label>
                           </div>
                           {errors.consent && (
                              <p className="text-red-500 text-sm flex items-center gap-1">
                                 <AlertCircle className="w-4 h-4" />
                                 {errors.consent}
                              </p>
                           )}
                        </div>
                     </div>

                     {/* Submission Error */}
                     {errors.submit && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                           <p className="text-red-700 flex items-center gap-2">
                              <AlertCircle className="w-5 h-5" />
                              {errors.submit}
                           </p>
                        </div>
                     )}

                     {/* Action Buttons */}
                     <div className="flex justify-between pt-6">
                        <button
                           onClick={goBack}
                           className="bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                        >
                           Back to Questionnaire
                        </button>

                        <button
                           onClick={() => {
                              if (submitted) {
                                 // ✅ navigate if form is already submitted
                                 navigate("/employee/claims");
                                 return;
                              }

                              if (!formData['final-consent']) {
                                 setErrors({ consent: 'You must provide consent to submit the claim' });
                                 return;
                              }
                              if (!claimAmount || parseFloat(claimAmount) <= 0) {
                                 setErrors({ amount: 'Please enter a valid claim amount' });
                                 return;
                              }
                              handleFinalSubmit();
                           }}
                           disabled={submitting}
                           className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                           {submitting ? (
                              <>
                                 <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                 Submitting...
                              </>
                           ) : submitted ? (
                              <>Exit</> // ✅ show Exit button after successful submission
                           ) : (
                              <>
                                 Submit for HR Review
                                 <FileText className="w-5 h-5" />
                              </>
                           )}
                        </button>

                     </div>
                  </div>
               )}
            </div>
         </div>
      </div>
   );
};