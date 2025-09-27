import React, { useState } from 'react';
import { Check, Upload, AlertCircle, FileText, X, DollarSign, Shield, Eye } from 'lucide-react';
import { useNavigate } from "react-router-dom";
import InsuranceApiService from '../../services/insurance-api';

export const ReviewAndSubmit = ({
   questionnaire,
   selectedPolicy,
   claimId,
   onSubmitSuccess
}) => {
   const [claimAmount, setClaimAmount] = useState('');
   const [submitting, setSubmitting] = useState(false);
   const [submitted, setSubmitted] = useState(false);
   const [additionalDocuments, setAdditionalDocuments] = useState([]);
   const [errors, setErrors] = useState({});
   const [finalConsent, setFinalConsent] = useState(false);
   const [showSuccessModal, setShowSuccessModal] = useState(false);
   const navigate = useNavigate();

   // Helper function to get sections from questionnaire for final step display
   const getSections = () => {
      if (!questionnaire?.sections) {
         console.log('ReviewAndSubmit - No sections in questionnaire');
         return [];
      }

      const sections = questionnaire.sections
         .sort((a, b) => a.order - b.order)
         .map(section => ({
            title: section.title,
            description: section.description,
            questions: section.responses || section.questions || [],
            order: section.order,
            sectionId: section.sectionId,
            isComplete: section.isComplete
         }));

      console.log('ReviewAndSubmit - Processed sections:', sections);

      // Debug: Log the structure of questions and their answers
      sections.forEach((section, sIndex) => {
         console.log(`ReviewAndSubmit - Section ${sIndex} (${section.title}) questions:`, section.questions);
         section.questions.forEach((q, qIndex) => {
            if (q.isAnswered) {
               console.log(`ReviewAndSubmit - Question ${qIndex} (${q.questionId}):`, {
                  isAnswered: q.isAnswered,
                  answer: q.answer,
                  currentAnswer: q.currentAnswer
               });
            }
         });
      });

      return sections;
   };

   const handleFileSelect = (event) => {
      const files = Array.from(event.target.files);
      setAdditionalDocuments(prev => [...prev, ...files]);
   };

   const removeFile = (index) => {
      setAdditionalDocuments(prev => prev.filter((_, i) => i !== index));
   };

   const handleFinalSubmit = async () => {
      // Validation checks
      if (!claimAmount || parseFloat(claimAmount) <= 0) {
         setErrors({ amount: 'Please enter a valid claim amount' });
         return;
      }

      if (!finalConsent) {
         setErrors({ consent: 'You must provide consent to submit the claim' });
         return;
      }

      // Validate file sizes
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
         // For now, we'll handle additional documents properly
         // TODO: Upload additional documents and get their IDs
         let documentIds = [];

         if (additionalDocuments.length > 0) {
            console.log('Additional documents to upload:', additionalDocuments);
            // For now, we'll skip file uploads and just submit without additional documents
            // In a full implementation, you would upload files here and get their ObjectIds
            console.warn('File upload not implemented in ReviewAndSubmit - skipping additional documents');
         }

         const submissionData = {
            claimAmount: parseFloat(claimAmount),
            documents: documentIds // Send empty array or actual document IDs
         };

         console.log('Submitting claim with data:', submissionData);
         const response = await InsuranceApiService.submitClaim(claimId, submissionData);

         if (response.success) {
            setShowSuccessModal(true);
            console.log('Claim submitted:', response.claim);
            setSubmitted(true);
            // Notify parent component about successful submission
            if (onSubmitSuccess) {
               onSubmitSuccess(response.claim);
            }
         } else {
            setErrors({ submit: response.message || 'Failed to submit claim. Please try again.' });
         }

      } catch (error) {
         console.error('Error submitting claim:', error);
         setErrors({ submit: error.message || 'Error submitting claim. Please try again.' });
      } finally {
         setSubmitting(false);
      }
   };

   const handleModalCancel = () => {
      setShowSuccessModal(false);
   };

   const handleModalOk = () => {
      navigate('/employee/claims');
   };

   const sections = getSections();

   return (
      <>
         <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="space-y-8">

               {/* Header */}
               <div className="text-center border-b pb-6">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                     <Check className="w-8 h-8 text-green-600" />
                  </div>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-2">Review & Submit Claim</h2>
                  <p className="text-gray-600">Please review your answers and provide final details</p>
               </div>

               {/* Error Messages */}
               {Object.keys(errors).length > 0 && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                     {Object.entries(errors).map(([key, message]) => (
                        <p key={key} className="text-red-700 flex items-center gap-2 mb-2 last:mb-0">
                           <AlertCircle className="w-4 h-4" />
                           {message}
                        </p>
                     ))}
                  </div>
               )}

               {/* Questionnaire Summary */}
               <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-4">
                     <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Eye className="w-5 h-5 text-blue-600" />
                     </div>
                     <h3 className="text-lg font-semibold text-gray-900">Questionnaire Summary</h3>
                  </div>

                  {sections.map((section) => (
                     <div key={section.sectionId} className="border border-gray-200 rounded-xl overflow-hidden">
                        <div className="bg-gradient-to-r from-gray-100 to-gray-50 px-6 py-4 border-b border-gray-200">
                           <h4 className="font-semibold text-gray-900">{section.title}</h4>
                           {section.description && (
                              <p className="text-sm text-gray-600 mt-1">{section.description}</p>
                           )}
                        </div>
                        <div className="p-6 space-y-4">
                           {section.questions?.map((response) => (
                              <div key={response.questionId} className="border-b border-gray-100 pb-4 last:border-b-0">
                                 <label className="block text-sm font-medium text-gray-700 mb-2">
                                    {response.questionText}
                                    {response.isRequired && <span className="text-red-500 ml-1">*</span>}
                                 </label>
                                 <div className="text-sm text-gray-900">
                                    {response.isAnswered ? (
                                       (() => {
                                          // Try both data structures: response.answer and response.currentAnswer
                                          const answer = response.answer || response.currentAnswer;
                                          if (!answer) {
                                             console.log('ReviewAndSubmit - No answer data for question:', response.questionId);
                                             return <span className="text-gray-500 italic">Answer data not available</span>;
                                          }

                                          // Handle both structured answer (textValue, numberValue, etc.) and simple value
                                          let displayValue;
                                          if (typeof answer === 'object' && answer.value !== undefined) {
                                             // Simple currentAnswer.value structure
                                             displayValue = answer.value;
                                             // Special handling for file types
                                             if (response.questionType === 'file' && displayValue) {
                                                displayValue = 'File uploaded';
                                             }
                                          } else if (typeof answer === 'object') {
                                             // Structured answer with textValue, numberValue, etc.
                                             if (response.questionType === 'file') {
                                                displayValue = (answer.fileValue && answer.fileValue.length > 0) ?
                                                   `${Array.isArray(answer.fileValue) ? answer.fileValue.length : 1} file(s) uploaded` :
                                                   'File uploaded';
                                             } else {
                                                displayValue = answer.textValue ||
                                                   answer.numberValue ||
                                                   (answer.dateValue ? new Date(answer.dateValue).toLocaleDateString() : null) ||
                                                   (answer.booleanValue !== undefined ? (answer.booleanValue ? 'Yes' : 'No') : null) ||
                                                   answer.selectValue ||
                                                   (answer.multiselectValue && answer.multiselectValue.length > 0 ? answer.multiselectValue.join(', ') : null);
                                             }
                                          } else {
                                             // Direct value
                                             displayValue = answer;
                                             // Special handling for file types
                                             if (response.questionType === 'file' && displayValue) {
                                                displayValue = 'File uploaded';
                                             }
                                          }

                                          displayValue = displayValue || 'No answer provided';
                                          return <span className="font-medium text-green-700">{displayValue}</span>;
                                       })()
                                    ) : (
                                       <span className="text-gray-500 italic">Not answered</span>
                                    )}
                                 </div>
                              </div>
                           ))}
                        </div>
                     </div>
                  ))}
               </div>

               {/* Claim Amount */}
               <div className="space-y-4">
                  <div className="flex items-center gap-3 mb-4">
                     <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                        <DollarSign className="w-5 h-5 text-green-600" />
                     </div>
                     <h3 className="text-lg font-semibold text-gray-900">Claim Amount</h3>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-6">
                     <label className="block text-sm font-medium text-gray-700 mb-2">
                        Total Claim Amount (USD) <span className="text-red-500">*</span>
                     </label>
                     <input
                        type="number"
                        value={claimAmount}
                        onChange={(e) => setClaimAmount(e.target.value)}
                        placeholder="Enter total claim amount"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        disabled={submitting}
                     />
                     <p className="text-xs text-gray-500 mt-2">
                        Enter the total amount you are claiming for this incident
                     </p>
                  </div>
               </div>

               {/* Additional Documents */}
               <div className="space-y-4">
                  <div className="flex items-center gap-3 mb-4">
                     <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                        <Upload className="w-5 h-5 text-purple-600" />
                     </div>
                     <h3 className="text-lg font-semibold text-gray-900">Additional Documents (Optional)</h3>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-6">
                     <input
                        type="file"
                        multiple
                        onChange={handleFileSelect}
                        className="hidden"
                        id="additional-documents"
                        disabled={submitting}
                     />
                     <label
                        htmlFor="additional-documents"
                        className="flex items-center justify-center w-full py-4 px-6 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 transition-colors"
                     >
                        <div className="text-center">
                           <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                           <p className="text-sm text-gray-600">Click to upload additional supporting documents</p>
                           <p className="text-xs text-gray-500 mt-1">Maximum 10MB per file</p>
                        </div>
                     </label>

                     {additionalDocuments.length > 0 && (
                        <div className="mt-4 space-y-2">
                           <p className="text-sm font-medium text-gray-700">Selected files:</p>
                           {additionalDocuments.map((file, index) => (
                              <div key={index} className="flex items-center justify-between bg-white p-3 rounded-lg border">
                                 <div className="flex items-center gap-3">
                                    <FileText className="w-4 h-4 text-gray-400" />
                                    <span className="text-sm text-gray-900">{file.name}</span>
                                    <span className="text-xs text-gray-500">
                                       ({(file.size / 1024 / 1024).toFixed(2)} MB)
                                    </span>
                                 </div>
                                 <button
                                    onClick={() => removeFile(index)}
                                    className="text-red-500 hover:text-red-700 transition-colors"
                                    disabled={submitting}
                                 >
                                    <X className="w-4 h-4" />
                                 </button>
                              </div>
                           ))}
                        </div>
                     )}
                  </div>
               </div>

               {/* Consent */}
               <div className="space-y-4">
                  <div className="flex items-center gap-3 mb-4">
                     <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                        <Shield className="w-5 h-5 text-red-600" />
                     </div>
                     <h3 className="text-lg font-semibold text-gray-900">Final Consent</h3>
                  </div>
                  <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                     <label className="flex items-start gap-3 cursor-pointer">
                        <input
                           type="checkbox"
                           checked={finalConsent}
                           onChange={(e) => setFinalConsent(e.target.checked)}
                           className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                           disabled={submitting}
                        />
                        <div className="text-sm">
                           <p className="text-gray-900 font-medium mb-2">
                              I declare that all information provided is true and accurate to the best of my knowledge.
                           </p>
                           <p className="text-gray-700">
                              I understand that providing false information may result in claim denial and policy cancellation.
                              I consent to the processing of this claim and authorize the insurance company to investigate as necessary.
                           </p>
                        </div>
                     </label>
                  </div>
               </div>

               {/* Submit Button */}
               <div className="flex justify-center pt-6">
                  <button
                     onClick={handleFinalSubmit}
                     disabled={submitting || !finalConsent || !claimAmount}
                     className="bg-green-600 text-white px-12 py-4 rounded-xl hover:bg-green-700 transition-colors font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 shadow-lg hover:shadow-xl"
                  >
                     {submitting ? (
                        <>
                           <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                           Submitting Claim...
                        </>
                     ) : (
                        <>
                           <Check className="w-5 h-5" />
                           Submit Claim for Review
                        </>
                     )}
                  </button>
               </div>
            </div>
         </div>

         {/* Success Modal */}
         {showSuccessModal && (
            <div className="fixed inset-0 z-50 overflow-y-auto">
               <div className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity" onClick={handleModalCancel}></div>

               <div className="flex min-h-full items-center justify-center p-4">
                  <div className="relative bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 border border-gray-200">
                     <div className="text-center">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                           <Check className="w-8 h-8 text-green-600" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Claim Submitted Successfully!</h3>
                        <p className="text-gray-600 mb-6">
                           Your claim has been submitted and is now under review by our HR team. You will receive updates via email and notifications.
                        </p>

                        <div className="flex space-x-3">
                           <button
                              onClick={handleModalOk}
                              className="flex-1 bg-green-600 text-white px-4 py-2.5 rounded-xl hover:bg-green-700 transition-colors font-medium"
                           >
                              View All Claims
                           </button>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         )}
      </>
   );
};