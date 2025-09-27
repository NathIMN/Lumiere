// components/Questionnaire.jsx
import React, { useState, useEffect } from 'react';
import { ChevronLeft, FileText, Calendar, AlertCircle, Check, Upload } from 'lucide-react';
import InsuranceApiService from "../../services/insurance-api";
import DocumentApiService from "../../services/document-api";

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
   const [uploadingFiles, setUploadingFiles] = useState(false);

   console.log("questionnaire = ", questionnaire);

   // Helper function to format date for input (YYYY-MM-DD)
   const formatDateForInput = (dateString) => {
      if (!dateString) return '';
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '';
      return date.toISOString().split('T')[0];
   };

   // Helper function to format date for storage (just the date part)
   const formatDateForStorage = (dateString) => {
      if (!dateString) return '';
      // Create date at midnight UTC to avoid timezone issues
      const date = new Date(dateString + 'T00:00:00.000Z');
      return date.toISOString();
   };

   // Validation function for individual fields
   const validateField = (question, value) => {
      const validation = question.validation || {};

      // Required field validation
      if (question.isRequired) {
         if (question.questionType === 'boolean') {
            if (value !== true && value !== false && value !== 'true' && value !== 'false') {
               return `${question.questionText} is required`;
            }
         } else if (question.questionType === 'file') {
            if (!value || (Array.isArray(value) && value.length === 0)) {
               return `${question.questionText} is required`;
            }
         } else {
            if (!value || value === '' || value === null || value === undefined) {
               return `${question.questionText} is required`;
            }
         }
      }

      // Skip other validations if field is empty and not required
      if (!question.isRequired && (!value || value === '')) {
         return null;
      }

      // Text validation
      if (question.questionType === 'text' && value) {
         if (validation.maxLength && value.length > validation.maxLength) {
            return `Maximum ${validation.maxLength} characters allowed`;
         }
         if (validation.pattern) {
            const regex = new RegExp(validation.pattern);
            if (!regex.test(value)) {
               return validation.message || 'Invalid format';
            }
         }
      }

      // Number validation
      if (question.questionType === 'number' && value !== '') {
         const numValue = parseFloat(value);
         if (isNaN(numValue)) {
            return 'Please enter a valid number';
         }
         if (validation.min !== undefined && numValue < validation.min) {
            return `Minimum value is ${validation.min}`;
         }
         if (validation.max !== undefined && numValue > validation.max) {
            return `Maximum value is ${validation.max}`;
         }
      }

      // Date validation
      if (question.questionType === 'date' && value) {
         const dateValue = new Date(value);
         if (isNaN(dateValue.getTime())) {
            return 'Please enter a valid date';
         }

         // Handle max validation (can be "today" or another field name)
         if (validation.max) {
            let maxDate;
            if (validation.max === 'today') {
               maxDate = new Date();
               maxDate.setHours(23, 59, 59, 999); // End of today
            } else {
               // Check if max refers to another field
               const maxFieldValue = formData[validation.max];
               if (maxFieldValue) {
                  maxDate = new Date(maxFieldValue);
               }
            }

            if (maxDate && dateValue > maxDate) {
               return validation.message || `Date cannot be after ${validation.max === 'today' ? 'today' : validation.max}`;
            }
         }

         // Handle min validation (can be another field name or a date string)
         if (validation.min) {
            let minDate;
            if (validation.min === 'today') {
               minDate = new Date();
               minDate.setHours(0, 0, 0, 0); // Start of today
            } else {
               // Check if min refers to another field
               const minFieldValue = formData[validation.min];
               if (minFieldValue) {
                  minDate = new Date(minFieldValue);
               } else {
                  // Try to parse as direct date string
                  minDate = new Date(validation.min);
                  if (isNaN(minDate.getTime())) {
                     minDate = null;
                  }
               }
            }

            if (minDate && dateValue <= minDate) {
               return validation.message || `Date must be after ${validation.min === 'today' ? 'today' : validation.min}`;
            }
         }
      }

      // File validation
      if (question.questionType === 'file') {
         // For file questions, check if files are selected
         const hasLocalFiles = formData[question.questionId] &&
            Array.isArray(formData[question.questionId]) &&
            formData[question.questionId].length > 0 &&
            formData[question.questionId][0] instanceof File;

         const hasBackendAnswer = question.isAnswered && question.currentAnswer && question.currentAnswer.value;

         console.log(`Validating file question ${question.questionId}: hasLocalFiles=${hasLocalFiles}, hasBackendAnswer=${hasBackendAnswer}`);

         if (question.isRequired && !hasLocalFiles && !hasBackendAnswer) {
            return `${question.questionText} is required`;
         }

         // Validate file properties if files are present
         if (hasLocalFiles && Array.isArray(formData[question.questionId])) {
            for (const file of formData[question.questionId]) {
               if (validation.max && file.size > parseInt(validation.max)) {
                  return `File size must be less than ${Math.round(validation.max / 1024 / 1024)}MB`;
               }
               if (validation.pattern) {
                  const regex = new RegExp(validation.pattern);
                  if (!regex.test(file.name)) {
                     return validation.message || 'Invalid file type';
                  }
               }
            }
         }
      }

      return null;
   };

   // Initialize form data with existing answers
   useEffect(() => {
      if (questionnaire?.sections) {
         console.log("Processing questionnaire sections for form data:", questionnaire.sections);
         const existingAnswers = {};

         questionnaire.sections.forEach((section, sectionIndex) => {
            console.log(`Processing section ${sectionIndex}:`, section);
            // Handle both 'responses' and 'questions' structures
            const questions = section.responses || section.questions || [];
            console.log(`Section ${sectionIndex} has ${questions.length} questions:`, questions);

            questions.forEach((response, responseIndex) => {
               console.log(`Processing response ${responseIndex}:`, response);
               console.log(`Response structure:`, {
                  questionId: response.questionId,
                  questionText: response.questionText,
                  isAnswered: response.isAnswered,
                  answer: response.answer,
                  currentAnswer: response.currentAnswer,
                  allKeys: Object.keys(response)
               });

               // Try multiple approaches to get the answer value
               let answerValue = null;

               if (response.isAnswered && response.currentAnswer) {
                  answerValue = response.currentAnswer.value;
                  // Format dates for HTML input compatibility
                  if (response.questionType === 'date' && answerValue) {
                     answerValue = formatDateForInput(answerValue);
                  }
                  console.log(`Found answer via currentAnswer.value: ${answerValue}`);
               } else if (response.isAnswered && response.answer) {
                  // Try structured answer approach
                  const answer = response.answer;
                  if (answer.dateValue) {
                     answerValue = formatDateForInput(answer.dateValue);
                  } else {
                     answerValue = answer.textValue || answer.numberValue ||
                        answer.selectValue || answer.multiselectValue || answer.fileValue ||
                        (answer.booleanValue !== undefined ? answer.booleanValue : null);
                  }
                  console.log(`Found answer via structured answer: ${answerValue}`);
               } else if (response.isAnswered && response.value !== undefined) {
                  answerValue = response.value;
                  // Format dates for HTML input compatibility
                  if (response.questionType === 'date' && answerValue) {
                     answerValue = formatDateForInput(answerValue);
                  }
                  console.log(`Found answer via direct value: ${answerValue}`);
               }

               if (answerValue !== null && answerValue !== undefined && answerValue !== '') {
                  existingAnswers[response.questionId] = answerValue;
                  console.log(`Setting formData[${response.questionId}] = ${answerValue}`);
               } else {
                  console.log(`Question ${response.questionId} has no extractable answer:`, {
                     isAnswered: response.isAnswered,
                     hasCurrentAnswer: !!response.currentAnswer,
                     hasAnswer: !!response.answer,
                     hasDirectValue: response.value !== undefined
                  });
               }
            });
         });

         console.log("Final existing answers from enhanced extraction:", existingAnswers);
         setFormData(prev => ({
            ...existingAnswers,
            ...prev // Keep any new local changes
         }));
      }
   }, [questionnaire]);

   console.log("formData = ", formData);

   const canCompleteQuestionnaire = () => {
      if (!questionnaire?.sections) return false;

      // If backend says questionnaire is complete, trust it
      if (questionnaire.isComplete === true) {
         console.log("Questionnaire marked as complete in backend, allowing completion");
         return true;
      }

      const sections = getSections();

      // Check if all required questions in all sections have answers
      for (const section of sections) {
         for (const question of section.questions) {
            if (question.isRequired) {
               // Check if question has local answer in formData
               const hasLocalAnswer = formData[question.questionId] &&
                  formData[question.questionId] !== '' &&
                  formData[question.questionId] !== null &&
                  formData[question.questionId] !== undefined &&
                  !(Array.isArray(formData[question.questionId]) && formData[question.questionId].length === 0);

               // Check if question has backend answer (using backup approach)
               const hasBackendAnswer = question.isAnswered ||
                  (question.currentAnswer && question.currentAnswer.value);

               console.log(`Question ${question.questionId}: hasLocal=${hasLocalAnswer}, hasBackend=${hasBackendAnswer}, required=${question.isRequired}`);

               if (!hasLocalAnswer && !hasBackendAnswer) {
                  console.log(`Cannot complete questionnaire: missing answer for required question ${question.questionId}`);
                  return false;
               }
            }
         }
      }

      console.log("All required questions answered, questionnaire can be completed");
      return true;
   };

   const handleInputChange = (questionId, value, question) => {
      let processedValue = value;

      // Process date values to remove time component
      if (question && question.questionType === 'date' && value) {
         processedValue = value; // Keep as YYYY-MM-DD for input
      }

      setFormData(prev => ({
         ...prev,
         [questionId]: processedValue
      }));

      // Real-time validation
      const validationError = validateField(question, processedValue);
      if (validationError) {
         setErrors(prev => ({
            ...prev,
            [questionId]: validationError
         }));
      } else {
         // Clear error for this field
         if (errors[questionId]) {
            setErrors(prev => ({
               ...prev,
               [questionId]: ''
            }));
         }
      }

      // Only auto-save file uploads
      if (Array.isArray(value) && value.length > 0 && value[0] instanceof File) {
         console.log('File selected, auto-saving to update completion status');
      }
   };

   // Helper function to upload files and get document IDs
   const uploadFilesAndGetIds = async (files, claimId, questionId) => {
      if (!files || !Array.isArray(files) || files.length === 0) return null;

      try {
         // For now, handle single file per question (most common case)
         // Can be extended to handle multiple files if needed
         const file = files[0];

         // Get current user ID from localStorage
         const currentUserId = localStorage.getItem('userId');

         const uploadResponse = await DocumentApiService.uploadDocument(file, {
            type: 'claim',
            docType: 'questionnaire_answer',
            uploadedBy: currentUserId || claimId, // Fallback to claimId if userId not found
            uploadedByRole: 'employee',
            refId: claimId,
            description: `Answer to ${questionId}`,
            tags: `questionnaire,${questionId}`
         });

         if (uploadResponse.success && uploadResponse.document._id) {
            return uploadResponse.document._id;
         } else {
            throw new Error('Failed to upload document');
         }
      } catch (error) {
         console.error('File upload error:', error);
         throw error;
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
      const newErrors = {};
      const sections = getSections();
      const currentSection = sections[currentSectionIndex];

      if (!currentSection) return {};

      currentSection.questions.forEach(question => {
         if (question.isRequired) {
            // For file questions, check if files are selected
            if (question.questionType === 'file') {
               const hasLocalFiles = formData[question.questionId] &&
                  Array.isArray(formData[question.questionId]) &&
                  formData[question.questionId].length > 0 &&
                  formData[question.questionId][0] instanceof File;

               const hasBackendAnswer = question.isAnswered && question.currentAnswer && question.currentAnswer.value;

               console.log(`Validating file question ${question.questionId}: hasLocalFiles=${hasLocalFiles}, hasBackendAnswer=${hasBackendAnswer}`);

               if (!hasLocalFiles && !hasBackendAnswer) {
                  newErrors[question.questionId] = `${question.questionText} is required`;
               }
            } else {
               // For non-file questions, use original validation
               const hasLocalAnswer = formData[question.questionId] !== undefined &&
                  formData[question.questionId] !== null &&
                  formData[question.questionId] !== '';

               const hasBackendAnswer = question.isAnswered && question.currentAnswer && question.currentAnswer.value;

               console.log(`Validating non-file question ${question.questionId}: hasLocalAnswer=${hasLocalAnswer}, hasBackendAnswer=${hasBackendAnswer}`);

               if (!hasLocalAnswer && !hasBackendAnswer) {
                  newErrors[question.questionId] = `${question.questionText} is required`;
               }
            }
         }
      });

      return newErrors;
   };

   const saveAnswers = async (sectionId = null) => {
      if (!claimId || !questionnaire) return;

      console.log('SaveAnswers called with sectionId:', sectionId);
      console.log('Current formData:', formData);

      setSaving(true);
      try {
         // First, handle file uploads and get document IDs
         const processedAnswers = [];

         for (const [questionId, value] of Object.entries(formData)) {
            if (value === '' || value === null || value === undefined) continue;

            console.log(`Processing answer for ${questionId}:`, value);

            // Check if this is a file question
            const sections = getSections();
            let isFileQuestion = false;
            for (const section of sections) {
               const question = section.questions.find(q => q.questionId === questionId);
               if (question && question.questionType === 'file') {
                  isFileQuestion = true;
                  console.log(`${questionId} is a file question`);
                  break;
               }
            }

            if (isFileQuestion && Array.isArray(value) && value.length > 0) {
               console.log(`Uploading file for question ${questionId}`);
               // Upload file and get document ID
               try {
                  setUploadingFiles(true);
                  const documentId = await uploadFilesAndGetIds(value, claimId, questionId);
                  if (documentId) {
                     console.log(`File uploaded successfully, document ID: ${documentId}`);
                     processedAnswers.push({
                        questionId,
                        value: documentId
                     });
                  }
               } catch (error) {
                  console.error(`Failed to upload file for question ${questionId}:`, error);
                  setErrors({ save: `Failed to upload file for ${questionId}: ${error.message}` });
                  setSaving(false);
                  setUploadingFiles(false);
                  return;
               } finally {
                  setUploadingFiles(false);
               }
            } else if (!isFileQuestion) {
               // Regular non-file question
               console.log(`Adding non-file answer for ${questionId}: ${value}`);

               // Find the question to check its type
               const sections = getSections();
               let question = null;
               for (const section of sections) {
                  question = section.questions.find(q => q.questionId === questionId);
                  if (question) break;
               }

               let processedValue = value;

               // Handle different question types properly
               if (question) {
                  switch (question.questionType) {
                     case 'date':
                        if (value) {
                           processedValue = formatDateForStorage(value);
                        }
                        break;
                     case 'number':
                        if (value !== '' && value !== null && value !== undefined) {
                           processedValue = Number(value);
                        }
                        break;
                     case 'boolean':
                        processedValue = Boolean(value);
                        break;
                     default:
                        processedValue = value;
                  }
               }

               processedAnswers.push({
                  questionId,
                  value: processedValue
               });
            }
            // Skip file questions that don't have files selected
         }

         console.log('Processed answers:', processedAnswers);

         let answersToSave = processedAnswers;

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

         console.log("Answers to save:", answersToSave);

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

         console.log("Save response:", response);

         if (response.success) {
            if (response.questionnaire) {
               // FIX: Ensure we update the questionnaire state properly
               setQuestionnaire(response.questionnaire);
               console.log("Updated questionnaire:", response.questionnaire);
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

      // Set saving state to show loading UI
      setSaving(true);

      try {
         const sections = getSections();
         const currentSection = sections[currentSectionIndex];
         if (currentSection?.sectionId) {
            await saveAnswers(currentSection.sectionId);
         } else {
            await saveAnswers();
         }

         // Only proceed to next section if save was successful
         if (questionnaire && currentSectionIndex < sections.length - 1) {
            setCurrentSectionIndex(prev => prev + 1);
         }
      } catch (error) {
         console.error('Error saving before next section:', error);
         setErrors({ save: 'Failed to save current section. Please try again.' });
      } finally {
         setSaving(false);
      }
   };

   const handlePrevious = () => {
      if (currentSectionIndex > 0) {
         setCurrentSectionIndex(prev => prev - 1);
         setErrors({});
      }
   };

   const handleSubmit = async () => {
      console.log('HandleSubmit called - validating and saving before submit');
      const validationErrors = validateCurrentSection();

      if (Object.keys(validationErrors).length > 0) {
         console.log('Validation errors found:', validationErrors);
         setErrors(validationErrors);
         return;
      }

      // Check if questionnaire can be completed based on current data
      if (!canCompleteQuestionnaire()) {
         setErrors({ submit: 'Please complete all required questions before submitting' });
         return;
      }

      // Save current section/form before submitting
      try {
         setSaving(true);
         console.log('Saving answers before submit');
         await saveAnswers();
         console.log('Save completed successfully');
      } catch (error) {
         console.error('Error saving answers before submit:', error);
         setErrors({ submit: 'Please save all answers before submitting' });
         setSaving(false);
         return;
      }

      try {
         console.log('Updating claim status to employee');
         const statusResponse = await InsuranceApiService.updateClaimStatus(claimId, 'employee');

         if (statusResponse.success) {
            console.log('Status updated successfully, proceeding to next step');
            // Update questionnaire completion status
            setQuestionnaire(prev => ({
               ...prev,
               isComplete: true,
               completedAt: new Date().toISOString()
            }));

            // Call onComplete to proceed to ReviewAndSubmit
            onComplete(formData);
         } else {
            setErrors({ submit: 'Failed to complete questionnaire. Please try again.' });
         }
      } catch (error) {
         console.error('Error submitting claim:', error);
         setErrors({ submit: 'Error submitting claim. Please try again.' });
      } finally {
         setSaving(false);
      }
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
                     value={value || ''}
                     onChange={(e) => handleInputChange(question.questionId, e.target.value, question)}
                     className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${hasError ? 'border-red-500' : 'border-gray-300'
                        }`}
                     maxLength={question.validation?.maxLength}
                  />
                  {question.validation?.maxLength && (
                     <p className="text-xs text-gray-500">
                        {(value || '').length}/{question.validation.maxLength} characters
                     </p>
                  )}
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
                     value={value || ''}
                     onChange={(e) => handleInputChange(question.questionId, e.target.value, question)}
                     className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${hasError ? 'border-red-500' : 'border-gray-300'
                        }`}
                     min={question.validation?.min}
                     max={question.validation?.max}
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
                        value={value || ''}
                        onChange={(e) => handleInputChange(question.questionId, e.target.value, question)}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${hasError ? 'border-red-500' : 'border-gray-300'
                           }`}
                        max={question.validation?.max === 'today' ? new Date().toISOString().split('T')[0] : undefined}
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
                        onChange={(e) => handleInputChange(question.questionId, e.target.checked, question)}
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
                     value={value || ''}
                     onChange={(e) => handleInputChange(question.questionId, e.target.value, question)}
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
                     {question.isAnswered && (
                        <span className="ml-2 text-green-600 text-xs">✓ Answered</span>
                     )}
                  </label>
                  <div className={`border-2 border-dashed rounded-lg p-6 text-center hover:border-gray-400 transition-colors ${hasError ? 'border-red-300' : 'border-gray-300'
                     }`}>
                     <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                     <p className="text-sm text-gray-600 mb-2">Click to upload or drag and drop files here</p>
                     <input
                        type="file"
                        multiple
                        onChange={(e) => handleInputChange(question.questionId, Array.from(e.target.files), question)}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        accept={question.validation?.pattern ? question.validation.pattern.replace(/\\/g, '').replace(/\.\(\|/g, '.').replace(/\)\$/, '') : undefined}
                     />

                     {/* Show selected files */}
                     {formData[question.questionId] && Array.isArray(formData[question.questionId]) && formData[question.questionId].length > 0 && (
                        <div className="mt-2">
                           <p className="text-sm text-gray-600 mb-1">Selected files:</p>
                           {formData[question.questionId].map((file, index) => (
                              <div key={index} className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded inline-block mr-2 mb-1">
                                 {file.name} ({Math.round(file.size / 1024)}KB)
                              </div>
                           ))}
                        </div>
                     )}

                     {/* Show previously uploaded file */}
                     {question.isAnswered && question.currentAnswer && question.currentAnswer.value && (
                        <div className="mt-2">
                           <p className="text-sm text-green-600">✓ Previously uploaded document: {question.currentAnswer.value}</p>
                        </div>
                     )}
                  </div>
                  {question.validation?.max && (
                     <p className="text-xs text-gray-500">
                        Maximum file size: {Math.round(question.validation.max / 1024 / 1024)}MB
                     </p>
                  )}
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

   // Rest of the component remains the same...
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
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300 ${index < currentSectionIndex && section.isComplete
                           ? 'bg-green-500 text-white'
                           : index === currentSectionIndex
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-200 text-gray-600'
                           }`}>
                           {index < currentSectionIndex && section.isComplete ? (
                              <Check className="w-6 h-6" />
                           ) : (
                              index + 1
                           )}
                        </div>
                        {index < sections.length - 1 && (
                           <div className={`w-16 h-1 mx-3 transition-all duration-300 ${index < currentSectionIndex ? 'bg-green-500' : 'bg-gray-200'
                              }`} />
                        )}
                     </div>
                     <span className={`text-xs text-center max-w-28 leading-tight transition-colors duration-300 ${section.isComplete
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

         <div className='bg-white rounded-2xl border border-gray-200 dark:border-neutral-700 p-8 shadow-lg'>
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
                           disabled={!canCompleteQuestionnaire() || saving || uploadingFiles}
                           className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                           {saving || uploadingFiles ? (
                              <div className="flex items-center gap-2">
                                 <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                 {uploadingFiles ? 'Uploading...' : 'Saving...'}
                              </div>
                           ) : (
                              canCompleteQuestionnaire() ? 'Complete Questionnaire' : 'Complete All Questions First'
                           )}
                        </button>
                     ) : (
                        <button
                           onClick={handleNext}
                           disabled={saving || uploadingFiles}
                           className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                           {saving || uploadingFiles ? (
                              <>
                                 <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                 {uploadingFiles ? 'Uploading Files...' : 'Saving...'}
                              </>
                           ) : (
                              'Save & Next Section'
                           )}
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