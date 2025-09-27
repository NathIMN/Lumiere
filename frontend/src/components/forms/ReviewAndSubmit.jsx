import { useState } from 'react';
import { Check, Upload, AlertCircle, FileText } from 'lucide-react';
import { useNavigate } from "react-router-dom";
import InsuranceApiService from '../../services/insurance-api';
import { X } from 'lucide-react';

export const ReviewAndSubmit = ({
   questionnaire,
   selectedPolicy,
   claimId
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
         const submissionData = {
            claimAmount: parseFloat(claimAmount),
            documents: additionalDocuments.length > 0 ? additionalDocuments : []
         };

         const response = await InsuranceApiService.submitClaim(claimId, submissionData);

         if (response.success) {
            setShowSuccessModal(true);
            console.log('Claim submitted:', response.claim);
            setSubmitted(true);
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


   return (
      <div className="bg-white rounded-xl shadow-lg p-8">
         <div className="space-y-8">

            {/* Success Modal */}
            {showSuccessModal && (
               <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                  <div className="bg-white rounded-lg max-w-md w-full p-6 relative shadow-lg">
                     <button
                        onClick={handleModalCancel}
                        className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                     >
                        <X className="w-6 h-6" />
                     </button>

                     <div className="flex items-center justify-center mb-4">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                           <Check className="w-8 h-8 text-green-600" />
                        </div>
                     </div>

                     <div className="text-center mb-6">
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                           Claim Submitted Successfully!
                        </h3>
                        <p className="text-gray-600">
                           Your insurance claim has been submitted for HR review. You will be notified of any updates.
                        </p>
                     </div>

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
                           {section.questions.filter(q => q.isAnswered).map((question, qIndex) => (
                              <div key={qIndex} className="text-sm">
                                 <span className="text-gray-600">{question.questionText}:</span>
                                 <span className="ml-2 text-gray-800">
                                    {question.questionType === 'boolean'
                                       ? (question.answer?.booleanValue ? 'Yes' : 'No')
                                       : question.questionType === 'file'
                                          ? `${Array.isArray(question.answer?.fileValue) ? question.answer.fileValue.length : 1} file(s)`
                                          : (
                                             question.answer?.textValue ||
                                             question.answer?.numberValue ||
                                             question.answer?.dateValue ||
                                             question.answer?.selectValue ||
                                             question.answer?.multiselectValue ||
                                             ''
                                          )
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
                        checked={finalConsent}
                        onChange={(e) => {
                           setFinalConsent(e.target.checked);
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
            <div className="flex justify-end pt-6">
               <button
                  onClick={() => {
                     if (submitted) {
                        navigate("/employee/claims");
                        return;
                     }

                     if (!finalConsent) {
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
                     <>Exit</>
                  ) : (
                     <>
                        Submit for HR Review
                        <FileText className="w-5 h-5" />
                     </>
                  )}
               </button>
            </div>
         </div>
      </div>
   );
};