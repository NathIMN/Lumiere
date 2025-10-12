import React, { useState, useEffect, useMemo } from 'react';
import {
   Search,
   User,
   Phone,
   Mail,
   RefreshCw,
   Eye,
   X,
   Edit,
   Users,
   Download,
   Coins
} from 'lucide-react';
import userApiService from '../../services/user-api';
import reportsApiService from '../../services/reports-api';

export const EmployeeDirectory = () => {
   const [allEmployees, setAllEmployees] = useState([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState(null);
   const [selectedEmployee, setSelectedEmployee] = useState(null);
   const [editingEmployee, setEditingEmployee] = useState(null);
   const [isGeneratingReport, setIsGeneratingReport] = useState(false);

   // Filter states
   const [filters, setFilters] = useState({
      userId: '',
      name: ''
   });

   useEffect(() => {
      fetchAllEmployees();
   }, []);

   const fetchAllEmployees = async () => {
      try {
         setLoading(true);
         setError(null);

         // Get all employees with role=employee filter
         const response = await userApiService.getUsers({ role: 'employee' });
         setAllEmployees(response.users || []);
      } catch (err) {
         setError('Failed to load employees');
         console.error('Error fetching employees:', err);
      } finally {
         setLoading(false);
      }
   };

   // Frontend filtering using useMemo for performance
   const filteredEmployees = useMemo(() => {
      if (!allEmployees.length) return [];

      return allEmployees.filter((employee) => {
         // ✅ User ID search - match any substring
         if (filters.userId) {
            const searchTerm = filters.userId.trim().toUpperCase();
            const employeeId = (employee.userId || '').toUpperCase();
            
            // Check if userId contains the search term as a substring
            if (!employeeId.includes(searchTerm)) {
               return false;
            }
         }

         // ✅ Name search - match words that start with search term
         if (filters.name) {
            const searchTerm = filters.name.trim().toLowerCase();
            const fullName = employee.fullName.toLowerCase();
            
            // Split full name into words
            const nameWords = fullName.split(/\s+/);
            
            // Split search term into words
            const searchWords = searchTerm.split(/\s+/);
            
            // Check if every search word matches at least one name word (starting with)
            const allSearchWordsMatch = searchWords.every(searchWord => 
              nameWords.some(nameWord => nameWord.startsWith(searchWord))
            );
            
            if (!allSearchWordsMatch) {
               return false;
            }
         }

         return true;
      });
   }, [allEmployees, filters]);

   const handleFilterChange = (key, value) => {
      setFilters(prev => ({
         ...prev,
         [key]: value
      }));
   };

   const handleReset = () => {
      setFilters({
         userId: '',
         name: ''
      });
   };

   const handleEmployeeUpdate = () => {
      // Refresh the employee list after successful update
      fetchAllEmployees();
      setEditingEmployee(null);
   };

   // Generate Employee Report
   const handleGenerateReport = async () => {
      setIsGeneratingReport(true);
      
      try {
         // Use filters if any are set, otherwise get all employees
         const reportFilters = {
            role: 'employee'
         };

         const blob = await reportsApiService.generateUsersReport(reportFilters);

         const url = window.URL.createObjectURL(blob);
         const link = document.createElement('a');
         link.href = url;
         link.download = `employee_directory_${new Date().toISOString().split('T')[0]}.pdf`;
         document.body.appendChild(link);
         link.click();
         link.remove();
         window.URL.revokeObjectURL(url);

      } catch (error) {
         console.error('Report generation failed:', error);
         setError(`Failed to generate employee report: ${error.message}`);
      } finally {
         setIsGeneratingReport(false);
      }
   };

   const getStatusBadge = (status) => {
      const statusConfig = {
         active: { label: 'Active', color: 'bg-green-100 text-green-800' },
         inactive: { label: 'Inactive', color: 'bg-gray-100 text-gray-800' },
         suspended: { label: 'Suspended', color: 'bg-yellow-100 text-yellow-800' },
         terminated: { label: 'Terminated', color: 'bg-red-100 text-red-800' }
      };

      const config = statusConfig[status] || statusConfig.inactive;
      return (
         <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
            {config.label}
         </span>
      );
   };

   const getEmploymentTypeBadge = (type) => {
      const typeConfig = {
         permanent: { label: 'Permanent', color: 'bg-blue-100 text-blue-800' },
         contract: { label: 'Contract', color: 'bg-purple-100 text-purple-800' },
         probation: { label: 'Probation', color: 'bg-orange-100 text-orange-800' },
         executive: { label: 'Executive', color: 'bg-indigo-100 text-indigo-800' }
      };

      const config = typeConfig[type] || typeConfig.permanent;
      return (
         <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
            {config.label}
         </span>
      );
   };

   const formatDate = (dateString) => {
      return new Date(dateString).toLocaleDateString('en-US', {
         year: 'numeric',
         month: 'short',
         day: 'numeric'
      });
   };

const formatCurrency = (amount) => {
   if (!amount && amount !== 0) return "Rs. 0.00";
   return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR',
      minimumFractionDigits: 2
   }).format(amount).replace('LKR', 'Rs.');
};

   const EmployeeEditModal = ({ employee, onClose, onUpdate }) => {
      const [activeTab, setActiveTab] = useState('promote');
      const [loading, setLoading] = useState(false);
      const [showConfirmation, setShowConfirmation] = useState(false);
      const [actionType, setActionType] = useState('');

      // Promotion form state
      const [promotionData, setPromotionData] = useState({
         profile: {
            phoneNumber: employee?.profile?.phoneNumber || '',
            address: employee?.profile?.address || ''
         },
         employment: {
            department: employee?.employment?.department || '',
            designation: employee?.employment?.designation || '',
            salary: employee?.employment?.salary || 0
         }
      });

      // Status change state
      const [newStatus, setNewStatus] = useState(employee?.status || 'active');

      const statusOptions = [
         { value: 'active', label: 'Active', color: 'text-green-600' },
         { value: 'inactive', label: 'Inactive', color: 'text-gray-600' },
         { value: 'suspended', label: 'Suspended', color: 'text-yellow-600' },
         { value: 'terminated', label: 'Terminated', color: 'text-red-600' }
      ];

      if (!employee) return null;

      const handlePromotionSubmit = () => {
         setActionType('promotion');
         setShowConfirmation(true);
      };

      const handleStatusSubmit = () => {
         setActionType('status');
         setShowConfirmation(true);
      };

      const confirmAction = async () => {
         try {
            setLoading(true);

            if (actionType === 'promotion') {
               await userApiService.updateUser(employee._id, promotionData);
            } else if (actionType === 'status') {
               await userApiService.updateUserStatus(employee._id, newStatus);
            }

            onUpdate();
            setShowConfirmation(false);
         } catch (error) {
            console.error('Error updating employee:', error);
            alert('Failed to update employee. Please try again.');
         } finally {
            setLoading(false);
         }
      };

      const ConfirmationDialog = () => {
         if (!showConfirmation) return null;

         return (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-[60]">
               <div className="bg-white rounded-lg max-w-md w-full p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Confirm Changes</h3>
                  <p className="text-gray-600 mb-6">
                     {actionType === 'promotion'
                        ? `Are you sure you want to update ${employee.fullName}'s profile and employment information?`
                        : `Are you sure you want to change ${employee.fullName}'s status to ${newStatus}?`
                     }
                  </p>
                  <div className="flex items-center space-x-3 justify-end">
                     <button
                        onClick={() => setShowConfirmation(false)}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                        disabled={loading}
                     >
                        Cancel
                     </button>
                     <button
                        onClick={confirmAction}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        disabled={loading}
                     >
                        {loading ? 'Updating...' : 'Confirm'}
                     </button>
                  </div>
               </div>
            </div>
         );
      };

      return (
         <>
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
               <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                  <div className="flex items-center justify-between p-6 border-b">
                     <h2 className="text-xl font-semibold text-gray-900">Edit Employee: {employee.fullName}</h2>
                     <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                     >
                        <X className="h-5 w-5" />
                     </button>
                  </div>

                  {/* Tabs */}
                  <div className="flex border-b">
                     <button
                        onClick={() => setActiveTab('promote')}
                        className={`px-6 py-3 font-medium text-sm ${activeTab === 'promote'
                              ? 'text-blue-600 border-b-2 border-blue-600'
                              : 'text-gray-500 hover:text-gray-700'
                           }`}
                     >
                        Promote Employee
                     </button>
                     <button
                        onClick={() => setActiveTab('status')}
                        className={`px-6 py-3 font-medium text-sm ${activeTab === 'status'
                              ? 'text-blue-600 border-b-2 border-blue-600'
                              : 'text-gray-500 hover:text-gray-700'
                           }`}
                     >
                        Change Status
                     </button>
                  </div>

                  <div className="p-6">
                     {activeTab === 'promote' && (
                        <div className="space-y-6">
                           <div>
                              <h3 className="text-lg font-medium text-gray-900 mb-4">Profile Information</h3>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                 <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                                    <input
                                       type="tel"
                                       value={promotionData.profile.phoneNumber}
                                       onChange={(e) => setPromotionData(prev => ({
                                          ...prev,
                                          profile: { ...prev.profile, phoneNumber: e.target.value }
                                       }))}
                                       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                       placeholder="Enter phone number"
                                    />
                                 </div>
                                 <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                                    <textarea
                                       value={promotionData.profile.address}
                                       onChange={(e) => setPromotionData(prev => ({
                                          ...prev,
                                          profile: { ...prev.profile, address: e.target.value }
                                       }))}
                                       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                       rows={3}
                                       placeholder="Enter address"
                                    />
                                 </div>
                              </div>
                           </div>

                           <div>
                              <h3 className="text-lg font-medium text-gray-900 mb-4">Employment Information</h3>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                 <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                                    <input
                                       type="text"
                                       value={promotionData.employment.department}
                                       onChange={(e) => setPromotionData(prev => ({
                                          ...prev,
                                          employment: { ...prev.employment, department: e.target.value }
                                       }))}
                                       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                       placeholder="Enter department"
                                    />
                                 </div>
                                 <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Designation</label>
                                    <input
                                       type="text"
                                       value={promotionData.employment.designation}
                                       onChange={(e) => setPromotionData(prev => ({
                                          ...prev,
                                          employment: { ...prev.employment, designation: e.target.value }
                                       }))}
                                       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                       placeholder="Enter designation"
                                    />
                                 </div>
                                 <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Salary (LKR)</label>
                                    <input
                                       type="number"
                                       value={promotionData.employment.salary}
                                       onChange={(e) => setPromotionData(prev => ({
                                          ...prev,
                                          employment: { ...prev.employment, salary: parseInt(e.target.value) || 0 }
                                       }))}
                                       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                       placeholder="Enter salary"
                                    />
                                 </div>
                              </div>
                           </div>

                           <div className="flex justify-end space-x-3">
                              <button
                                 onClick={onClose}
                                 className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                              >
                                 Cancel
                              </button>
                              <button
                                 onClick={handlePromotionSubmit}
                                 className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                              >
                                 Update Employee
                              </button>
                           </div>
                        </div>
                     )}

                     {activeTab === 'status' && (
                        <div className="space-y-6">
                           <div>
                              <h3 className="text-lg font-medium text-gray-900 mb-4">Change Employee Status</h3>
                              <div className="space-y-4">
                                 <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Current Status</label>
                                    <div className="mb-4">
                                       {getStatusBadge(employee.status)}
                                    </div>
                                 </div>

                                 <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">New Status</label>
                                    <div className="space-y-2">
                                       {statusOptions.map((option) => (
                                          <label key={option.value} className="flex items-center">
                                             <input
                                                type="radio"
                                                name="status"
                                                value={option.value}
                                                checked={newStatus === option.value}
                                                onChange={(e) => setNewStatus(e.target.value)}
                                                className="mr-3"
                                             />
                                             <span className={`font-medium ${option.color}`}>{option.label}</span>
                                          </label>
                                       ))}
                                    </div>
                                 </div>
                              </div>
                           </div>

                           <div className="flex justify-end space-x-3">
                              <button
                                 onClick={onClose}
                                 className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                              >
                                 Cancel
                              </button>
                              <button
                                 onClick={handleStatusSubmit}
                                 className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                 disabled={newStatus === employee.status}
                              >
                                 Change Status
                              </button>
                           </div>
                        </div>
                     )}
                  </div>
               </div>
            </div>
            <ConfirmationDialog />
         </>
      );
   };

   const EmployeeModal = ({ employee, onClose }) => {
      if (!employee) return null;

      return (
         <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
               <div className="flex items-center justify-between p-6 border-b">
                  <h2 className="text-xl font-semibold text-gray-900">Employee Details</h2>
                  <button
                     onClick={onClose}
                     className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                     <X className="h-5 w-5" />
                  </button>
               </div>

               <div className="p-6 space-y-6">
                  {/* Personal Information */}
                  <div>
                     <h3 className="text-lg font-medium text-gray-900 mb-4">Personal Information</h3>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                           <label className="text-sm text-gray-600">Full Name</label>
                           <p className="font-medium text-gray-900">{employee.fullName}</p>
                        </div>
                        <div>
                           <label className="text-sm text-gray-600">Employee ID</label>
                           <p className="font-medium text-gray-900">{employee.userId}</p>
                        </div>
                        <div>
                           <label className="text-sm text-gray-600">Email</label>
                           <p className="font-medium text-gray-900">{employee.email}</p>
                        </div>
                        <div>
                           <label className="text-sm text-gray-600">Phone</label>
                           <p className="font-medium text-gray-900">{employee.profile?.phoneNumber || 'N/A'}</p>
                        </div>
                        <div>
                           <label className="text-sm text-gray-600">NIC</label>
                           <p className="font-medium text-gray-900">{employee.profile?.nic || 'N/A'}</p>
                        </div>
                        <div>
                           <label className="text-sm text-gray-600">Age</label>
                           <p className="font-medium text-gray-900">{employee.age} years</p>
                        </div>
                        <div className="md:col-span-2">
                           <label className="text-sm text-gray-600">Address</label>
                           <p className="font-medium text-gray-900">{employee.profile?.address || 'N/A'}</p>
                        </div>
                     </div>
                  </div>

                  {/* Employment Information */}
                  <div>
                     <h3 className="text-lg font-medium text-gray-900 mb-4">Employment Information</h3>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                           <label className="text-sm text-gray-600">Department</label>
                           <p className="font-medium text-gray-900">{employee.employment?.department || 'N/A'}</p>
                        </div>
                        <div>
                           <label className="text-sm text-gray-600">Designation</label>
                           <p className="font-medium text-gray-900">{employee.employment?.designation || 'N/A'}</p>
                        </div>
                        <div>
                           <label className="text-sm text-gray-600">Employment Type</label>
                           <div className="mt-1">
                              {getEmploymentTypeBadge(employee.employment?.employmentType)}
                           </div>
                        </div>
                        <div>
                           <label className="text-sm text-gray-600">Join Date</label>
                           <p className="font-medium text-gray-900">
                              {employee.employment?.joinDate ? formatDate(employee.employment.joinDate) : 'N/A'}
                           </p>
                        </div>
                        <div>
                           <label className="text-sm text-gray-600">Salary</label>
                           <p className="font-medium text-gray-900">
                              {employee.employment?.salary ? formatCurrency(employee.employment.salary) : 'N/A'}
                           </p>
                        </div>
                        <div>
                           <label className="text-sm text-gray-600">Status</label>
                           <div className="mt-1">
                              {getStatusBadge(employee.status)}
                           </div>
                        </div>
                     </div>
                  </div>

                  {/* Bank Details */}
                  {employee.bankDetails && (
                     <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Bank Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                           <div>
                              <label className="text-sm text-gray-600">Account Holder Name</label>
                              <p className="font-medium text-gray-900">{employee.bankDetails.accountHolderName}</p>
                           </div>
                           <div>
                              <label className="text-sm text-gray-600">Bank Name</label>
                              <p className="font-medium text-gray-900">{employee.bankDetails.bankName}</p>
                           </div>
                           <div>
                              <label className="text-sm text-gray-600">Branch</label>
                              <p className="font-medium text-gray-900">{employee.bankDetails.branchName}</p>
                           </div>
                           <div>
                              <label className="text-sm text-gray-600">Account Number</label>
                              <p className="font-medium text-gray-900">{employee.bankDetails.accountNumber}</p>
                           </div>
                        </div>
                     </div>
                  )}

                  {/* Dependents */}
                  {employee.dependents && employee.dependents.length > 0 && (
                     <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Dependents</h3>
                        <div className="space-y-3">
                           {employee.dependents.map((dependent, index) => (
                              <div key={dependent._id || index} className="p-4 bg-gray-50 rounded-lg">
                                 <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                                    <div>
                                       <label className="text-sm text-gray-600">Name</label>
                                       <p className="font-medium text-gray-900">{dependent.name}</p>
                                    </div>
                                    <div>
                                       <label className="text-sm text-gray-600">Relationship</label>
                                       <p className="font-medium text-gray-900 capitalize">{dependent.relationship}</p>
                                    </div>
                                    <div>
                                       <label className="text-sm text-gray-600">Date of Birth</label>
                                       <p className="font-medium text-gray-900">
                                          {dependent.dateOfBirth ? formatDate(dependent.dateOfBirth) : 'N/A'}
                                       </p>
                                    </div>
                                 </div>
                              </div>
                           ))}
                        </div>
                     </div>
                  )}
               </div>
            </div>
         </div>
      );
   };

   if (loading) {
      return (
         <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="flex items-center space-x-2">
               <RefreshCw className="animate-spin h-6 w-6 text-blue-600" />
               <span className="text-gray-600">Loading employees...</span>
            </div>
         </div>
      );
   }

   return (
      <div className="min-h-screen mb-5">
         <div className="max-w-7xl mx-auto space-y-6">
            {/* Search Section */}
            <div className="bg-white rounded-lg shadow-sm p-6">
               <h2 className="text-lg font-medium text-gray-900 mb-4">Search Employees</h2>

               {/* Search Inputs */}
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="relative">
                     <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                     <input
                        type="text"
                        placeholder="Search by Employee ID"
                        value={filters.userId}
                        onChange={(e) => handleFilterChange('userId', e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                     />
                  </div>
                  <div className="relative">
                     <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                     <input
                        type="text"
                        placeholder="Search by Name (e.g., 'John' or 'John D')"
                        value={filters.name}
                        onChange={(e) => handleFilterChange('name', e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                     />
                  </div>
               </div>

               {/* Action Buttons */}
               <div className="flex items-center justify-between">
                  <div className='flex flex-row gap-4'>
                     <button
                        onClick={handleReset}
                        className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                     >
                        <RefreshCw className="h-4 w-4" />
                        <span>Reset</span>
                     </button>
                     <button
                        onClick={fetchAllEmployees}
                        className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                     >
                        <RefreshCw className="h-4 w-4" />
                        <span>Refresh</span>
                     </button>
                     <button
                        onClick={handleGenerateReport}
                        disabled={isGeneratingReport}
                        className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                     >
                        {isGeneratingReport ? (
                           <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                              <span>Generating...</span>
                           </>
                        ) : (
                           <>
                              <Download className="h-4 w-4" />
                              <span>Download Report</span>
                           </>
                        )}
                     </button>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                     <Users className="h-4 w-4" />
                     <span>{filteredEmployees.length} of {allEmployees.length} employees</span>
                  </div>
               </div>
            </div>

            {/* Results */}
            {error && (
               <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-600">{error}</p>
               </div>
            )}

            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
               <div className="overflow-x-auto">
                  <table className="w-full">
                     <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                           <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Employee
                           </th>
                           <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Contact
                           </th>
                           <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Employment
                           </th>
                           <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Status
                           </th>
                           <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Actions
                           </th>
                        </tr>
                     </thead>
                     <tbody className="bg-white divide-y divide-gray-200">
                        {filteredEmployees.map((employee) => (
                           <tr key={employee._id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                 <div className="flex items-center">
                                    <div className="flex-shrink-0 h-10 w-10">
                                       <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                                          <User className="h-5 w-5 text-gray-600" />
                                       </div>
                                    </div>
                                    <div className="ml-4">
                                       <div className="text-sm font-medium text-gray-900">{employee.fullName}</div>
                                       <div className="text-sm text-gray-500">{employee.userId}</div>
                                    </div>
                                 </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                 <div className="text-sm text-gray-900 flex items-center">
                                    <Mail className="h-4 w-4 mr-1 text-gray-400" />
                                    {employee.email}
                                 </div>
                                 <div className="text-sm text-gray-500 flex items-center">
                                    <Phone className="h-4 w-4 mr-1 text-gray-400" />
                                    {employee.profile?.phoneNumber || 'N/A'}
                                 </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                 <div className="text-sm text-gray-900">{employee.employment?.department || 'N/A'}</div>
                                 <div className="text-sm text-gray-500">{employee.employment?.designation || 'N/A'}</div>
                                 <div className="mt-1">
                                    {getEmploymentTypeBadge(employee.employment?.employmentType)}
                                 </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                 {getStatusBadge(employee.status)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                 <div className="flex items-center space-x-3">
                                    <button
                                       onClick={() => setSelectedEmployee(employee)}
                                       className="text-blue-600 hover:text-blue-900 flex items-center space-x-1"
                                    >
                                       <Eye className="h-4 w-4" />
                                       <span>View</span>
                                    </button>
                                    <button
                                       onClick={() => setEditingEmployee(employee)}
                                       className="text-green-600 hover:text-green-900 flex items-center space-x-1"
                                    >
                                       <Edit className="h-4 w-4" />
                                       <span>Edit</span>
                                    </button>
                                 </div>
                              </td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               </div>

               {filteredEmployees.length === 0 && !loading && (
                  <div className="text-center py-12">
                     <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                     <p className="text-gray-500">
                        {allEmployees.length === 0
                           ? "No employees found"
                           : "No employees match your search criteria"
                        }
                     </p>
                  </div>
               )}
            </div>
         </div>

         {/* Employee Modal */}
         <EmployeeModal
            employee={selectedEmployee}
            onClose={() => setSelectedEmployee(null)}
         />

         {/* Employee Edit Modal */}
         <EmployeeEditModal
            employee={editingEmployee}
            onClose={() => setEditingEmployee(null)}
            onUpdate={handleEmployeeUpdate}
         />
      </div>
   );
};