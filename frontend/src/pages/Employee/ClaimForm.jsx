// pages/ClaimForm.jsx
import React, { useState, useEffect } from 'react';
import { ChevronLeft, FileText, Car, Heart, AlertCircle, Hospital, Pill, Skull, Shield, Flame, CloudLightning } from 'lucide-react';
import InsuranceApiService from "../../services/insurance-api";
import { useNavigate } from "react-router-dom";
import { Questionnaire } from '../../components/forms/Questionnaire';
import { ClaimInstructions } from '../../components/forms/ClaimInstructions';
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

   const navigate = useNavigate();

   const claimOptions = {
      life: ["hospitalization", "channelling", "medication", "death"],
      vehicle: ["accident", "theft", "fire", "naturalDisaster"]
   };

   const optionIcons = {
      hospitalization: Hospital,
      channelling: FileText,
      medication: Pill,
      death: Heart, // Changed from Skull - represents life insurance benefit
      accident: Car,
      theft: Shield,
      fire: Flame,
      naturalDisaster: CloudLightning,
   };

   // Color schemes for each option
   const optionColors = {
      hospitalization: {
         bg: 'bg-green-100',
         hover: 'hover:bg-green-200 hover:shadow-green-200',
      },
      channelling: {
         bg: 'bg-indigo-100',
         hover: 'hover:bg-indigo-200 hover:shadow-indigo-200',
      },
      medication: {
         bg: 'bg-yellow-100',
         hover: 'hover:bg-yellow-200 hover:shadow-yellow-200',
      },
      death: {
         bg: 'bg-neutral-100',
         hover: 'hover:bg-neutral-200 hover:shadow-neutral-200',
      },
      accident: {
         bg: 'bg-orange-100',
         hover: 'hover:bg-orange-200 hover:shadow-orange-200',
      },
      theft: {
         bg: 'bg-slate-100',
         hover: 'hover:bg-slate-200 hover:shadow-slate-200',
      },
      fire: {
         bg: 'bg-red-100',
         hover: 'hover:bg-red-200 hover:shadow-red-200',
      },
      naturalDisaster: {
         bg: 'bg-blue-100',
         hover: 'hover:bg-blue-200 hover:shadow-blue-200',
      }
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

   const handleQuestionnaireComplete = (questionnaireFormData = {}) => {
      // If form data is provided, store it (though ReviewAndSubmit doesn't need it)
      if (Object.keys(questionnaireFormData).length > 0) {
         setFormData(prevData => ({ ...prevData, ...questionnaireFormData }));
      }
      setStep(5); // Move to review and submit step
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

   return (
      <div className="min-h-screen mb-8 px-4">
         <div className="max-w-4xl mx-auto">

            {/* Header */}
            <div className="text-center mb-8">
               <h1 className="text-3xl font-bold text-gray-900 mb-2 dark:text-white">Insurance Claim Request</h1>
               <p className="text-gray-600 dark:text-gray-400">Submit your claim by following the steps below</p>
            </div>

            {/* Main Content */}
            {step < 4 && (
               <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-8">

                  {step > 1 && step !== 4 && (
                     <div className="flex justify-between items-center mb-6">
                        <button
                           onClick={goBack}
                           className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
                        >
                           <ChevronLeft className="w-4 h-4 mr-1" />
                           Back
                        </button>
                     </div>
                  )}


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
                     <div className="space-y-4">
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
                                    const isLife = policyGroup.type === 'life';

                                    return (
                                       <div
                                          key={policyGroup.type}
                                          onClick={() => {
                                             if (policyGroup.policies.length === 1) {
                                                handlePolicySelect(policyGroup.policies[0]);
                                             } else {
                                                handlePolicySelect(policyGroup.policies[0]);
                                             }
                                          }}
                                          className={`relative overflow-hidden rounded-2xl cursor-pointer transition-all duration-500 hover:scale-[1.03] hover:shadow-xl group ${isLife
                                             ? 'bg-rose-50 hover:shadow-rose-200'
                                             : 'bg-blue-50 hover:shadow-blue-200'
                                             }`}
                                       >
                                          {/* Content Container */}
                                          <div className="relative z-10 p-6 h-full flex flex-col">
                                             {/* Header with Policy IDs */}
                                             <div className="mb-6">
                                                <div className="flex justify-between items-start">
                                                   <h2 className={`text-2xl font-bold capitalize ${isLife ? 'text-rose-800' : 'text-blue-800'
                                                      }`}>
                                                      {policyGroup.type} Insurance
                                                   </h2>
                                                   <div className="text-right space-y-1">
                                                      {policyGroup.policies.slice(0, 3).map((policy) => (
                                                         <div key={policy._id} className="text-md font-semibold text-gray-700">
                                                            {policy.policyId}
                                                         </div>
                                                      ))}
                                                      {policyGroup.policies.length > 3 && (
                                                         <div className="text-xs text-gray-500">
                                                            +{policyGroup.policies.length - 3} more
                                                         </div>
                                                      )}
                                                   </div>
                                                </div>
                                             </div>

                                             {/* Image - Below header */}
                                             <div className="flex justify-center flex-1 items-center">
                                                <img
                                                   src={isLife ? '/life.png' : '/vehicle.png'}
                                                   alt={`${policyGroup.type} insurance`}
                                                   className="w-64 h-64 object-contain opacity-80 group-hover:opacity-100 transition-opacity duration-300"
                                                />
                                             </div>

                                             {/* Hover Indicator */}
                                             <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300">
                                                <div className={`w-3 h-3 rounded-full ${isLife ? 'bg-rose-400' : 'bg-blue-400'
                                                   } animate-pulse`} />
                                             </div>
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
                           {claimOptions[selectedPolicy.policyType]?.map((option) => {
                              const Icon = optionIcons[option];
                              const colors = optionColors[option];
                              return (
                                 <button
                                    key={option}
                                    onClick={() => handleClaimOptionSelect(option)}
                                    className={`p-6 border-2 border-gray-200 rounded-xl ${colors.bg} ${colors.hover} hover:border-gray-400 transition-all duration-300 text-center hover:scale-105 hover:shadow-xl group transform`}
                                 >
                                    {Icon && <Icon className="w-24 h-24 text-gray-600 group-hover:text-gray-800 mx-auto mb-3 transition-colors duration-300" />}
                                    <h3 className="font-medium text-gray-900 text-lg capitalize">{option}</h3>
                                 </button>
                              );
                           })}
                        </div>

                     </div>
                  )}

                  {/* Step 3: Instructions and Preparation */}
                  {step === 3 && selectedPolicy && claimOption && (
                     <ClaimInstructions
                        claimType={selectedPolicy.policyType}
                        claimOption={claimOption}
                        onProceed={handleProceedFromInstructions}
                        onBack={goBack}
                        loading={loading}
                     />
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