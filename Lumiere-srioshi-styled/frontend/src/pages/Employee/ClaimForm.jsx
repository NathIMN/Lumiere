// pages/ClaimForm.jsx
import React, { useState, useEffect } from 'react';
import { ChevronLeft, FileText, Car, Heart, Upload, AlertCircle, Check, X, Info, Clock, Shield, Camera } from 'lucide-react';
import InsuranceApiService from "../../services/insurance-api";
import { useNavigate } from "react-router-dom";
import { Questionnaire } from '../../components/forms/Questionnaire';
import { claimInstructions } from '../../components/forms/ClaimInstructions';
import { ReviewAndSubmit } from '../../components/forms/ReviewAndSubmit';

export const ClaimForm = () => {
   const [step, setStep] = useState(1);
   const [selectedPolicy, setSelectedPolicy] = useState(null);
   const [claimOption, setClaimOption] = useState('');
   const [loading, setLoading] = useState(false);
   const [formData, setFormData] = useState({});
   const [errors, setErrors] = useState({});
   const [userPolicies, setUserPolicies] = useState([]);
   const [policiesLoading, setPoliciesLoading] = useState(true);
   const [claimId, setClaimId] = useState(null);
   const [questionnaire, setQuestionnaire] = useState(null);

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
      setStep(2);
   };

   const handleClaimOptionSelect = (option) => {
      setClaimOption(option);
      setStep(3); // Move to instructions step
   };

   const handleProceedFromInstructions = async () => {
      setLoading(true);
      setErrors({});

      try {
         const response = await InsuranceApiService.createClaim({
            policy: selectedPolicy._id,
            claimType: selectedPolicy.policyType,
            claimOption: claimOption
         });

         if (response.success) {
            const claim = response.claim;
            setClaimId(claim._id);

            const questionnaireData = {
               claimId: claim._id,
               claimType: claim.claimType,
               claimOption: claimOption,
               isComplete: claim.questionnaire.isComplete,
               totalQuestions: 0,
               answeredQuestions: 0,
               sections: claim.questionnaire.sections || []
            };

            if (claim.questionnaire.sections) {
               questionnaireData.totalQuestions = claim.questionnaire.sections.reduce(
                  (sum, section) => sum + section.responses.length, 0);
               questionnaireData.answeredQuestions = claim.questionnaire.sections.reduce(
                  (sum, section) => sum + section.responses.filter(r => r.isAnswered).length, 0);
            }

            setQuestionnaire(questionnaireData);

            setStep(4); // Move to questionnaire step
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

   const handleQuestionnaireComplete = (questionnaireFormData) => {
      setFormData(prevData => ({ ...prevData, ...questionnaireFormData }));
      setStep(5); // Update step number
   };

   const goBack = () => {
      if (step === 2) {
         setStep(1);
         setSelectedPolicy(null);
      } else if (step === 3) {
         setStep(2);
         setClaimOption('');
      } else if (step === 4) {
         setStep(3);
      } else if (step === 5) {
         setStep(4);
      }
   };

   const getCoverageTypesList = (policy) => {
      const coverageTypes = policy.policyType === 'life'
         ? policy.coverage.typeLife
         : policy.coverage.typeVehicle;

      return coverageTypes.slice(0, 3).join(', ') + (coverageTypes.length > 3 ? '...' : '');
   };

   // Get current claim instructions
   const getCurrentInstructions = () => {
      if (!selectedPolicy || !claimOption) return null;
      return claimInstructions[selectedPolicy.policyType]?.[claimOption];
   };

   return (
      <div className="min-h-screen py-8 px-4">
         <div className="max-w-4xl mx-auto">

            {/* Header */}
            <div className="text-center mb-8">
               <h1 className="text-3xl font-bold text-gray-900 mb-2">Insurance Claim Request</h1>
               <p className="text-gray-600">Submit your claim by following the steps below</p>
            </div>

            {/* Main Content */}
            {step < 4 && (
               <div className="bg-white rounded-xl shadow-lg p-8">
                  <div className="flex justify-between items-center mb-6">
                     {step > 1 && step !== 4 && (
                        <button
                           onClick={goBack}
                           className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
                        >
                           <ChevronLeft className="w-4 h-4 mr-1" />
                           Back
                        </button>
                     )}
                  </div>

                  {/* Error display for API errors */}
                  {errors.api && (
                     <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                        <p className="text-red-700 flex items-center gap-2">
                           <AlertCircle className="w-5 h-5" />
                           {errors.api}
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
                           <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                              {userPolicies
                                 .reduce((acc, policy) => {
                                    const existingType = acc.find(item => item.type === policy.policyType);
                                    if (existingType) {
                                       existingType.policies.push(policy);
                                    } else {
                                       acc.push({
                                          type: policy.policyType,
                                          policies: [policy]
                                       });
                                    }
                                    return acc;
                                 }, [])
                                 .map((policyGroup) => {
                                    const IconComponent = claimTypeIcons[policyGroup.type];
                                    const isLife = policyGroup.type === 'life';

                                    return (
                                       <div key={policyGroup.type} className="group">
                                          <div className={`relative overflow-hidden rounded-2xl p-8 border-2 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl cursor-pointer ${isLife
                                             ? 'bg-gradient-to-br from-pink-50 via-red-50 to-rose-100 border-pink-200 hover:border-pink-400 hover:shadow-pink-100'
                                             : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100 border-blue-200 hover:border-blue-400 hover:shadow-blue-100'
                                             }`}>
                                             {/* Background Pattern */}
                                             <div className="absolute inset-0 opacity-5">
                                                <div className={`w-full h-full ${isLife ? 'bg-pink-500' : 'bg-blue-500'}`}
                                                   style={{
                                                      backgroundImage: `radial-gradient(circle at 20px 20px, currentColor 2px, transparent 2px)`,
                                                      backgroundSize: '40px 40px'
                                                   }}
                                                />
                                             </div>

                                             {/* Content */}
                                             <div className="relative z-10">
                                                {/* Icon and Title */}
                                                <div className="flex items-center gap-4 mb-6">
                                                   <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 ${isLife
                                                      ? 'bg-gradient-to-br from-pink-500 to-red-600 shadow-lg shadow-pink-200'
                                                      : 'bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-200'
                                                      }`}>
                                                      <IconComponent className="w-8 h-8 text-white" />
                                                   </div>
                                                   <div>
                                                      <h3 className="text-2xl font-bold text-gray-900 capitalize mb-1">
                                                         {policyGroup.type} Insurance
                                                      </h3>
                                                      <p className="text-gray-600">
                                                         {policyGroup.policies.length} Active {policyGroup.policies.length === 1 ? 'Policy' : 'Policies'}
                                                      </p>
                                                   </div>
                                                </div>

                                                {/* Policies List */}
                                                <div className="space-y-3 mb-6">
                                                   {policyGroup.policies.slice(0, 2).map((policy, index) => (
                                                      <div key={policy._id} className="bg-white/70 backdrop-blur-sm rounded-lg p-4 border border-white/50">
                                                         <div className="flex items-center justify-between">
                                                            <div className="flex-1">
                                                               <div className="flex items-center gap-2 mb-1">
                                                                  <span className="text-sm font-semibold text-gray-900">{policy.policyId}</span>
                                                                  <span className={`text-xs px-2 py-1 rounded-full ${isLife ? 'bg-pink-100 text-pink-700' : 'bg-blue-100 text-blue-700'
                                                                     }`}>
                                                                     Active
                                                                  </span>
                                                               </div>
                                                               <p className="text-sm text-gray-600 mb-1">
                                                                  Coverage: ${policy.coverage.coverageAmount.toLocaleString()}
                                                               </p>
                                                               <p className="text-xs text-gray-500">
                                                                  {getCoverageTypesList(policy)}
                                                               </p>
                                                            </div>
                                                         </div>
                                                      </div>
                                                   ))}

                                                   {policyGroup.policies.length > 2 && (
                                                      <div className="bg-white/50 backdrop-blur-sm rounded-lg p-3 border border-white/30 text-center">
                                                         <span className="text-sm text-gray-600">
                                                            +{policyGroup.policies.length - 2} more {policyGroup.policies.length - 2 === 1 ? 'policy' : 'policies'}
                                                         </span>
                                                      </div>
                                                   )}
                                                </div>

                                                {/* Action Button */}
                                                <button
                                                   onClick={() => {
                                                      // If only one policy of this type, select it directly
                                                      if (policyGroup.policies.length === 1) {
                                                         handlePolicySelect(policyGroup.policies[0]);
                                                      } else {
                                                         // Show policy selection modal or handle multiple policies
                                                         // For now, just select the first one
                                                         handlePolicySelect(policyGroup.policies[0]);
                                                      }
                                                   }}
                                                   className={`w-full py-3 px-6 rounded-xl font-semibold transition-all duration-300 transform group-hover:scale-105 ${isLife
                                                      ? 'bg-gradient-to-r from-pink-500 to-red-600 hover:from-pink-600 hover:to-red-700 text-white shadow-lg shadow-pink-200 hover:shadow-pink-300'
                                                      : 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg shadow-blue-200 hover:shadow-blue-300'
                                                      }`}
                                                >
                                                   Submit {policyGroup.type.charAt(0).toUpperCase() + policyGroup.type.slice(1)} Claim
                                                </button>
                                             </div>

                                             {/* Decorative Elements */}
                                             <div className={`absolute -top-4 -right-4 w-24 h-24 rounded-full opacity-10 ${isLife ? 'bg-pink-500' : 'bg-blue-500'
                                                }`} />
                                             <div className={`absolute -bottom-6 -left-6 w-32 h-32 rounded-full opacity-5 ${isLife ? 'bg-red-500' : 'bg-indigo-500'
                                                }`} />
                                          </div>
                                       </div>
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

                        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                           {claimOptions[selectedPolicy.policyType]?.map((option) => (
                              <button
                                 key={option}
                                 onClick={() => handleClaimOptionSelect(option)}
                                 className="p-6 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 text-center"
                              >
                                 <FileText className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                                 <h3 className="font-medium text-gray-900 capitalize">{option}</h3>
                              </button>
                           ))}
                        </div>
                     </div>
                  )}

                  {/* Step 3: Instructions and Preparation */}
                  {step === 3 && selectedPolicy && claimOption && (
                     <div className="space-y-8">
                        <div className="text-center mb-8">
                           <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                              <Info className="w-8 h-8 text-blue-600" />
                           </div>
                           <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                              {getCurrentInstructions()?.title} - Preparation Guide
                           </h2>
                           <p className="text-gray-600 max-w-2xl mx-auto">
                              {getCurrentInstructions()?.description}
                           </p>
                        </div>

                        {/* Required Documents */}
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
                           <div className="flex items-center gap-3 mb-4">
                              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                                 <FileText className="w-5 h-5 text-white" />
                              </div>
                              <h3 className="text-lg font-semibold text-gray-900">Required Documents</h3>
                           </div>
                           <p className="text-gray-600 mb-4">Please ensure you have the following documents ready before proceeding:</p>
                           <div className="grid md:grid-cols-2 gap-3">
                              {getCurrentInstructions()?.documents?.map((doc, index) => (
                                 <div key={index} className="flex items-start gap-2 text-sm">
                                    <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                                    <span className="text-gray-700">{doc}</span>
                                 </div>
                              ))}
                           </div>
                        </div>

                        {/* Required Information */}
                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100">
                           <div className="flex items-center gap-3 mb-4">
                              <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                                 <Shield className="w-5 h-5 text-white" />
                              </div>
                              <h3 className="text-lg font-semibold text-gray-900">Information You'll Need</h3>
                           </div>
                           <p className="text-gray-600 mb-4">Make sure you have details about the following:</p>
                           <div className="grid md:grid-cols-2 gap-3">
                              {getCurrentInstructions()?.information?.map((info, index) => (
                                 <div key={index} className="flex items-start gap-2 text-sm">
                                    <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                                    <span className="text-gray-700">{info}</span>
                                 </div>
                              ))}
                           </div>
                        </div>

                        {/* Tips and Best Practices */}
                        <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-6 border border-amber-100">
                           <div className="flex items-center gap-3 mb-4">
                              <div className="w-8 h-8 bg-amber-600 rounded-lg flex items-center justify-center">
                                 <Camera className="w-5 h-5 text-white" />
                              </div>
                              <h3 className="text-lg font-semibold text-gray-900">Important Tips</h3>
                           </div>
                           <p className="text-gray-600 mb-4">Follow these guidelines for a smooth claim process:</p>
                           <div className="space-y-3">
                              {getCurrentInstructions()?.tips?.map((tip, index) => (
                                 <div key={index} className="flex items-start gap-2 text-sm">
                                    <div className="w-5 h-5 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                       <span className="text-amber-600 font-bold text-xs">{index + 1}</span>
                                    </div>
                                    <span className="text-gray-700">{tip}</span>
                                 </div>
                              ))}
                           </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex justify-between items-center pt-6">
                           <button
                              onClick={goBack}
                              className="flex items-center gap-2 bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                           >
                              <ChevronLeft className="w-4 h-4" />
                              Back to Claim Types
                           </button>

                           <div className="text-right">
                              <p className="text-sm text-gray-600 mb-3">Ready to proceed?</p>
                              <button
                                 onClick={handleProceedFromInstructions}
                                 disabled={loading}
                                 className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                              >
                                 {loading ? (
                                    <>
                                       <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                       Loading Form...
                                    </>
                                 ) : (
                                    <>
                                       Start Questionnaire
                                       <ChevronLeft className="w-4 h-4 rotate-180" />
                                    </>
                                 )}
                              </button>
                           </div>
                        </div>
                     </div>
                  )}


               </div>
            )}

            {/* Step 4: Questionnaire */}
            {step === 4 && questionnaire && (
               <Questionnaire
                  claimId={claimId}
                  questionnaire={questionnaire}
                  setQuestionnaire={setQuestionnaire}
                  selectedPolicy={selectedPolicy}
                  claimOption={claimOption}
                  onComplete={handleQuestionnaireComplete}
               />
            )}

            {/* Step 5: Review and Final Submission */}
            {step === 5 && questionnaire && (
               <ReviewAndSubmit
               claimId={claimId}
                  questionnaire={questionnaire}
                  selectedPolicy={selectedPolicy}
               />
            )}

         </div>
      </div>
   );
};