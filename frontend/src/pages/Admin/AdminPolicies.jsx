import React, { useState, useEffect } from "react";
import {
  Shield,
  Plus,
  Search,
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  Users,
  DollarSign,
  Calendar,
  FileText,
  Loader2,
} from "lucide-react";
import { policyService } from "../../services/policyService";
import userApiService from "../../services/user-api";

export const AdminPolicies = () => {
  const [policies, setPolicies] = useState([]);
  const [insuranceAgents, setInsuranceAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedPolicy, setSelectedPolicy] = useState(null);
  const [formData, setFormData] = useState({
    policyType: "",
    policyCategory: "",
    insuranceAgent: "",
    coverage: {
      coverageAmount: "",
      deductible: "",
      typeLife: [],
      typeVehicle: [],
      coverageDetails: [
        {
          type: "",
          description: "",
          limit: ""
        }
      ],
    },
    premium: {
      amount: "",
      frequency: "monthly",
    },
    validity: {
      startDate: "",
      endDate: "",
    },
    notes: "",
  });
  const [errors, setErrors] = useState({});
  const [actionLoading, setActionLoading] = useState(false);

  // Fetch policies on component mount
  useEffect(() => {
    fetchPolicies();
    fetchInsuranceAgents();
  }, []);

  const fetchPolicies = async () => {
    try {
      setLoading(true);
      const response = await policyService.getAllPolicies();
      setPolicies(response.policies || []);
    } catch (error) {
      console.error("Failed to fetch policies:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchInsuranceAgents = async () => {
    try {
      console.log("Fetching insurance agents...");
      const response = await userApiService.getUsersByRole('insurance_agent');
      console.log("Insurance agents response:", response);
      
      if (response && response.users && Array.isArray(response.users)) {
        setInsuranceAgents(response.users);
        console.log(`Successfully loaded ${response.users.length} insurance agents`);
      } else {
        console.warn("No insurance agents found or invalid response format");
        setInsuranceAgents([]);
      }
    } catch (error) {
      console.error("Failed to fetch insurance agents:", error);
      setInsuranceAgents([]);
    }
  };

  // Filter policies based on search and status
  const filteredPolicies = policies.filter((policy) => {
    const matchesSearch = 
      policy.policyId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      policy.policyType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      policy.policyCategory?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      policy.insuranceAgent?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      policy.insuranceAgent?.lastName?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "all" || policy.status === statusFilter;
    const matchesType = typeFilter === "all" || policy.policyType === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }

    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  // Handle coverage type checkbox changes
  const handleCoverageTypeChange = (type, coverageType) => {
    const key = type === 'life' ? 'typeLife' : 'typeVehicle';
    setFormData(prev => ({
      ...prev,
      coverage: {
        ...prev.coverage,
        [key]: prev.coverage[key].includes(coverageType)
          ? prev.coverage[key].filter(t => t !== coverageType)
          : [...prev.coverage[key], coverageType]
      }
    }));
  };

  // Handle coverage details changes
  const handleCoverageDetailChange = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      coverage: {
        ...prev.coverage,
        coverageDetails: prev.coverage.coverageDetails.map((detail, i) =>
          i === index ? { ...detail, [field]: value } : detail
        )
      }
    }));
  };

  // Add new coverage detail
  const addCoverageDetail = () => {
    setFormData(prev => ({
      ...prev,
      coverage: {
        ...prev.coverage,
        coverageDetails: [...prev.coverage.coverageDetails, { type: "", description: "", limit: "" }]
      }
    }));
  };

  // Remove coverage detail
  const removeCoverageDetail = (index) => {
    if (formData.coverage.coverageDetails.length > 1) {
      setFormData(prev => ({
        ...prev,
        coverage: {
          ...prev.coverage,
          coverageDetails: prev.coverage.coverageDetails.filter((_, i) => i !== index)
        }
      }));
    }
  };

  // Validate form data
  const validateForm = (isEdit = false) => {
    const newErrors = {};

    if (!formData.policyType) {
      newErrors.policyType = "Policy type is required";
    }

    if (!formData.policyCategory) {
      newErrors.policyCategory = "Policy category is required";
    }

    if (!formData.insuranceAgent) {
      newErrors.insuranceAgent = "Insurance agent is required";
    }

    if (!formData.coverage.coverageAmount || formData.coverage.coverageAmount <= 0) {
      newErrors['coverage.coverageAmount'] = "Valid coverage amount is required";
    }

    if (!formData.premium.amount || formData.premium.amount <= 0) {
      newErrors['premium.amount'] = "Valid premium amount is required";
    }

    if (!formData.validity.startDate) {
      newErrors['validity.startDate'] = "Start date is required";
    }

    if (!formData.validity.endDate) {
      newErrors['validity.endDate'] = "End date is required";
    }

    if (formData.validity.startDate && formData.validity.endDate) {
      if (new Date(formData.validity.startDate) >= new Date(formData.validity.endDate)) {
        newErrors['validity.endDate'] = "End date must be after start date";
      }
    }

    // Validate coverage types based on policy type
    if (formData.policyType === 'life' && formData.coverage.typeLife.length === 0) {
      newErrors.coverageType = "At least one life coverage type is required";
    }
    if (formData.policyType === 'vehicle' && formData.coverage.typeVehicle.length === 0) {
      newErrors.coverageType = "At least one vehicle coverage type is required";
    }

    // Validate coverage details
    formData.coverage.coverageDetails.forEach((detail, index) => {
      if (!detail.type) {
        newErrors[`coverageDetail_${index}_type`] = "Coverage type is required";
      }
      if (!detail.description) {
        newErrors[`coverageDetail_${index}_description`] = "Description is required";
      }
      if (!detail.limit || detail.limit <= 0) {
        newErrors[`coverageDetail_${index}_limit`] = "Valid limit is required";
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle create policy
  const handleCreate = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      setActionLoading(true);
      await policyService.createPolicy(formData);
      await fetchPolicies();
      setShowCreateModal(false);
      resetForm();
    } catch (error) {
      console.error("Failed to create policy:", error);
      setErrors({ general: error.message || "Failed to create policy" });
    } finally {
      setActionLoading(false);
    }
  };

  // Handle update policy
  const handleUpdate = async (e) => {
    e.preventDefault();
    
    if (!validateForm(true)) return;

    try {
      setActionLoading(true);
      await policyService.updatePolicy(selectedPolicy._id, formData);
      await fetchPolicies();
      setShowEditModal(false);
      resetForm();
    } catch (error) {
      console.error("Failed to update policy:", error);
      setErrors({ general: error.message || "Failed to update policy" });
    } finally {
      setActionLoading(false);
    }
  };

  // Handle delete policy
  const handleDelete = async (policyId) => {
    const policy = policies.find(p => p._id === policyId);
    
    // Check if policy has beneficiaries
    if (policy?.beneficiaries && policy.beneficiaries.length > 0) {
      alert("Cannot delete policy with beneficiaries. Remove all beneficiaries first.");
      return;
    }

    if (!window.confirm("Are you sure you want to delete this policy?")) return;

    try {
      setActionLoading(true);
      await policyService.deletePolicy(policyId);
      await fetchPolicies();
    } catch (error) {
      console.error("Failed to delete policy:", error);
      alert(error.message || "Failed to delete policy");
    } finally {
      setActionLoading(false);
    }
  };

  // Handle status update
  const handleStatusUpdate = async (policyId, newStatus) => {
    try {
      setActionLoading(true);
      await policyService.updatePolicyStatus(policyId, newStatus);
      await fetchPolicies();
    } catch (error) {
      console.error("Failed to update policy status:", error);
      alert(error.message || "Failed to update policy status");
    } finally {
      setActionLoading(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      policyType: "",
      policyCategory: "",
      insuranceAgent: "",
      coverage: {
        coverageAmount: "",
        deductible: "",
        typeLife: [],
        typeVehicle: [],
        coverageDetails: [
          {
            type: "",
            description: "",
            limit: ""
          }
        ],
      },
      premium: {
        amount: "",
        frequency: "monthly",
      },
      validity: {
        startDate: "",
        endDate: "",
      },
      notes: "",
    });
    setErrors({});
    setSelectedPolicy(null);
  };

  // Open edit modal with selected policy data
  const openEditModal = (policy) => {
    setSelectedPolicy(policy);
    setFormData({
      policyType: policy.policyType || "",
      policyCategory: policy.policyCategory || "",
      insuranceAgent: policy.insuranceAgent?._id || "",
      coverage: {
        coverageAmount: policy.coverage?.coverageAmount || "",
        deductible: policy.coverage?.deductible || "",
        coverageDetails: policy.coverage?.coverageDetails || "",
      },
      premium: {
        amount: policy.premium?.amount || "",
        frequency: policy.premium?.frequency || "monthly",
      },
      validity: {
        startDate: policy.validity?.startDate ? new Date(policy.validity.startDate).toISOString().split('T')[0] : "",
        endDate: policy.validity?.endDate ? new Date(policy.validity.endDate).toISOString().split('T')[0] : "",
      },
      terms: policy.terms || "",
      notes: policy.notes || "",
    });
    setShowEditModal(true);
  };

  // Open view modal
  const openViewModal = (policy) => {
    setSelectedPolicy(policy);
    setShowViewModal(true);
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "text-green-600 bg-green-50 border-green-200";
      case "expired":
        return "text-red-600 bg-red-50 border-red-200";
      case "cancelled":
        return "text-gray-600 bg-gray-50 border-gray-200";
      case "suspended":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "pending":
        return "text-blue-600 bg-blue-50 border-blue-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  // Format date
  const formatDate = (dateString) => {
    return dateString ? new Date(dateString).toLocaleDateString() : "N/A";
  };

  // Format currency
  const formatCurrency = (amount) => {
    return amount ? `$${parseFloat(amount).toLocaleString()}` : "N/A";
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Loading policies...</span>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Policy Management</h1>
        <p className="text-gray-600">Manage insurance policies and coverage details</p>
        <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-700">
            <strong>Note:</strong> As an admin, you can create, edit, and delete policies. 
            Beneficiary management (adding/removing beneficiaries) is handled by HR Officers.
          </p>
        </div>
      </div>

      {/* Actions and Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="p-4 border-b border-gray-200">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search policies..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="expired">Expired</option>
                <option value="cancelled">Cancelled</option>
                <option value="suspended">Suspended</option>
              </select>

              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Types</option>
                <option value="life">Life Insurance</option>
                <option value="vehicle">Vehicle Insurance</option>
              </select>

              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Policy
              </button>
            </div>
          </div>
        </div>

        {/* Policy Statistics */}
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center gap-3">
                <Shield className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-sm text-blue-600 font-medium">Total Policies</p>
                  <p className="text-2xl font-bold text-blue-900">{policies.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-8 w-8 text-green-600" />
                <div>
                  <p className="text-sm text-green-600 font-medium">Active</p>
                  <p className="text-2xl font-bold text-green-900">
                    {policies.filter(p => p.status === 'active').length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 p-4 rounded-lg">
              <div className="flex items-center gap-3">
                <Clock className="h-8 w-8 text-yellow-600" />
                <div>
                  <p className="text-sm text-yellow-600 font-medium">Pending</p>
                  <p className="text-2xl font-bold text-yellow-900">
                    {policies.filter(p => p.status === 'pending').length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-red-50 p-4 rounded-lg">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-8 w-8 text-red-600" />
                <div>
                  <p className="text-sm text-red-600 font-medium">Expired</p>
                  <p className="text-2xl font-bold text-red-900">
                    {policies.filter(p => p.status === 'expired').length}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Policies Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left p-4 font-semibold text-gray-900">Policy</th>
                <th className="text-left p-4 font-semibold text-gray-900">Type</th>
                <th className="text-left p-4 font-semibold text-gray-900">Agent</th>
                <th className="text-left p-4 font-semibold text-gray-900">Coverage</th>
                <th className="text-left p-4 font-semibold text-gray-900">Premium</th>
                <th className="text-left p-4 font-semibold text-gray-900">Status</th>
                <th className="text-left p-4 font-semibold text-gray-900">Validity</th>
                <th className="text-left p-4 font-semibold text-gray-900">Beneficiaries</th>
                <th className="text-left p-4 font-semibold text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPolicies.length > 0 ? (
                filteredPolicies.map((policy) => (
                  <tr key={policy._id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Shield className="h-5 w-5 text-blue-600" />
                          </div>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{policy.policyId}</p>
                          <p className="text-sm text-gray-600">{policy.policyCategory}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="capitalize text-gray-900">{policy.policyType}</span>
                    </td>
                    <td className="p-4">
                      <div>
                        <p className="text-gray-900">
                          {policy.insuranceAgent?.firstName} {policy.insuranceAgent?.lastName}
                        </p>
                        <p className="text-sm text-gray-600">{policy.insuranceAgent?.email}</p>
                      </div>
                    </td>
                    <td className="p-4">
                      <p className="font-medium text-gray-900">{formatCurrency(policy.coverage?.coverageAmount)}</p>
                      {policy.coverage?.deductible && (
                        <p className="text-sm text-gray-600">Deductible: {formatCurrency(policy.coverage.deductible)}</p>
                      )}
                    </td>
                    <td className="p-4">
                      <p className="font-medium text-gray-900">{formatCurrency(policy.premium?.amount)}</p>
                      <p className="text-sm text-gray-600 capitalize">{policy.premium?.frequency}</p>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(policy.status)}`}>
                        {policy.status?.charAt(0).toUpperCase() + policy.status?.slice(1)}
                      </span>
                    </td>
                    <td className="p-4">
                      <div>
                        <p className="text-sm text-gray-900">{formatDate(policy.validity?.startDate)}</p>
                        <p className="text-sm text-gray-600">to {formatDate(policy.validity?.endDate)}</p>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-900">{policy.beneficiaries?.length || 0}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openViewModal(policy)}
                          className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View Policy"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => openEditModal(policy)}
                          className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Edit Policy"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(policy._id)}
                          disabled={policy.beneficiaries?.length > 0}
                          className={`p-2 rounded-lg transition-colors ${
                            policy.beneficiaries?.length > 0
                              ? 'text-gray-400 cursor-not-allowed'
                              : 'text-gray-600 hover:text-red-600 hover:bg-red-50'
                          }`}
                          title={policy.beneficiaries?.length > 0 ? "Cannot delete policy with beneficiaries" : "Delete Policy"}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                        
                        {/* Status Update Dropdown */}
                        <div className="relative">
                          <select
                            value={policy.status}
                            onChange={(e) => handleStatusUpdate(policy._id, e.target.value)}
                            className="text-xs border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
                          >
                            <option value="active">Active</option>
                            <option value="pending">Pending</option>
                            <option value="expired">Expired</option>
                            <option value="cancelled">Cancelled</option>
                            <option value="suspended">Suspended</option>
                          </select>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="9" className="p-8 text-center text-gray-500">
                    No policies found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Policy Modal */}
      {showCreateModal && (
        <div
          className="fixed inset-0 flex items-center justify-center p-4 z-50"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.6)" }}
        >
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Create New Policy</h2>
            </div>
            
            <form onSubmit={handleCreate} className="p-6 space-y-6">
              {errors.general && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-red-600 text-sm">{errors.general}</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Policy Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Policy Type *
                  </label>
                  <select
                    name="policyType"
                    value={formData.policyType}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.policyType ? 'border-red-300' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select Policy Type</option>
                    <option value="life">Life Insurance</option>
                    <option value="vehicle">Vehicle Insurance</option>
                  </select>
                  {errors.policyType && (
                    <p className="text-red-500 text-xs mt-1">{errors.policyType}</p>
                  )}
                </div>

                {/* Policy Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Policy Category *
                  </label>
                  <select
                    name="policyCategory"
                    value={formData.policyCategory}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.policyCategory ? 'border-red-300' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select Policy Category</option>
                    <option value="individual">Individual</option>
                    <option value="group">Group</option>
                  </select>
                  {errors.policyCategory && (
                    <p className="text-red-500 text-xs mt-1">{errors.policyCategory}</p>
                  )}
                </div>

                {/* Insurance Agent */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Insurance Agent *
                  </label>
                  <select
                    name="insuranceAgent"
                    value={formData.insuranceAgent}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.insuranceAgent ? 'border-red-300' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select Insurance Agent</option>
                    {insuranceAgents.map(agent => (
                      <option key={agent._id} value={agent._id}>
                        {agent.profile?.firstName} {agent.profile?.lastName}
                      </option>
                    ))}
                  </select>
                  {errors.insuranceAgent && (
                    <p className="text-red-500 text-xs mt-1">{errors.insuranceAgent}</p>
                  )}
                </div>

                {/* Coverage Amount */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Coverage Amount *
                  </label>
                  <input
                    type="number"
                    name="coverage.coverageAmount"
                    value={formData.coverage.coverageAmount}
                    onChange={handleInputChange}
                    placeholder="100000"
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors['coverage.coverageAmount'] ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {errors['coverage.coverageAmount'] && (
                    <p className="text-red-500 text-xs mt-1">{errors['coverage.coverageAmount']}</p>
                  )}
                </div>

                {/* Deductible */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Deductible
                  </label>
                  <input
                    type="number"
                    name="coverage.deductible"
                    value={formData.coverage.deductible}
                    onChange={handleInputChange}
                    placeholder="1000"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Premium Amount */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Premium Amount *
                  </label>
                  <input
                    type="number"
                    name="premium.amount"
                    value={formData.premium.amount}
                    onChange={handleInputChange}
                    placeholder="200"
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors['premium.amount'] ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {errors['premium.amount'] && (
                    <p className="text-red-500 text-xs mt-1">{errors['premium.amount']}</p>
                  )}
                </div>

                {/* Premium Frequency */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Premium Frequency
                  </label>
                  <select
                    name="premium.frequency"
                    value={formData.premium.frequency}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                    <option value="semi-annual">Semi-Annual</option>
                    <option value="annual">Annual</option>
                  </select>
                </div>

                {/* Start Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    name="validity.startDate"
                    value={formData.validity.startDate}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors['validity.startDate'] ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {errors['validity.startDate'] && (
                    <p className="text-red-500 text-xs mt-1">{errors['validity.startDate']}</p>
                  )}
                </div>

                {/* End Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Date *
                  </label>
                  <input
                    type="date"
                    name="validity.endDate"
                    value={formData.validity.endDate}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors['validity.endDate'] ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {errors['validity.endDate'] && (
                    <p className="text-red-500 text-xs mt-1">{errors['validity.endDate']}</p>
                  )}
                </div>
              </div>

              {/* Coverage Types - Dynamic based on policy type */}
              {formData.policyType && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-4">
                    Coverage Types *
                  </label>
                  <div className="grid grid-cols-2 gap-2 mb-6">
                    {formData.policyType === 'life' && (
                      <>
                        {['life_cover', 'hospitalization', 'surgical_benefits', 'outpatient', 'prescription_drugs'].map(type => (
                          <label key={type} className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={formData.coverage.typeLife.includes(type)}
                              onChange={(e) => handleCoverageTypeChange('life', type)}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700">
                              {type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </span>
                          </label>
                        ))}
                      </>
                    )}
                    {formData.policyType === 'vehicle' && (
                      <>
                        {['collision', 'liability', 'comprehensive', 'personal_accident'].map(type => (
                          <label key={type} className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={formData.coverage.typeVehicle.includes(type)}
                              onChange={(e) => handleCoverageTypeChange('vehicle', type)}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700">
                              {type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </span>
                          </label>
                        ))}
                      </>
                    )}
                  </div>
                  {errors.coverageType && (
                    <p className="text-red-500 text-xs mt-1">{errors.coverageType}</p>
                  )}
                </div>
              )}

              {/* Coverage Details - Dynamic Array Management */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Coverage Details
                  </label>
                  <button
                    type="button"
                    onClick={addCoverageDetail}
                    className="px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm"
                  >
                    Add Detail
                  </button>
                </div>
                {formData.coverage.coverageDetails.map((detail, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 mb-4">
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="text-sm font-medium text-gray-700">Detail {index + 1}</h4>
                      {formData.coverage.coverageDetails.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeCoverageDetail(index)}
                          className="text-red-500 hover:text-red-700 text-sm"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Type *
                        </label>
                        <input
                          type="text"
                          value={detail.type}
                          onChange={(e) => handleCoverageDetailChange(index, 'type', e.target.value)}
                          placeholder="Coverage type"
                          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            errors[`coverageDetail_${index}_type`] ? 'border-red-300' : 'border-gray-300'
                          }`}
                        />
                        {errors[`coverageDetail_${index}_type`] && (
                          <p className="text-red-500 text-xs mt-1">{errors[`coverageDetail_${index}_type`]}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Limit *
                        </label>
                        <input
                          type="number"
                          value={detail.limit}
                          onChange={(e) => handleCoverageDetailChange(index, 'limit', e.target.value)}
                          placeholder="10000"
                          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            errors[`coverageDetail_${index}_limit`] ? 'border-red-300' : 'border-gray-300'
                          }`}
                        />
                        {errors[`coverageDetail_${index}_limit`] && (
                          <p className="text-red-500 text-xs mt-1">{errors[`coverageDetail_${index}_limit`]}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Description *
                        </label>
                        <textarea
                          value={detail.description}
                          onChange={(e) => handleCoverageDetailChange(index, 'description', e.target.value)}
                          placeholder="Description"
                          rows="2"
                          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            errors[`coverageDetail_${index}_description`] ? 'border-red-300' : 'border-gray-300'
                          }`}
                        />
                        {errors[`coverageDetail_${index}_description`] && (
                          <p className="text-red-500 text-xs mt-1">{errors[`coverageDetail_${index}_description`]}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Terms */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Terms and Conditions
                </label>
                <textarea
                  name="terms"
                  value={formData.terms}
                  onChange={handleInputChange}
                  rows="3"
                  placeholder="Policy terms and conditions..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows="2"
                  placeholder="Additional notes..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    resetForm();
                  }}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                >
                  {actionLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                  Create Policy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Policy Modal */}
      {showEditModal && selectedPolicy && (
        <div
          className="fixed inset-0 flex items-center justify-center p-4 z-50"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.6)" }}
        >
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Edit Policy</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Policy ID: {selectedPolicy.policyId}</p>
              </div>
            </div>
            
            <form onSubmit={handleUpdate} className="p-6 space-y-6">
              {errors.general && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-red-600 text-sm">{errors.general}</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Policy Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Policy Type *
                  </label>
                  <select
                    name="policyType"
                    value={formData.policyType}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.policyType ? 'border-red-300' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select Policy Type</option>
                    <option value="life">Life Insurance</option>
                    <option value="vehicle">Vehicle Insurance</option>
                  </select>
                  {errors.policyType && (
                    <p className="text-red-500 text-xs mt-1">{errors.policyType}</p>
                  )}
                </div>

                {/* Policy Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Policy Category *
                  </label>
                  <select
                    name="policyCategory"
                    value={formData.policyCategory}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.policyCategory ? 'border-red-300' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select Policy Category</option>
                    <option value="individual">Individual</option>
                    <option value="group">Group</option>
                  </select>
                  {errors.policyCategory && (
                    <p className="text-red-500 text-xs mt-1">{errors.policyCategory}</p>
                  )}
                </div>

                {/* Insurance Agent */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Insurance Agent *
                  </label>
                  <select
                    name="insuranceAgent"
                    value={formData.insuranceAgent}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.insuranceAgent ? 'border-red-300' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select Insurance Agent</option>
                    {insuranceAgents.map(agent => (
                      <option key={agent._id} value={agent._id}>
                        {agent.profile?.firstName} {agent.profile?.lastName}
                      </option>
                    ))}
                  </select>
                  {errors.insuranceAgent && (
                    <p className="text-red-500 text-xs mt-1">{errors.insuranceAgent}</p>
                  )}
                </div>

                {/* Coverage Amount */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Coverage Amount *
                  </label>
                  <input
                    type="number"
                    name="coverage.coverageAmount"
                    value={formData.coverage.coverageAmount}
                    onChange={handleInputChange}
                    placeholder="100000"
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors['coverage.coverageAmount'] ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {errors['coverage.coverageAmount'] && (
                    <p className="text-red-500 text-xs mt-1">{errors['coverage.coverageAmount']}</p>
                  )}
                </div>

                {/* Deductible */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Deductible
                  </label>
                  <input
                    type="number"
                    name="coverage.deductible"
                    value={formData.coverage.deductible}
                    onChange={handleInputChange}
                    placeholder="1000"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Premium Amount */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Premium Amount *
                  </label>
                  <input
                    type="number"
                    name="premium.amount"
                    value={formData.premium.amount}
                    onChange={handleInputChange}
                    placeholder="200"
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors['premium.amount'] ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {errors['premium.amount'] && (
                    <p className="text-red-500 text-xs mt-1">{errors['premium.amount']}</p>
                  )}
                </div>

                {/* Premium Frequency */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Premium Frequency
                  </label>
                  <select
                    name="premium.frequency"
                    value={formData.premium.frequency}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                    <option value="semi-annual">Semi-Annual</option>
                    <option value="annual">Annual</option>
                  </select>
                </div>

                {/* Start Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    name="validity.startDate"
                    value={formData.validity.startDate}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors['validity.startDate'] ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {errors['validity.startDate'] && (
                    <p className="text-red-500 text-xs mt-1">{errors['validity.startDate']}</p>
                  )}
                </div>

                {/* End Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Date *
                  </label>
                  <input
                    type="date"
                    name="validity.endDate"
                    value={formData.validity.endDate}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors['validity.endDate'] ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {errors['validity.endDate'] && (
                    <p className="text-red-500 text-xs mt-1">{errors['validity.endDate']}</p>
                  )}
                </div>
              </div>

              {/* Coverage Types - Dynamic based on policy type */}
              {formData.policyType && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-4">
                    Coverage Types *
                  </label>
                  <div className="grid grid-cols-2 gap-2 mb-6">
                    {formData.policyType === 'life' && (
                      <>
                        {['life_cover', 'hospitalization', 'surgical_benefits', 'outpatient', 'prescription_drugs'].map(type => (
                          <label key={type} className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={formData.coverage.typeLife.includes(type)}
                              onChange={(e) => handleCoverageTypeChange('life', type)}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700">
                              {type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </span>
                          </label>
                        ))}
                      </>
                    )}
                    {formData.policyType === 'vehicle' && (
                      <>
                        {['collision', 'liability', 'comprehensive', 'personal_accident'].map(type => (
                          <label key={type} className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={formData.coverage.typeVehicle.includes(type)}
                              onChange={(e) => handleCoverageTypeChange('vehicle', type)}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700">
                              {type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </span>
                          </label>
                        ))}
                      </>
                    )}
                  </div>
                  {errors.coverageType && (
                    <p className="text-red-500 text-xs mt-1">{errors.coverageType}</p>
                  )}
                </div>
              )}

              {/* Coverage Details - Dynamic Array Management */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Coverage Details
                  </label>
                  <button
                    type="button"
                    onClick={addCoverageDetail}
                    className="px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm"
                  >
                    Add Detail
                  </button>
                </div>
                {formData.coverage.coverageDetails.map((detail, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 mb-4">
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="text-sm font-medium text-gray-700">Detail {index + 1}</h4>
                      {formData.coverage.coverageDetails.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeCoverageDetail(index)}
                          className="text-red-500 hover:text-red-700 text-sm"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Type *
                        </label>
                        <input
                          type="text"
                          value={detail.type}
                          onChange={(e) => handleCoverageDetailChange(index, 'type', e.target.value)}
                          placeholder="Coverage type"
                          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            errors[`coverageDetail_${index}_type`] ? 'border-red-300' : 'border-gray-300'
                          }`}
                        />
                        {errors[`coverageDetail_${index}_type`] && (
                          <p className="text-red-500 text-xs mt-1">{errors[`coverageDetail_${index}_type`]}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Limit *
                        </label>
                        <input
                          type="number"
                          value={detail.limit}
                          onChange={(e) => handleCoverageDetailChange(index, 'limit', e.target.value)}
                          placeholder="10000"
                          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            errors[`coverageDetail_${index}_limit`] ? 'border-red-300' : 'border-gray-300'
                          }`}
                        />
                        {errors[`coverageDetail_${index}_limit`] && (
                          <p className="text-red-500 text-xs mt-1">{errors[`coverageDetail_${index}_limit`]}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Description *
                        </label>
                        <textarea
                          value={detail.description}
                          onChange={(e) => handleCoverageDetailChange(index, 'description', e.target.value)}
                          placeholder="Description"
                          rows="2"
                          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            errors[`coverageDetail_${index}_description`] ? 'border-red-300' : 'border-gray-300'
                          }`}
                        />
                        {errors[`coverageDetail_${index}_description`] && (
                          <p className="text-red-500 text-xs mt-1">{errors[`coverageDetail_${index}_description`]}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Terms */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Terms and Conditions
                </label>
                <textarea
                  name="terms"
                  value={formData.terms}
                  onChange={handleInputChange}
                  rows="3"
                  placeholder="Policy terms and conditions..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows="2"
                  placeholder="Additional notes..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    resetForm();
                  }}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                >
                  {actionLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                  Update Policy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Policy Modal */}
      {showViewModal && selectedPolicy && (
        <div
          className="fixed inset-0 flex items-center justify-center p-4 z-50"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.6)" }}
        >
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Policy Details</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Policy ID: {selectedPolicy.policyId}</p>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Basic Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Policy Type</label>
                    <p className="text-gray-900 capitalize">{selectedPolicy.policyType}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <p className="text-gray-900">{selectedPolicy.policyCategory}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(selectedPolicy.status)}`}>
                      {selectedPolicy.status?.charAt(0).toUpperCase() + selectedPolicy.status?.slice(1)}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Created</label>
                    <p className="text-gray-900">{formatDate(selectedPolicy.createdAt)}</p>
                  </div>
                </div>
              </div>

              {/* Insurance Agent */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Insurance Agent</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <Users className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">
                        {selectedPolicy.insuranceAgent?.firstName} {selectedPolicy.insuranceAgent?.lastName}
                      </p>
                      <p className="text-gray-600">{selectedPolicy.insuranceAgent?.email}</p>
                      {selectedPolicy.insuranceAgent?.phone && (
                        <p className="text-gray-600">{selectedPolicy.insuranceAgent.phone}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Coverage Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Coverage Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Coverage Amount</label>
                    <p className="text-xl font-bold text-green-600">{formatCurrency(selectedPolicy.coverage?.coverageAmount)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Deductible</label>
                    <p className="text-gray-900">{formatCurrency(selectedPolicy.coverage?.deductible)}</p>
                  </div>
                </div>
                {selectedPolicy.coverage?.coverageDetails && (
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Coverage Details</label>
                    <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{selectedPolicy.coverage.coverageDetails}</p>
                  </div>
                )}
              </div>

              {/* Premium Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Premium Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Premium Amount</label>
                    <p className="text-xl font-bold text-blue-600">{formatCurrency(selectedPolicy.premium?.amount)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Frequency</label>
                    <p className="text-gray-900 capitalize">{selectedPolicy.premium?.frequency}</p>
                  </div>
                </div>
              </div>

              {/* Validity Period */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Validity Period</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                    <p className="text-gray-900">{formatDate(selectedPolicy.validity?.startDate)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                    <p className="text-gray-900">{formatDate(selectedPolicy.validity?.endDate)}</p>
                  </div>
                </div>
              </div>

              {/* Beneficiaries */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Beneficiaries ({selectedPolicy.beneficiaries?.length || 0})
                </h3>
                {selectedPolicy.beneficiaries && selectedPolicy.beneficiaries.length > 0 ? (
                  <div className="space-y-3">
                    {selectedPolicy.beneficiaries.map((beneficiary, index) => (
                      <div key={beneficiary._id || index} className="bg-gray-50 p-4 rounded-lg flex items-center gap-4">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                          <Users className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {beneficiary.firstName} {beneficiary.lastName}
                          </p>
                          <p className="text-sm text-gray-600">{beneficiary.email}</p>
                          <p className="text-sm text-gray-600">Employee ID: {beneficiary.employeeId}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 italic">No beneficiaries assigned to this policy</p>
                )}
              </div>

              {/* Terms and Notes */}
              {(selectedPolicy.terms || selectedPolicy.notes) && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Information</h3>
                  {selectedPolicy.terms && (
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Terms and Conditions</label>
                      <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{selectedPolicy.terms}</p>
                    </div>
                  )}
                  {selectedPolicy.notes && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                      <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{selectedPolicy.notes}</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-200">
              <div className="flex justify-end">
                <button
                  onClick={() => setShowViewModal(false)}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};