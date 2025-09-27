import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Questionnaire } from '../../components/forms/Questionnaire';
import InsuranceApiService from '../../services/insurance-api';
import DocumentApiService from '../../services/document-api';

import {
   Calendar,
   Clock,
   DollarSign,
   FileText,
   CheckCircle,
   XCircle,
   AlertCircle,
   Edit3,
   Trash2,
   ArrowLeft,
   User,
   Shield,
   Building,
   X,
   ChevronRight,
   Hash,
   Settings,
   Eye,
   EyeClosed
} from 'lucide-react';

export const ClaimDetails = () => {
   const { id: claimId } = useParams();
   const navigate = useNavigate();

   const [claim, setClaim] = useState(null);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState(null);
   const [questionnaire, setQuestionnaire] = useState(null);
   const [selectedPolicy, setSelectedPolicy] = useState(null);
   const [showDeleteModal, setShowDeleteModal] = useState(false);
   const [showQuestionnaireModal, setShowQuestionnaireModal] = useState(false);
   const [showReviewAndSubmitModal, setShowReviewAndSubmitModal] = useState(false);
   const [deleting, setDeleting] = useState(false);
   const [showCompletedQuestionnaire, setShowCompletedQuestionnaire] = useState(false);
   console.log("questonnaire + ", questionnaire);
   useEffect(() => {
      if (claimId) {
         fetchClaimDetails();
      }
   }, [claimId]);

   const fetchClaimDetails = async () => {
      try {
         setLoading(true);
         setError(null);

         const response = await InsuranceApiService.getClaimById(claimId);
         const claimData = response.claim;
         setClaim(claimData);

         if (claimData.questionnaire) {
            setQuestionnaire(claimData.questionnaire);
         }

         if (claimData.policy) {
            setSelectedPolicy(claimData.policy);
         }

      } catch (err) {
         console.error('Error fetching claim details:', err);
         setError(err.message || 'Failed to load claim details');
      } finally {
         setLoading(false);
      }
   };

   const handleQuestionnaireComplete = async () => {
      await fetchClaimDetails();
      setShowQuestionnaireModal(false);
   };

   const handleDeleteClaim = async () => {
      try {
         setDeleting(true);
         await InsuranceApiService.deleteClaim(claim._id);
         navigate('/employee/claims');
      } catch (err) {
         console.error('Error deleting claim:', err);
         setError(err.message || 'Failed to delete claim');
      } finally {
         setDeleting(false);
         setShowDeleteModal(false);
      }
   };

   const getStatusColor = (status) => {
      switch (status) {
         case 'draft': return 'text-slate-600 bg-slate-100 border-slate-200 dark:text-slate-300 dark:bg-slate-800 dark:border-slate-600';
         case 'employee': return 'text-blue-600 bg-blue-50 border-blue-200 dark:text-blue-400 dark:bg-blue-900/30 dark:border-blue-700';
         case 'hr': return 'text-amber-600 bg-amber-50 border-amber-200 dark:text-amber-400 dark:bg-amber-900/30 dark:border-amber-700';
         case 'insurer': return 'text-orange-600 bg-orange-50 border-orange-200 dark:text-orange-400 dark:bg-orange-900/30 dark:border-orange-700';
         case 'approved': return 'text-emerald-600 bg-emerald-50 border-emerald-200 dark:text-emerald-400 dark:bg-emerald-900/30 dark:border-emerald-700';
         case 'rejected': return 'text-rose-600 bg-rose-50 border-rose-200 dark:text-rose-400 dark:bg-rose-900/30 dark:border-rose-700';
         default: return 'text-slate-600 bg-slate-100 border-slate-200 dark:text-slate-300 dark:bg-slate-800 dark:border-slate-600';
      }
   };

   const getStatusIcon = (status) => {
      switch (status) {
         case 'approved': return <CheckCircle className="w-4 h-4" />;
         case 'rejected': return <XCircle className="w-4 h-4" />;
         case 'draft':
         case 'employee': return <Edit3 className="w-4 h-4" />;
         default: return <Clock className="w-4 h-4" />;
      }
   };

   const canEdit = () => {
      return claim && ['draft', 'employee'].includes(claim.claimStatus);
   };

   const canDelete = () => {
      return claim && ['draft', 'employee'].includes(claim.claimStatus);
   };

   const formatDate = (dateString) => {
      if (!dateString) return 'N/A';
      return new Date(dateString).toLocaleDateString('en-US', {
         year: 'numeric',
         month: 'short',
         day: 'numeric',
         hour: '2-digit',
         minute: '2-digit'
      });
   };

   const formatCurrency = (amount) => {
      if (!amount) return 'N/A';
      return new Intl.NumberFormat('en-US', {
         style: 'currency',
         currency: 'USD'
      }).format(amount);
   };

   const getStatus = (status) => {
      switch (status) {
         case "draft": return "Incomplete";
         case "employee": return "Awaiting submission";
         case "hr": return "Under HR review";
         case "insurer": return "Insurance side processing";
         case "approved": return "Approved";
         case "rejected": return "Rejected";
         default: return "Check info";
      }
   };

   if (loading) {
      return (
         <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
            <div className="text-center">
               <div className="relative">
                  <div className="animate-spin rounded-full h-16 w-16 border-4 border-slate-200 dark:border-slate-600 border-t-blue-600 mx-auto"></div>
                  <div className="absolute inset-0 rounded-full h-16 w-16 border-4 border-transparent border-t-blue-400 animate-ping opacity-20 mx-auto"></div>
               </div>
               <p className="mt-6 text-slate-600 dark:text-slate-300 font-medium">Loading claim details...</p>
            </div>
         </div>
      );
   }

   if (error) {
      return (
         <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
            <div className="text-center bg-white dark:bg-neutral-900 rounded-2xl shadow-xl p-8 max-w-md mx-4 border border-gray-200 dark:border-neutral-700">
               <XCircle className="w-16 h-16 text-rose-500 mx-auto" />
               <h2 className="mt-6 text-2xl font-bold text-slate-900 dark:text-white">Error Loading Claim</h2>
               <p className="mt-3 text-slate-600 dark:text-slate-300">{error}</p>
               <button
                  onClick={() => navigate('/employee/claims')}
                  className="mt-6 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
               >
                  Back to Claims
               </button>
            </div>
         </div>
      );
   }

   if (!claim) {
      return (
         <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
            <div className="text-center bg-white dark:bg-neutral-900 rounded-2xl shadow-xl p-8 max-w-md mx-4 border border-gray-200 dark:border-neutral-700">
               <FileText className="w-16 h-16 text-slate-400 dark:text-slate-500 mx-auto" />
               <h2 className="mt-6 text-2xl font-bold text-slate-900 dark:text-white">Claim Not Found</h2>
               <p className="mt-3 text-slate-600 dark:text-slate-300">The requested claim could not be found.</p>
               <button
                  onClick={() => navigate('/employee/claims')}
                  className="mt-6 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
               >
                  Back to Claims
               </button>
            </div>
         </div>
      );
   }

   return (
      <div className="min-h-screen">
         <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
               <div className="flex items-center space-x-4">
                  <button
                     onClick={() => navigate('/employee/claims')}
                     className="p-2.5 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 rounded-xl hover:bg-white/60 dark:hover:bg-neutral-800/60 transition-all duration-200 backdrop-blur-sm"
                  >
                     <ArrowLeft className="w-5 h-5" />
                  </button>
                  <div className={`flex items-center space-x-3 px-4 py-2 rounded-xl border backdrop-blur-sm ${getStatusColor(claim.claimStatus)}`}>
                     {getStatusIcon(claim.claimStatus)}
                     <span className="font-semibold capitalize">{claim.claimStatus}</span>
                  </div>
               </div>

               {canDelete() && (
                  <button
                     onClick={() => setShowDeleteModal(true)}
                     className="flex items-center space-x-2 px-4 py-2.5 text-rose-600 dark:text-rose-400 bg-white/60 dark:bg-neutral-800/60 backdrop-blur-sm border border-rose-200 dark:border-rose-700 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all duration-200 font-medium"
                  >
                     <Trash2 className="w-4 h-4" />
                     <span>Delete Claim</span>
                  </button>
               )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
               {/* Main Content */}
               <div className="lg:col-span-2 space-y-8">
                  {/* Claim Overview */}
                  <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-gray-200 dark:border-neutral-700 p-8">
                     <div className="flex items-center space-x-3 mb-6">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                           <Shield className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Claim Overview</h2>
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="group">
                           <label className="block text-sm font-medium text-slate-500 dark:text-neutral-400 mb-2">Claim ID</label>
                           <div className="flex items-center space-x-3 p-3 rounded-xl bg-gradient-to-r from-slate-50 to-slate-100 dark:from-neutral-800 dark:to-neutral-700 group-hover:from-blue-50 group-hover:to-blue-100 dark:group-hover:from-blue-900/20 dark:group-hover:to-blue-800/20 transition-all duration-200">
                              <Hash className="w-5 h-5 text-slate-400 dark:text-neutral-500 group-hover:text-blue-500 dark:group-hover:text-blue-400" />
                              <span className="font-semibold text-slate-900 dark:text-white capitalize">
                                 {claim.claimId}
                              </span>
                           </div>
                        </div>

                        <div className="group">
                           <label className="block text-sm font-medium text-slate-500 dark:text-neutral-400 mb-2">Current Status</label>
                           <div className="flex items-center space-x-3 p-3 rounded-xl bg-gradient-to-r from-slate-50 to-slate-100 dark:from-neutral-800 dark:to-neutral-700 group-hover:from-yellow-50 group-hover:to-yellow-100 dark:group-hover:from-blue-900/20 dark:group-hover:to-blue-800/20 transition-all duration-200">
                              <CheckCircle className="w-5 h-5 text-slate-400 dark:text-neutral-500 group-hover:text-blue-500 dark:group-hover:text-blue-400" />
                              <span className="font-semibold text-slate-900 dark:text-white capitalize">
                                 {getStatus(claim.claimStatus)}
                              </span>
                           </div>
                        </div>

                        <div className="group">
                           <label className="block text-sm font-medium text-slate-500 dark:text-neutral-400 mb-2">Claim Type</label>
                           <div className="flex items-center space-x-3 p-3 rounded-xl bg-gradient-to-r from-slate-50 to-slate-100 dark:from-neutral-800 dark:to-neutral-700 group-hover:from-blue-50 group-hover:to-blue-100 dark:group-hover:from-blue-900/20 dark:group-hover:to-blue-800/20 transition-all duration-200">
                              <FileText className="w-5 h-5 text-slate-400 dark:text-neutral-500 group-hover:text-blue-500 dark:group-hover:text-blue-400" />
                              <span className="font-semibold text-slate-900 dark:text-white capitalize">
                                 {claim.claimType} Insurance
                              </span>
                           </div>
                        </div>

                        <div className="group">
                           <label className="block text-sm font-medium text-slate-500 dark:text-neutral-400 mb-2">Claim Option</label>
                           <div className="flex items-center space-x-3 p-3 rounded-xl bg-gradient-to-r from-slate-50 to-slate-100 dark:from-neutral-800 dark:to-neutral-700 group-hover:from-emerald-50 group-hover:to-emerald-100 dark:group-hover:from-emerald-900/20 dark:group-hover:to-emerald-800/20 transition-all duration-200">
                              <Settings className="w-5 h-5 text-slate-400 dark:text-neutral-500 group-hover:text-emerald-500 dark:group-hover:text-emerald-400" />
                              <span className="font-semibold text-slate-900 dark:text-white capitalize">
                                 {claim.claimOption || claim.lifeClaimOption || claim.vehicleClaimOption || 'N/A'}
                              </span>
                           </div>
                        </div>

                        <div className="group">
                           <label className="block text-sm font-medium text-slate-500 dark:text-neutral-400 mb-2">Requested Amount</label>
                           <div className="flex items-center space-x-3 p-3 rounded-xl bg-gradient-to-r from-slate-50 to-slate-100 dark:from-neutral-800 dark:to-neutral-700 group-hover:from-green-50 group-hover:to-green-100 dark:group-hover:from-green-900/20 dark:group-hover:to-green-800/20 transition-all duration-200">
                              <DollarSign className="w-5 h-5 text-slate-400 dark:text-neutral-500 group-hover:text-green-500 dark:group-hover:text-green-400" />
                              <span className="font-bold text-slate-900 dark:text-white">
                                 {formatCurrency(claim.claimAmount?.requested)}
                              </span>
                           </div>
                        </div>

                        <div className="group">
                           <label className="block text-sm font-medium text-slate-500 dark:text-neutral-400 mb-2">Created</label>
                           <div className="flex items-center space-x-3 p-3 rounded-xl bg-gradient-to-r from-slate-50 to-slate-100 dark:from-neutral-800 dark:to-neutral-700 group-hover:from-purple-50 group-hover:to-purple-100 dark:group-hover:from-purple-900/20 dark:group-hover:to-purple-800/20 transition-all duration-200">
                              <Calendar className="w-5 h-5 text-slate-400 dark:text-neutral-500 group-hover:text-purple-500 dark:group-hover:text-purple-400" />
                              <span className="font-medium text-slate-900 dark:text-white">
                                 {formatDate(claim.createdAt)}
                              </span>
                           </div>
                        </div>
                     </div>
                  </div>

                  {/* Status-specific Information */}
                  {claim.claimStatus === 'approved' && claim.decision && (
                     <div className="bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 rounded-2xl border border-emerald-200 dark:border-emerald-700 p-8 shadow-lg">
                        <div className="flex items-center space-x-3 mb-6">
                           <CheckCircle className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                           <h3 className="text-xl font-bold text-emerald-900 dark:text-emerald-100">Claim Approved</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                           <div>
                              <label className="block text-sm font-semibold text-emerald-700 dark:text-emerald-300 mb-2">Approved Amount</label>
                              <p className="text-2xl font-bold text-emerald-900 dark:text-emerald-100">
                                 {formatCurrency(claim.decision.approvedAmount)}
                              </p>
                           </div>
                           <div>
                              <label className="block text-sm font-semibold text-emerald-700 dark:text-emerald-300 mb-2">Decision Date</label>
                              <p className="text-lg font-medium text-emerald-900 dark:text-emerald-100">
                                 {formatDate(claim.decision.decidedAt)}
                              </p>
                           </div>
                        </div>
                        {claim.decision.insurerNotes && (
                           <div className="mt-6">
                              <label className="block text-sm font-semibold text-emerald-700 dark:text-emerald-300 mb-2">Insurer Notes</label>
                              <div className="p-4 bg-white/60 dark:bg-emerald-800/20 rounded-xl border border-emerald-200 dark:border-emerald-600">
                                 <p className="text-emerald-900 dark:text-emerald-100">{claim.decision.insurerNotes}</p>
                              </div>
                           </div>
                        )}
                     </div>
                  )}

                  {claim.claimStatus === 'rejected' && claim.decision && (
                     <div className="bg-gradient-to-r from-rose-50 to-red-50 dark:from-rose-900/20 dark:to-red-900/20 rounded-2xl border border-rose-200 dark:border-rose-700 p-8 shadow-lg">
                        <div className="flex items-center space-x-3 mb-6">
                           <XCircle className="w-8 h-8 text-rose-600 dark:text-rose-400" />
                           <h3 className="text-xl font-bold text-rose-900 dark:text-rose-100">Claim Rejected</h3>
                        </div>
                        <div className="space-y-4">
                           <div>
                              <label className="block text-sm font-semibold text-rose-700 dark:text-rose-300 mb-2">Rejection Reason</label>
                              <div className="p-4 bg-white/60 dark:bg-rose-800/20 rounded-xl border border-rose-200 dark:border-rose-600">
                                 <p className="text-rose-900 dark:text-rose-100">{claim.decision.rejectionReason || 'No reason provided'}</p>
                              </div>
                           </div>
                           <div>
                              <label className="block text-sm font-semibold text-rose-700 dark:text-rose-300 mb-2">Decision Date</label>
                              <p className="text-lg font-medium text-rose-900 dark:text-rose-100">
                                 {formatDate(claim.decision.decidedAt)}
                              </p>
                           </div>
                        </div>
                        {claim.decision.insurerNotes && (
                           <div className="mt-6">
                              <label className="block text-sm font-semibold text-rose-700 dark:text-rose-300 mb-2">Insurer Notes</label>
                              <div className="p-4 bg-white/60 dark:bg-rose-800/20 rounded-xl border border-rose-200 dark:border-rose-600">
                                 <p className="text-rose-900 dark:text-rose-100">{claim.decision.insurerNotes}</p>
                              </div>
                           </div>
                        )}
                     </div>
                  )}

                  {claim.returnReason && (
                     <div className="bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 rounded-2xl border border-amber-200 dark:border-amber-700 p-8 shadow-lg">
                        <div className="flex items-center space-x-3 mb-6">
                           <AlertCircle className="w-8 h-8 text-amber-600 dark:text-amber-400" />
                           <h3 className="text-xl font-bold text-amber-900 dark:text-amber-100">Claim Returned</h3>
                        </div>
                        <div>
                           <label className="block text-sm font-semibold text-amber-700 dark:text-amber-300 mb-2">Return Reason</label>
                           <div className="p-4 bg-white/60 dark:bg-amber-800/20 rounded-xl border border-amber-200 dark:border-amber-600">
                              <p className="text-amber-900 dark:text-amber-100">{claim.returnReason}</p>
                           </div>
                        </div>
                     </div>
                  )}

                  {/* Questionnaire Section */}
                  {questionnaire && (
                     <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-gray-200 dark:border-neutral-700 p-8 shadow-lg">
                        <div className="flex items-center justify-between mb-6">
                           <div className="flex items-center space-x-3">
                              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                                 <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                              </div>
                              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Questionnaire</h2>
                           </div>

                           {questionnaire.isComplete ? (
                              <div className="flex items-center space-x-2 px-3 py-1.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-lg border border-emerald-200 dark:border-emerald-700">
                                 <CheckCircle className="w-4 h-4" />
                                 <span className="text-sm font-semibold">Complete</span>
                              </div>
                           ) : (
                              <div className="flex items-center space-x-2 px-3 py-1.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-lg border border-amber-200 dark:border-amber-700">
                                 <AlertCircle className="w-4 h-4" />
                                 <span className="text-sm font-semibold">Incomplete</span>
                              </div>
                           )}
                        </div>


                        {(questionnaire.isComplete && claim.claimStatus == "employee") && (
                           <div className="flex items-center mb-5 width-full space-x-2 px-3 py-2 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-lg ">

                              <span className="text-sm font-semibold">You have completed the questionnaire. Recheck your answers and Submit for HR review to process it</span>
                           </div>
                        )}


                        {questionnaire.isComplete ? (
                           // All completed questionnaires are hidden by default - show buttons for all statuses
                           <div className="space-y-6">
                              {/* Action buttons */}
                              <div className="flex flex-wrap gap-3 justify-center">
                                 <button
                                    onClick={() => setShowCompletedQuestionnaire(!showCompletedQuestionnaire)}
                                    className="inline-flex items-center w-[200px] space-x-2 px-4 py-2.5 bg-gradient-to-r from-blue-400 to-blue-500 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
                                 >
                                    
                                    <span>{showCompletedQuestionnaire ? 'Hide' : 'View'} Questionnaire</span>
                                    {showCompletedQuestionnaire ? <EyeClosed className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    
                                 </button>

                                 {canEdit() && (
                                    <button
                                       onClick={() => setShowQuestionnaireModal(true)}
                                       className="inline-flex items-center space-x-2 w-[200px] px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-xl hover:from-amber-700 hover:to-amber-800 transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
                                    >
                                       <Edit3 className="w-4 h-4" />
                                       <span>Edit Questionnaire</span>
                                    </button>
                                 )}

                                 {canEdit() && (
                                    <button
                                       onClick={() => setShowReviewAndSubmitModal(true)}
                                       className="inline-flex items-center w-[200px] space-x-2 px-4 py-2.5 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
                                    >
                                       <Edit3 className="w-4 h-4" />
                                       <span>Submit Claim</span>
                                    </button>
                                 )}
                              </div>

                              {/* Collapsible questionnaire content */}
                              {showCompletedQuestionnaire && (
                                 
                                 <div className="space-y-6 animate-in slide-in-from-top-3 duration-300">
                                    {questionnaire.sections?.map((section) => (
                                       <div key={section.sectionId} className="border border-slate-200 dark:border-neutral-700 rounded-xl overflow-hidden">
                                          <div className="bg-gradient-to-r from-slate-100 to-slate-50 dark:from-neutral-800 dark:to-neutral-700 px-6 py-4 border-b border-slate-200 dark:border-neutral-700">
                                             <h3 className="font-semibold text-slate-900 dark:text-white">{section.title}</h3>
                                             {section.description && (
                                                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{section.description}</p>
                                             )}
                                          </div>
                                          <div className="p-6 space-y-4">
                                             {section.responses?.map((response) => (
                                                <div key={response.questionId} className="border-b border-slate-100 dark:border-neutral-700 pb-4 last:border-b-0">
                                                   <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                                      {response.questionText}
                                                      {response.isRequired && <span className="text-rose-500 ml-1">*</span>}
                                                   </label>
                                                   <div className="text-sm text-slate-900 dark:text-white">
                                                      {response.isAnswered ? (
                                                         (() => {
                                                            const answer = response.answer;
                                                            const displayValue = answer.textValue ||
                                                               answer.numberValue ||
                                                               (answer.dateValue ? new Date(answer.dateValue).toLocaleDateString() : null) ||
                                                               (answer.booleanValue !== undefined ? (answer.booleanValue ? 'Yes' : 'No') : null) ||
                                                               answer.selectValue ||
                                                               (answer.multiselectValue && answer.multiselectValue.length > 0 ? answer.multiselectValue.join(', ') : null) ||
                                                               (answer.fileValue ? 'File uploaded' : null) ||
                                                               'No answer provided';
                                                            return <span className="font-medium">{displayValue}</span>;
                                                         })()
                                                      ) : (
                                                         <span className="text-slate-500 dark:text-slate-400 italic">Not answered</span>
                                                      )}
                                                   </div>
                                                </div>
                                             ))}
                                          </div>
                                       </div>
                                    ))}
                                 </div>
                              )}

                           </div>
                        ) : (
                           // Incomplete questionnaire - show button to open questionnaire
                           <div className="text-center py-6">
                              <div className="max-w-md mx-auto">
                                 <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl mb-6 border border-blue-200 dark:border-blue-700">
                                    <AlertCircle className="w-8 h-8 text-blue-600 dark:text-blue-400 mx-auto mb-3" />
                                    <p className="text-blue-800 dark:text-blue-200 font-medium">
                                       Complete the questionnaire to submit your claim for review.
                                    </p>
                                 </div>

                                 {canEdit() && (
                                    <button
                                       onClick={() => setShowQuestionnaireModal(true)}
                                       className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
                                    >
                                       <FileText className="w-5 h-5" />
                                       <span>Complete Questionnaire</span>
                                       <ChevronRight className="w-4 h-4" />
                                    </button>
                                 )}
                              </div>
                           </div>
                        )}
                     </div>
                  )}
               </div>

               {/* Sidebar */}
               <div className="space-y-6">
                  {/* Coverage Details */}
                  {selectedPolicy && (
                     <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-gray-200 dark:border-neutral-700 p-6 shadow-lg">
                        <div className="flex items-center space-x-3 mb-6">
                           <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-xl">
                              <Building className="w-5 h-5 text-green-600 dark:text-green-400" />
                           </div>
                           <h3 className="text-lg font-bold text-slate-900 dark:text-white">Coverage Details</h3>
                        </div>
                        <div className="space-y-4">
                           <div>
                              <label className="block text-sm font-medium text-slate-500 dark:text-neutral-400 mb-1">Policy Type</label>
                              <p className="font-medium text-slate-900 dark:text-white capitalize bg-slate-50 dark:bg-neutral-800 px-3 py-2 rounded-lg border border-slate-200 dark:border-neutral-700">
                                 {selectedPolicy.policyType}
                              </p>
                           </div>
                           <div>
                              <label className="block text-sm font-medium text-slate-500 dark:text-neutral-400 mb-1">Total Coverage Amount</label>
                              <p className="font-bold text-slate-900 dark:text-white bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 px-3 py-2 rounded-lg border border-green-200 dark:border-green-700">
                                 {formatCurrency(selectedPolicy.coverage.coverageAmount)}
                              </p>
                           </div>
                           <div>
                              <label className="block text-sm font-medium text-slate-500 dark:text-neutral-400 mb-1">Deductible</label>
                              <p className="font-semibold text-slate-900 dark:text-white bg-slate-50 dark:bg-neutral-800 px-3 py-2 rounded-lg border border-slate-200 dark:border-neutral-700">
                                 {formatCurrency(selectedPolicy.coverage.deductible)}
                              </p>
                           </div>

                           {/* Coverage Details List */}
                           {selectedPolicy.coverage.coverageDetails && selectedPolicy.coverage.coverageDetails.length > 0 && (
                              <div>
                                 <label className="block text-sm font-medium text-slate-500 dark:text-neutral-400 mb-3">Coverage Breakdown</label>
                                 <div className="space-y-3">
                                    {selectedPolicy.coverage.coverageDetails.map((detail) => (
                                       <div key={detail.id} className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-4 border border-blue-100 dark:border-blue-700">
                                          <div className="flex justify-between items-start mb-2">
                                             <h4 className="font-semibold text-slate-900 dark:text-white capitalize">
                                                {detail.type.replace('_', ' ')}
                                             </h4>
                                             <span className="font-bold text-indigo-700 dark:text-indigo-400">
                                                {formatCurrency(detail.limit)}
                                             </span>
                                          </div>
                                          <p className="text-sm text-slate-600 dark:text-slate-400">
                                             {detail.description}
                                          </p>
                                       </div>
                                    ))}
                                 </div>
                              </div>
                           )}
                        </div>
                     </div>
                  )}

                  {/* Timeline */}
                  <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-gray-200 dark:border-neutral-700 p-6 shadow-lg">
                     <div className="flex items-center space-x-3 mb-6">
                        <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
                           <Clock className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Timeline</h3>
                     </div>
                     <div className="space-y-4">
                        <div className="flex items-start space-x-3">
                           <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                           <div className="min-w-0 flex-1">
                              <p className="font-medium text-slate-900 dark:text-white">Claim Created</p>
                              <p className="text-sm text-slate-600 dark:text-slate-400">{formatDate(claim.createdAt)}</p>
                           </div>
                        </div>

                        {claim.submittedAt && (
                           <div className="flex items-start space-x-3">
                              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                              <div className="min-w-0 flex-1">
                                 <p className="font-medium text-slate-900 dark:text-white">Submitted to HR</p>
                                 <p className="text-sm text-slate-600 dark:text-slate-400">{formatDate(claim.submittedAt)}</p>
                              </div>
                           </div>
                        )}

                        {claim.forwardedToInsurerAt && (
                           <div className="flex items-start space-x-3">
                              <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                              <div className="min-w-0 flex-1">
                                 <p className="font-medium text-slate-900 dark:text-white">Forwarded to Insurer</p>
                                 <p className="text-sm text-slate-600 dark:text-slate-400">{formatDate(claim.forwardedToInsurerAt)}</p>
                              </div>
                           </div>
                        )}

                        {claim.finalizedAt && (
                           <div className="flex items-start space-x-3">
                              <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${claim.claimStatus === 'approved' ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
                              <div className="min-w-0 flex-1">
                                 <p className="font-medium text-slate-900 dark:text-white">
                                    Claim {claim.claimStatus === 'approved' ? 'Approved' : 'Rejected'}
                                 </p>
                                 <p className="text-sm text-slate-600 dark:text-slate-400">{formatDate(claim.finalizedAt)}</p>
                              </div>
                           </div>
                        )}
                     </div>
                  </div>

                  {/* HR Details */}
                  {claim.hrForwardingDetails?.coverageBreakdown?.length > 0 && (
                     <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-gray-200 dark:border-neutral-700 p-6 shadow-lg">
                        <div className="flex items-center space-x-3 mb-6">
                           <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-xl">
                              <User className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                           </div>
                           <h3 className="text-lg font-bold text-slate-900 dark:text-white">HR Review</h3>
                        </div>
                        <div className="space-y-4">
                           {claim.hrForwardingDetails.coverageBreakdown?.map((coverage, index) => (
                              <div key={index} className="bg-slate-50 dark:bg-neutral-800 rounded-lg p-3 border-l-4 border-amber-400 dark:border-amber-500">
                                 <div className="flex justify-between items-center mb-1">
                                    <span className="font-medium text-slate-700 dark:text-slate-300">{coverage.coverageType}</span>
                                    <span className="font-bold text-slate-900 dark:text-white">{formatCurrency(coverage.requestedAmount)}</span>
                                 </div>
                                 {coverage.notes && (
                                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">{coverage.notes}</p>
                                 )}
                              </div>
                           ))}
                           {claim.hrForwardingDetails.hrNotes && (
                              <div className="mt-4 pt-4 border-t border-slate-200 dark:border-neutral-700">
                                 <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">HR Notes</label>
                                 <div className="p-3 bg-slate-50 dark:bg-neutral-800 rounded-lg border border-slate-200 dark:border-neutral-700">
                                    <p className="text-sm text-slate-700 dark:text-slate-300">{claim.hrForwardingDetails.hrNotes}</p>
                                 </div>
                              </div>
                           )}
                        </div>
                     </div>
                  )}
               </div>
            </div>
         </div>

         {/* Questionnaire Modal */}
         {showQuestionnaireModal && questionnaire && (
            <div className="fixed inset-0 z-50 overflow-y-auto">
               <div className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity" onClick={() => setShowQuestionnaireModal(false)}></div>

               <div className="flex min-h-full items-center justify-center p-4">
                  <div className="relative w-full max-w-4xl bg-white dark:bg-neutral-800 rounded-2xl shadow-2xl max-h-[90vh] overflow-hidden border border-gray-200 dark:border-neutral-700">
                     {/* Modal Header */}
                     <div className="sticky top-0 z-10 bg-amber-50 dark:bg-neutral-700 border-b border-slate-200 dark:border-neutral-600 px-6 py-4">
                        <div className="flex items-center justify-between">
                           <div className="flex items-center space-x-3">
                              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                                 <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                              </div>
                              <div>
                                 <h2 className="text-xl font-bold text-slate-900 dark:text-white">Complete Questionnaire</h2>
                                 <p className="text-sm text-slate-600 dark:text-slate-400">Fill out all required fields to submit your claim</p>
                              </div>
                           </div>
                           <button
                              onClick={() => setShowQuestionnaireModal(false)}
                              className="p-2 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                           >
                              <X className="w-5 h-5" />
                           </button>
                        </div>
                     </div>

                     {/* Modal Content */}
                     <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
                        <Questionnaire
                           claimId={claim._id}
                           questionnaire={questionnaire}
                           setQuestionnaire={setQuestionnaire}
                           selectedPolicy={selectedPolicy}
                           onComplete={handleQuestionnaireComplete}
                        />
                     </div>
                  </div>
               </div>
            </div>
         )}

         {/* Review And Submit Modal */}
         {showReviewAndSubmitModal && questionnaire && (
            <div className="fixed inset-0 z-50 overflow-y-auto">
               <div className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity" onClick={() => setShowReviewAndSubmitModal(false)}></div>

               <div className="flex min-h-full items-center justify-center p-4">
                  <div className="relative w-full max-w-4xl bg-white dark:bg-neutral-800 rounded-2xl shadow-2xl max-h-[90vh] overflow-hidden border border-gray-200 dark:border-neutral-700">
                     {/* Modal Header */}
                     <div className="sticky top-0 z-10 bg-amber-50 dark:bg-neutral-700 border-b border-slate-200 dark:border-neutral-600 px-6 py-4">
                        <div className="flex items-center justify-between">
                           <div className="flex items-center space-x-3">
                              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                                 <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                              </div>
                              <div>
                                 <h2 className="text-xl font-bold text-slate-900 dark:text-white">Submit for HR Review</h2>
                                 <p className="text-sm text-slate-600 dark:text-slate-400">Check your answers and give consent</p>
                              </div>
                           </div>
                           <button
                              onClick={() => setShowReviewAndSubmitModal(false)}
                              className="p-2 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                           >
                              <X className="w-5 h-5" />
                           </button>
                        </div>
                     </div>

                     {/* Modal Content */}
                     <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
                        <ReviewAndSubmit
                           claimId={claim._id}
                           questionnaire={questionnaire}
                           selectedPolicy={selectedPolicy}
                        />
                     </div>
                  </div>
               </div>
            </div>
         )}

         {/* Delete Confirmation Modal */}
         {showDeleteModal && (
            <div className="fixed inset-0 z-50 overflow-y-auto">
               <div className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"></div>

               <div className="flex min-h-full items-center justify-center p-4">
                  <div className="relative bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl p-6 max-w-md w-full mx-4 border border-gray-200 dark:border-neutral-700">
                     <div className="flex items-start space-x-4 mb-6">
                        <div className="flex-shrink-0 p-2 bg-rose-100 dark:bg-rose-900/30 rounded-xl">
                           <XCircle className="w-6 h-6 text-rose-600 dark:text-rose-400" />
                        </div>
                        <div>
                           <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Delete Claim</h3>
                           <p className="text-slate-600 dark:text-slate-400">
                              Are you sure you want to delete this claim? This action cannot be undone and all associated data will be permanently removed.
                           </p>
                        </div>
                     </div>

                     <div className="flex space-x-3">
                        <button
                           onClick={() => setShowDeleteModal(false)}
                           className="flex-1 px-4 py-2.5 text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-xl transition-colors font-medium"
                           disabled={deleting}
                        >
                           Cancel
                        </button>
                        <button
                           onClick={handleDeleteClaim}
                           className="flex-1 px-4 py-2.5 text-white bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 border border-transparent rounded-xl transition-all duration-200 font-medium shadow-lg hover:shadow-xl disabled:opacity-50"
                           disabled={deleting}
                        >
                           {deleting ? 'Deleting...' : 'Delete Claim'}
                        </button>
                     </div>
                  </div>
               </div>
            </div>
         )}
      </div>
   );
};