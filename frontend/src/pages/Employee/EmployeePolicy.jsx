import { useState, useEffect } from 'react';
import InsuranceApiService from "../../services/insurance-api";
import reportsApiService from '../../services/reports-api';
import LoadingScreen from './LoadingScreen';
import {
   Shield, Car, User, Calendar, Coins, FileText, Users,
   AlertCircle, Plus, Eye, Download, Loader2, RefreshCw, CheckCircle, Receipt,
} from 'lucide-react';

export const EmployeePolicy = () => {
   const [policies, setPolicies] = useState([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState(null);
   const [activePolicy, setActivePolicy] = useState(null);

   useEffect(() => {
      const fetchPolicies = async () => {
         try {
            setLoading(true);
            const response = await InsuranceApiService.getUserPolicies();
            setPolicies(response?.policies || []);
         } catch (err) {
            console.error(err);
            setError('Failed to load policies');
         } finally {
            setLoading(false);
         }
      };
      fetchPolicies();
   }, []);

   const getStatusColor = (status) => {
      const colors = {
         active: 'text-green-700 bg-green-100 dark:text-green-400 dark:bg-green-900/30',
         expired: 'text-red-700 bg-red-100 dark:text-red-400 dark:bg-red-900/30',
         cancelled: 'text-gray-700 bg-gray-100 dark:text-gray-300 dark:bg-gray-700/50',
         suspended: 'text-yellow-700 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/30',
         pending: 'text-blue-700 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30'
      };
      return colors[status] || 'text-gray-700 bg-gray-100 dark:text-gray-300 dark:bg-gray-700/50';
   };



      const getPolicyIcon = (claimType) => {
      switch (claimType) {
         case 'life': return <User className="text-red-700 dark:text-red-400" size={30} />;
         case 'vehicle': return <Car className="text-blue-700 dark:text-blue-400" size={30} />;
         default: return <FileText className="text-gray-700 dark:text-gray-400" size={30} />;
      }
   };

   const formatCurrency = (amount) => {
      return new Intl.NumberFormat('en-US', {
         style: 'currency',
         currency: 'LKR'
      }).format(amount);
   };

   const formatDate = (dateString) => {
      return new Date(dateString).toLocaleDateString('en-US', {
         year: 'numeric',
         month: 'short',
         day: 'numeric'
      });
   };

   const getDaysUntilExpiry = (endDate) => {
      const today = new Date();
      const expiry = new Date(endDate);
      const timeDiff = expiry.getTime() - today.getTime();
      const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
      return daysDiff;
   };

   const getAgentName = (agent) => {
      if (!agent) return 'Not assigned';
      return agent.fullName || agent.email || 'Unknown Agent';
   };

   const getMonthlyPremium = (premium) => {
      const { amount, frequency } = premium;
      switch (frequency) {
         case 'monthly':
            return amount;
         case 'quarterly':
            return amount / 3;
         case 'semi-annual':
            return amount / 6;
         case 'annual':
            return amount / 12;
         default:
            return amount;
      }
   };

   const getCoverages = (policy) => {
      if (policy.policyType == "vehicle") {
         return policy.coverage.typeVehicle
      }
      else {
         return policy.coverage.typeLife
      }
   }

   // Report generation function
   const generatePolicyReport = async (policyId) => {
      try {
         const blob = await reportsApiService.generateEmployeePolicyReport(policyId);
         const url = window.URL.createObjectURL(blob);
         const link = document.createElement('a');
         link.href = url;
         link.download = `policy-report-${policyId}-${new Date().toISOString().split('T')[0]}.pdf`;
         document.body.appendChild(link);
         link.click();
         document.body.removeChild(link);
         window.URL.revokeObjectURL(url);
      } catch (error) {
         console.error('Error generating policy report:', error);
         alert('Failed to generate policy report. Please try again.');
      }
   };

   const PolicyCard = ({ policy }) => {
      const daysUntilExpiry = getDaysUntilExpiry(policy.validity.endDate);
      const isExpiringSoon = daysUntilExpiry <= 30 && daysUntilExpiry > 0;

      return (
         <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-md border border-gray-200 dark:border-neutral-700 hover:shadow-lg dark:hover:shadow-xl dark:hover:shadow-black/20 transition-shadow duration-200">
            <div className="p-6">
               {/* Header */}
               <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center space-x-3">
                     {getPolicyIcon(policy.policyType)}
                     <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                           {policy.policyType === 'life' ? 'Life Insurance' : 'Vehicle Insurance'}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Policy ID: {policy.policyId}</p>
                     </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(policy.status)}`}>
                     {policy.status.charAt(0).toUpperCase() + policy.status.slice(1)}
                  </span>
               </div>

               {/* Key Details */}
               <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                     <p className="text-sm text-gray-600 dark:text-gray-400">Coverage Amount</p>
                     <p className="text-lg font-semibold text-gray-900 dark:text-white">{formatCurrency(policy.coverage.coverageAmount)}</p>
                  </div>
                  <div>
                     <p className="text-sm text-gray-600 dark:text-gray-400">Monthly Premium</p>
                     <p className="text-lg font-semibold text-gray-900 dark:text-white">{formatCurrency(getMonthlyPremium(policy.premium))}</p>
                     <p className="text-xs text-gray-500 dark:text-gray-400">({policy.premium.frequency})</p>
                  </div>
               </div>

               {/* Validity */}
               <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                     <p className="text-sm text-gray-600 dark:text-gray-400">Policy Period</p>
                     {isExpiringSoon && (
                        <span className="flex items-center text-xs text-amber-600 dark:text-amber-400">
                           <AlertCircle className="w-3 h-3 mr-1" />
                           Expires in {daysUntilExpiry} days
                        </span>
                     )}
                  </div>
                  <div className="bg-gray-50 dark:bg-neutral-800 rounded-lg p-3">
                     <div className="flex justify-between text-sm">
                        <span className="text-gray-900 dark:text-gray-200">{formatDate(policy.validity.startDate)}</span>
                        <span className="text-gray-500 dark:text-gray-400">→</span>
                        <span className={isExpiringSoon ? 'text-amber-600 dark:text-amber-400 font-medium' : 'text-gray-900 dark:text-gray-200'}>
                           {formatDate(policy.validity.endDate)}
                        </span>
                     </div>
                  </div>
               </div>

               {/* Coverage Types */}
               <div className="mb-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Coverage Types</p>
                  <div className="flex flex-wrap gap-1">
                     {(getCoverages(policy)).map((type, index) => (
                        <span key={index} className="px-2 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs rounded-md">
                           {type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </span>
                     ))}
                  </div>
               </div>

               {/* Actions */}
               <div className="flex justify-between items-center pt-4 border-t border-gray-100 dark:border-neutral-700">
                  <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                     <span className="flex items-center">
                        <Users className="w-4 h-4 mr-1" />
                        {policy.beneficiaries ? policy.beneficiaries.length : 0} beneficiaries
                     </span>
                     <span className="flex items-center">
                        <FileText className="w-4 h-4 mr-1" />
                        {policy.documents ? policy.documents.length : 0} documents
                     </span>
                  </div>
                  <div className="flex space-x-2">
                     <button
                        onClick={() => setActivePolicy(policy)}
                        className="p-2 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                        title="View Details"
                     >
                        <Eye className="w-4 h-4" />
                     </button>
                     <button
                        onClick={() => generatePolicyReport(policy.policyId)}
                        className="p-2 text-gray-500 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/30 rounded-lg transition-colors"
                        title="Download Policy Report"
                     >
                        <Download className="w-4 h-4" />
                     </button>
                  </div>
               </div>
            </div>
         </div>
      );
   };

   const PolicyDetailModal = ({ policy, onClose }) => {
      if (!policy) return null;

      return (
         <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-black dark:bg-opacity-70 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-neutral-900 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-neutral-700">
               <div className="p-6 border-b border-gray-200 dark:border-neutral-700">
                  <div className="flex justify-between items-start">
                     <div className="flex items-center space-x-3">
                        {getPolicyIcon(policy.policyType)}
                        <div>
                           <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                              {policy.policyType === 'life' ? 'Life Insurance Policy' : 'Vehicle Insurance Policy'}
                           </h2>
                           <p className="text-gray-500 dark:text-gray-400">Policy ID: {policy.policyId}</p>
                        </div>
                     </div>
                     <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-lg transition-colors text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 text-2xl"
                     >
                        ×
                     </button>
                  </div>
               </div>

               <div className="p-6 space-y-6">
                  {/* Coverage Details */}
                  <div>
                     <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">Coverage Details</h3>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {policy.coverage.coverageDetails.map((detail, index) => (
                           <div key={index} className="bg-gray-50 dark:bg-neutral-800 rounded-lg p-4 border border-gray-100 dark:border-neutral-700">
                              <h4 className="font-medium text-gray-900 dark:text-white capitalize">{detail.type.replace('_', ' ')}</h4>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{detail.description}</p>
                              <p className="text-sm font-medium text-gray-900 dark:text-white mt-2">
                                 Limit: {formatCurrency(detail.limit)}
                              </p>
                           </div>
                        ))}
                     </div>
                  </div>

                  {/* Premium Information */}
                  <div>
                     <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">Premium Information</h3>
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/30 rounded-lg p-4">
                           <p className="text-sm text-blue-600 dark:text-blue-400">Premium Amount</p>
                           <p className="text-xl font-semibold text-blue-900 dark:text-blue-200">{formatCurrency(policy.premium.amount)}</p>
                        </div>
                        <div className="bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800/30 rounded-lg p-4">
                           <p className="text-sm text-green-600 dark:text-green-400">Frequency</p>
                           <p className="text-xl font-semibold text-green-900 dark:text-green-200 capitalize">{policy.premium.frequency}</p>
                        </div>
                        <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-800/30 rounded-lg p-4">
                           <p className="text-sm text-purple-600 dark:text-purple-400">Deductible</p>
                           <p className="text-xl font-semibold text-purple-900 dark:text-purple-200">{formatCurrency(policy.coverage.deductible)}</p>
                        </div>
                     </div>
                  </div>

                  {/* Agent Information */}
                  <div>
                     <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">Insurance Agent</h3>
                     <div className="bg-gray-50 dark:bg-neutral-800 rounded-lg p-4 border border-gray-100 dark:border-neutral-700">
                        <p className="font-medium text-gray-900 dark:text-white">{getAgentName(policy.insuranceAgent)}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                           {policy.insuranceAgent?.email && `Email: ${policy.insuranceAgent.email}`}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Contact your agent for policy changes or claims</p>
                     </div>
                  </div>

                  {/* Notes */}
                  {policy.notes && (
                     <div>
                        <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">Policy Notes</h3>
                        <div className="bg-gray-50 dark:bg-neutral-800 rounded-lg p-4 border border-gray-100 dark:border-neutral-700">
                           <p className="text-gray-700 dark:text-gray-300">{policy.notes}</p>
                        </div>
                     </div>
                  )}
               </div>
            </div>
         </div>
      );
   };

   // Loading state
   if (loading) {
      return (
         <div className="min-h-screen dark:bg-neutral-800 p-6">
            {loading && <LoadingScreen />}
         </div>
      );
   }

   // Error state
   if (error) {
      return (
         <div className="p-6 bg-gray-50 dark:bg-neutral-800 min-h-screen flex items-center justify-center">
            <div className="text-center bg-white dark:bg-neutral-900 rounded-lg shadow-sm border border-gray-200 dark:border-neutral-700 p-8 max-w-md w-full">
               <AlertCircle className="w-12 h-12 text-red-500 dark:text-red-400 mx-auto mb-4" />
               <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Error Loading Policies</h2>
               <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
               <button
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
               >
                  Try Again
               </button>
            </div>
         </div>
      );
   }

   return (
      <div className="px-6 min-h-screen">


         {/* Summary Cards */}
         <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-gray-200 dark:border-neutral-700 p-6">
               <div className="flex items-center relative z-10">
                  <Shield className="w-8 h-8 text-blue-900 dark:text-blue-400" />
                  <div className="ml-4">
                     <p className="text-sm text-gray-600 dark:text-gray-400">Active Policies</p>
                     <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                        {policies.filter(p => p.status === 'active').length}
                     </p>
                  </div>
               </div>
            </div>

            <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-gray-200 dark:border-neutral-700 p-6">
               <div className="flex items-center">
                  <Coins className="w-8 h-8 text-blue-900 dark:text-green-400" />
                  <div className="ml-4">
                     <p className="text-sm text-gray-600 dark:text-gray-400">Total Coverage</p>
                     <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                        {formatCurrency(policies.reduce((sum, p) => sum + p.coverage.coverageAmount, 0))}
                     </p>
                  </div>
               </div>
            </div>

            <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-gray-200 dark:border-neutral-700 p-6">
               <div className="flex items-center">
                  <Calendar className="w-8 h-8 text-blue-900 dark:text-purple-400" />
                  <div className="ml-4">
                     <p className="text-sm text-gray-600 dark:text-gray-400">Monthly Premium</p>
                     <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                        {formatCurrency(policies.reduce((sum, p) => sum + getMonthlyPremium(p.premium), 0))}
                     </p>
                  </div>
               </div>
            </div>
         </div>

         {/* Policies Grid */}
         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {policies.map((policy) => (
               <PolicyCard key={policy.policyId} policy={policy} />
            ))}

            {/* Add Policy Card (if less than 2 policies) */}
            {policies.length < 2 && (
               <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-md border-2 border-dashed border-gray-300 dark:border-neutral-600 hover:border-blue-400 dark:hover:border-blue-500 transition-colors cursor-pointer">
                  <div className="p-6 text-center">
                     <Plus className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                     <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Policies Found</h3>
                     <p className="text-gray-600 dark:text-gray-400 mb-4">
                        You are not currently enrolled in any insurance policy. You cannot add
                        yourself to a policy, but you can request HR to add one for you.</p>
                     <button className="px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors">
                        Request Policy
                     </button>
                  </div>
               </div>
            )}
         </div>

         {/* Policy Detail Modal */}
         {activePolicy && (
            <PolicyDetailModal
               policy={activePolicy}
               onClose={() => setActivePolicy(null)}
            />
         )}
      </div>
   );
};