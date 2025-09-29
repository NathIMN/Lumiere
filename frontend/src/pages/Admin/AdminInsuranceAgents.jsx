import React, { useState, useEffect } from "react";
import {
  Users,
  Plus,
  Search,
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  UserCheck,
  UserX,
  Mail,
  Phone,
  Calendar,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Loader2,
  Building,
  Shield,
  CreditCard,
} from "lucide-react";
import userApiService from "../../services/user-api";

export const AdminInsuranceAgents = () => {
  const [insuranceAgents, setInsuranceAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    profile: {
      firstName: "",
      lastName: "",
      dateOfBirth: "",
      nic: "",
      phoneNumber: "",
      address: "",
    },
    insuranceProvider: {
      companyName: "",
      agentId: "",
      licenseNumber: "",
      contactEmail: "",
      contactPhone: "",
    },
  });
  const [errors, setErrors] = useState({});
  const [actionLoading, setActionLoading] = useState(false);

  // Fetch insurance agents on component mount
  useEffect(() => {
    fetchInsuranceAgents();
  }, []);

  const fetchInsuranceAgents = async () => {
    try {
      setLoading(true);
      const response = await userApiService.getUsersByRole("insurance_agent");
      setInsuranceAgents(response.users || []);
    } catch (error) {
      console.error("Error fetching insurance agents:", error);
      setInsuranceAgents([]);
    } finally {
      setLoading(false);
    }
  };

  // Filter insurance agents based on search and status
  const filteredAgents = insuranceAgents.filter((agent) => {
    const matchesSearch =
      agent.profile?.firstName
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      agent.profile?.lastName
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      agent.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agent.userId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agent.insuranceProvider?.companyName
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      agent.insuranceProvider?.agentId
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || agent.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // Validate form data
  const validateForm = (isEdit = false) => {
    const newErrors = {};

    // Basic user info validation
    if (!formData.email) newErrors.email = "Email is required";
    if (!isEdit && !formData.password)
      newErrors.password = "Password is required";
    if (!formData.profile.firstName)
      newErrors["profile.firstName"] = "First name is required";
    if (!formData.profile.lastName)
      newErrors["profile.lastName"] = "Last name is required";
    if (!formData.profile.dateOfBirth)
      newErrors["profile.dateOfBirth"] = "Date of birth is required";
    if (!formData.profile.nic) newErrors["profile.nic"] = "NIC is required";
    if (!formData.profile.phoneNumber)
      newErrors["profile.phoneNumber"] = "Phone number is required";
    if (!formData.profile.address)
      newErrors["profile.address"] = "Address is required";

    // Insurance provider validation
    if (!formData.insuranceProvider.companyName)
      newErrors["insuranceProvider.companyName"] = "Company name is required";
    if (!formData.insuranceProvider.agentId)
      newErrors["insuranceProvider.agentId"] = "Agent ID is required";
    if (!formData.insuranceProvider.licenseNumber)
      newErrors["insuranceProvider.licenseNumber"] =
        "License number is required";
    if (!formData.insuranceProvider.contactEmail)
      newErrors["insuranceProvider.contactEmail"] = "Contact email is required";
    if (!formData.insuranceProvider.contactPhone)
      newErrors["insuranceProvider.contactPhone"] = "Contact phone is required";

    // Email validation
    if (
      formData.email &&
      !/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(formData.email)
    ) {
      newErrors.email = "Please enter a valid email";
    }

    // Contact email validation
    if (
      formData.insuranceProvider.contactEmail &&
      !/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(
        formData.insuranceProvider.contactEmail
      )
    ) {
      newErrors["insuranceProvider.contactEmail"] =
        "Please enter a valid contact email";
    }

    // Password validation (only for create)
    if (!isEdit && formData.password && formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }

    // NIC validation
    if (
      formData.profile.nic &&
      !/^([0-9]{9}[vVxX]|[0-9]{12})$/.test(formData.profile.nic)
    ) {
      newErrors["profile.nic"] = "Please enter a valid NIC number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle create insurance agent
  const handleCreate = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setActionLoading(true);
      const createData = {
        ...formData,
        role: "insurance_agent",
      };

      await userApiService.createUser(createData);
      setShowCreateModal(false);
      resetForm();
      fetchInsuranceAgents();
    } catch (error) {
      console.error("Error creating insurance agent:", error);
      if (error.message.includes("email already exists")) {
        setErrors({ email: "This email is already registered" });
      }
    } finally {
      setActionLoading(false);
    }
  };

  // Handle update insurance agent
  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!validateForm(true)) return;

    try {
      setActionLoading(true);
      const updateData = { ...formData };
      delete updateData.password; // Don't update password through this route

      await userApiService.updateUser(selectedAgent._id, updateData);
      setShowEditModal(false);
      resetForm();
      fetchInsuranceAgents();
    } catch (error) {
      console.error("Error updating insurance agent:", error);
    } finally {
      setActionLoading(false);
    }
  };

  // Handle delete insurance agent
  const handleDelete = async (agentId) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this insurance agent? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      setActionLoading(true);
      await userApiService.deleteUser(agentId);
      fetchInsuranceAgents();
    } catch (error) {
      console.error("Error deleting insurance agent:", error);
    } finally {
      setActionLoading(false);
    }
  };

  // Handle status update
  const handleStatusUpdate = async (agentId, newStatus) => {
    try {
      setActionLoading(true);
      await userApiService.updateUserStatus(agentId, newStatus);
      fetchInsuranceAgents();
    } catch (error) {
      console.error("Error updating status:", error);
    } finally {
      setActionLoading(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      email: "",
      password: "",
      profile: {
        firstName: "",
        lastName: "",
        dateOfBirth: "",
        nic: "",
        phoneNumber: "",
        address: "",
      },
      insuranceProvider: {
        companyName: "",
        agentId: "",
        licenseNumber: "",
        contactEmail: "",
        contactPhone: "",
      },
    });
    setErrors({});
    setSelectedAgent(null);
  };

  // Open edit modal with selected agent data
  const openEditModal = (agent) => {
    setSelectedAgent(agent);
    setFormData({
      email: agent.email,
      password: "", // Don't pre-fill password
      profile: {
        firstName: agent.profile.firstName || "",
        lastName: agent.profile.lastName || "",
        dateOfBirth: agent.profile.dateOfBirth
          ? agent.profile.dateOfBirth.split("T")[0]
          : "",
        nic: agent.profile.nic || "",
        phoneNumber: agent.profile.phoneNumber || "",
        address: agent.profile.address || "",
      },
      insuranceProvider: {
        companyName: agent.insuranceProvider?.companyName || "",
        agentId: agent.insuranceProvider?.agentId || "",
        licenseNumber: agent.insuranceProvider?.licenseNumber || "",
        contactEmail: agent.insuranceProvider?.contactEmail || "",
        contactPhone: agent.insuranceProvider?.contactPhone || "",
      },
    });
    setShowEditModal(true);
  };

  // Open view modal
  const openViewModal = (agent) => {
    setSelectedAgent(agent);
    setShowViewModal(true);
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "text-green-600 bg-green-100";
      case "inactive":
        return "text-gray-600 bg-gray-100";
      case "suspended":
        return "text-yellow-600 bg-yellow-100";
      case "terminated":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="p-6 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 rounded-xl shadow-xl border-2 border-red-900/10">
      {/* Header */}
      <div className="flex justify-between items-center mb-6 bg-white dark:bg-gray-800 rounded-xl p-6 border-2 border-red-900/10">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-red-900 to-[#151E3D] rounded-full flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-[#151E3D] dark:text-white">
              Insurance Agents Management
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage insurance agent accounts and provider information
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-gradient-to-r from-red-900 to-[#151E3D] hover:from-red-800 hover:to-[#1a2332] text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all duration-200 shadow-lg transform hover:scale-105"
        >
          <Plus className="w-4 h-4" />
          Add Insurance Agent
        </button>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6 bg-white dark:bg-gray-800 rounded-xl p-4 border-2 border-red-900/10">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search by name, email, user ID, company, or agent ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-900 focus:border-red-900 dark:bg-gray-700 dark:text-white transition-all duration-200"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="pl-10 pr-8 py-2 border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-900 focus:border-red-900 dark:bg-gray-700 dark:text-white transition-all duration-200"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="suspended">Suspended</option>
            <option value="terminated">Terminated</option>
          </select>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-blue-600 dark:text-blue-400">
            Total Agents
          </h3>
          <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
            {insuranceAgents.length}
          </p>
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-green-600 dark:text-green-400">
            Active
          </h3>
          <p className="text-2xl font-bold text-green-900 dark:text-green-100">
            {insuranceAgents.filter((a) => a.status === "active").length}
          </p>
        </div>
        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-yellow-600 dark:text-yellow-400">
            Suspended
          </h3>
          <p className="text-2xl font-bold text-yellow-900 dark:text-yellow-100">
            {insuranceAgents.filter((a) => a.status === "suspended").length}
          </p>
        </div>
        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-red-600 dark:text-red-400">
            Inactive
          </h3>
          <p className="text-2xl font-bold text-red-900 dark:text-red-100">
            {insuranceAgents.filter((a) => a.status === "inactive").length}
          </p>
        </div>
      </div>

      {/* Insurance Agents Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
          </div>
        ) : filteredAgents.length === 0 ? (
          <div className="text-center py-12">
            <Shield className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No Insurance Agents Found
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              {searchTerm || statusFilter !== "all"
                ? "Try adjusting your search or filter criteria."
                : "Get started by adding your first insurance agent."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Agent
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Insurance Provider
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Last Login
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredAgents.map((agent) => (
                  <tr
                    key={agent._id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center text-white font-medium">
                          {agent.profile?.firstName?.[0]}
                          {agent.profile?.lastName?.[0]}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {agent.profile?.firstName} {agent.profile?.lastName}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            ID: {agent.userId}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        {agent.email}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        {agent.profile?.phoneNumber || "N/A"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white flex items-center gap-1">
                        <Building className="w-3 h-3" />
                        {agent.insuranceProvider?.companyName || "N/A"}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                        <CreditCard className="w-3 h-3" />
                        Agent: {agent.insuranceProvider?.agentId || "N/A"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                          agent.status
                        )}`}
                      >
                        {agent.status === "active" && (
                          <CheckCircle className="w-3 h-3 mr-1" />
                        )}
                        {agent.status === "suspended" && (
                          <AlertTriangle className="w-3 h-3 mr-1" />
                        )}
                        {(agent.status === "inactive" ||
                          agent.status === "terminated") && (
                          <XCircle className="w-3 h-3 mr-1" />
                        )}
                        {agent.status.charAt(0).toUpperCase() +
                          agent.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(agent.lastLogin)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openViewModal(agent)}
                          className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openEditModal(agent)}
                          className="text-blue-400 hover:text-blue-600 dark:text-blue-500 dark:hover:text-blue-300"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <div className="relative group">
                          <button className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300">
                            <MoreVertical className="w-4 h-4" />
                          </button>
                          <div className="absolute right-0 top-6 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                            {agent.status === "active" ? (
                              <button
                                onClick={() =>
                                  handleStatusUpdate(agent._id, "suspended")
                                }
                                className="w-full text-left px-4 py-2 text-sm text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 flex items-center gap-2"
                              >
                                <UserX className="w-4 h-4" />
                                Suspend
                              </button>
                            ) : (
                              <button
                                onClick={() =>
                                  handleStatusUpdate(agent._id, "active")
                                }
                                className="w-full text-left px-4 py-2 text-sm text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 flex items-center gap-2"
                              >
                                <UserCheck className="w-4 h-4" />
                                Activate
                              </button>
                            )}
                            <button
                              onClick={() => handleDelete(agent._id)}
                              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
                            >
                              <Trash2 className="w-4 h-4" />
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div
          className="fixed inset-0 flex items-center justify-center p-4 z-50"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.6)" }}
        >
          {" "}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Create Insurance Agent
              </h2>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  resetForm();
                }}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-6">
              {/* Personal Information Section */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Personal Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                    {errors.email && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.email}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Password *
                    </label>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                    {errors.password && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.password}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      First Name *
                    </label>
                    <input
                      type="text"
                      name="profile.firstName"
                      value={formData.profile.firstName}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                    {errors["profile.firstName"] && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors["profile.firstName"]}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      name="profile.lastName"
                      value={formData.profile.lastName}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                    {errors["profile.lastName"] && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors["profile.lastName"]}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Date of Birth *
                    </label>
                    <input
                      type="date"
                      name="profile.dateOfBirth"
                      value={formData.profile.dateOfBirth}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                    {errors["profile.dateOfBirth"] && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors["profile.dateOfBirth"]}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      NIC *
                    </label>
                    <input
                      type="text"
                      name="profile.nic"
                      value={formData.profile.nic}
                      onChange={handleInputChange}
                      placeholder="123456789V or 123456789012"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                    {errors["profile.nic"] && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors["profile.nic"]}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      name="profile.phoneNumber"
                      value={formData.profile.phoneNumber}
                      onChange={handleInputChange}
                      placeholder="077XXXXXXX"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                    {errors["profile.phoneNumber"] && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors["profile.phoneNumber"]}
                      </p>
                    )}
                  </div>
                </div>
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Address *
                  </label>
                  <textarea
                    name="profile.address"
                    value={formData.profile.address}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                  {errors["profile.address"] && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors["profile.address"]}
                    </p>
                  )}
                </div>
              </div>

              {/* Insurance Provider Section */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Insurance Provider Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Company Name *
                    </label>
                    <input
                      type="text"
                      name="insuranceProvider.companyName"
                      value={formData.insuranceProvider.companyName}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                    {errors["insuranceProvider.companyName"] && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors["insuranceProvider.companyName"]}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Agent ID *
                    </label>
                    <input
                      type="text"
                      name="insuranceProvider.agentId"
                      value={formData.insuranceProvider.agentId}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                    {errors["insuranceProvider.agentId"] && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors["insuranceProvider.agentId"]}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      License Number *
                    </label>
                    <input
                      type="text"
                      name="insuranceProvider.licenseNumber"
                      value={formData.insuranceProvider.licenseNumber}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                    {errors["insuranceProvider.licenseNumber"] && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors["insuranceProvider.licenseNumber"]}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Contact Email *
                    </label>
                    <input
                      type="email"
                      name="insuranceProvider.contactEmail"
                      value={formData.insuranceProvider.contactEmail}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                    {errors["insuranceProvider.contactEmail"] && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors["insuranceProvider.contactEmail"]}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Contact Phone *
                    </label>
                    <input
                      type="tel"
                      name="insuranceProvider.contactPhone"
                      value={formData.insuranceProvider.contactPhone}
                      onChange={handleInputChange}
                      placeholder="077XXXXXXX"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                    {errors["insuranceProvider.contactPhone"] && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors["insuranceProvider.contactPhone"]}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    resetForm();
                  }}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50 flex items-center gap-2"
                >
                  {actionLoading && (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  )}
                  Create Insurance Agent
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div
          className="fixed inset-0 flex items-center justify-center p-4 z-50"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.6)" }}
        >
          {" "}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Edit Insurance Agent
              </h2>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  resetForm();
                }}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleUpdate} className="p-6 space-y-6">
              {/* Personal Information Section */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Personal Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                    {errors.email && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.email}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      User ID
                    </label>
                    <input
                      type="text"
                      value={selectedAgent?.userId || ""}
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-600 text-gray-500 dark:text-gray-400"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      First Name *
                    </label>
                    <input
                      type="text"
                      name="profile.firstName"
                      value={formData.profile.firstName}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                    {errors["profile.firstName"] && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors["profile.firstName"]}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      name="profile.lastName"
                      value={formData.profile.lastName}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                    {errors["profile.lastName"] && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors["profile.lastName"]}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Date of Birth *
                    </label>
                    <input
                      type="date"
                      name="profile.dateOfBirth"
                      value={formData.profile.dateOfBirth}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                    {errors["profile.dateOfBirth"] && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors["profile.dateOfBirth"]}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      NIC *
                    </label>
                    <input
                      type="text"
                      name="profile.nic"
                      value={formData.profile.nic}
                      onChange={handleInputChange}
                      placeholder="123456789V or 123456789012"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                    {errors["profile.nic"] && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors["profile.nic"]}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      name="profile.phoneNumber"
                      value={formData.profile.phoneNumber}
                      onChange={handleInputChange}
                      placeholder="077XXXXXXX"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                    {errors["profile.phoneNumber"] && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors["profile.phoneNumber"]}
                      </p>
                    )}
                  </div>
                </div>
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Address *
                  </label>
                  <textarea
                    name="profile.address"
                    value={formData.profile.address}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                  {errors["profile.address"] && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors["profile.address"]}
                    </p>
                  )}
                </div>
              </div>

              {/* Insurance Provider Section */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Insurance Provider Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Company Name *
                    </label>
                    <input
                      type="text"
                      name="insuranceProvider.companyName"
                      value={formData.insuranceProvider.companyName}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                    {errors["insuranceProvider.companyName"] && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors["insuranceProvider.companyName"]}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Agent ID *
                    </label>
                    <input
                      type="text"
                      name="insuranceProvider.agentId"
                      value={formData.insuranceProvider.agentId}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                    {errors["insuranceProvider.agentId"] && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors["insuranceProvider.agentId"]}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      License Number *
                    </label>
                    <input
                      type="text"
                      name="insuranceProvider.licenseNumber"
                      value={formData.insuranceProvider.licenseNumber}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                    {errors["insuranceProvider.licenseNumber"] && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors["insuranceProvider.licenseNumber"]}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Contact Email *
                    </label>
                    <input
                      type="email"
                      name="insuranceProvider.contactEmail"
                      value={formData.insuranceProvider.contactEmail}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                    {errors["insuranceProvider.contactEmail"] && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors["insuranceProvider.contactEmail"]}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Contact Phone *
                    </label>
                    <input
                      type="tel"
                      name="insuranceProvider.contactPhone"
                      value={formData.insuranceProvider.contactPhone}
                      onChange={handleInputChange}
                      placeholder="077XXXXXXX"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                    {errors["insuranceProvider.contactPhone"] && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors["insuranceProvider.contactPhone"]}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                      Password Update
                    </h4>
                    <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                      To change the password, use the "Reset Password" option
                      from the actions menu in the table.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    resetForm();
                  }}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50 flex items-center gap-2"
                >
                  {actionLoading && (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  )}
                  Update Insurance Agent
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Modal */}
      {showViewModal && selectedAgent && (
        <div
          className="fixed inset-0 flex items-center justify-center p-4 z-50"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.6)" }}
        >
          {" "}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Insurance Agent Details
              </h2>
              <button
                onClick={() => setShowViewModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6">
              <div className="flex items-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
                  {selectedAgent.profile?.firstName?.[0]}
                  {selectedAgent.profile?.lastName?.[0]}
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {selectedAgent.profile?.firstName}{" "}
                    {selectedAgent.profile?.lastName}
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    Insurance Agent • {selectedAgent.userId}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                        selectedAgent.status
                      )}`}
                    >
                      {selectedAgent.status === "active" && (
                        <CheckCircle className="w-3 h-3 mr-1" />
                      )}
                      {selectedAgent.status === "suspended" && (
                        <AlertTriangle className="w-3 h-3 mr-1" />
                      )}
                      {(selectedAgent.status === "inactive" ||
                        selectedAgent.status === "terminated") && (
                        <XCircle className="w-3 h-3 mr-1" />
                      )}
                      {selectedAgent.status.charAt(0).toUpperCase() +
                        selectedAgent.status.slice(1)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                    Personal Information
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 dark:text-gray-400">
                        Email
                      </label>
                      <p className="text-sm text-gray-900 dark:text-white">
                        {selectedAgent.email}
                      </p>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 dark:text-gray-400">
                        Phone
                      </label>
                      <p className="text-sm text-gray-900 dark:text-white">
                        {selectedAgent.profile?.phoneNumber || "N/A"}
                      </p>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 dark:text-gray-400">
                        Date of Birth
                      </label>
                      <p className="text-sm text-gray-900 dark:text-white">
                        {formatDate(selectedAgent.profile?.dateOfBirth)}
                      </p>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 dark:text-gray-400">
                        NIC
                      </label>
                      <p className="text-sm text-gray-900 dark:text-white">
                        {selectedAgent.profile?.nic || "N/A"}
                      </p>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                    Account Information
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 dark:text-gray-400">
                        User ID
                      </label>
                      <p className="text-sm text-gray-900 dark:text-white">
                        {selectedAgent.userId}
                      </p>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 dark:text-gray-400">
                        Role
                      </label>
                      <p className="text-sm text-gray-900 dark:text-white">
                        Insurance Agent
                      </p>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 dark:text-gray-400">
                        Last Login
                      </label>
                      <p className="text-sm text-gray-900 dark:text-white">
                        {formatDate(selectedAgent.lastLogin)}
                      </p>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 dark:text-gray-400">
                        Created
                      </label>
                      <p className="text-sm text-gray-900 dark:text-white">
                        {formatDate(selectedAgent.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                  Insurance Provider Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400">
                      Company Name
                    </label>
                    <p className="text-sm text-gray-900 dark:text-white">
                      {selectedAgent.insuranceProvider?.companyName || "N/A"}
                    </p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400">
                      Agent ID
                    </label>
                    <p className="text-sm text-gray-900 dark:text-white">
                      {selectedAgent.insuranceProvider?.agentId || "N/A"}
                    </p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400">
                      License Number
                    </label>
                    <p className="text-sm text-gray-900 dark:text-white">
                      {selectedAgent.insuranceProvider?.licenseNumber || "N/A"}
                    </p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400">
                      Contact Email
                    </label>
                    <p className="text-sm text-gray-900 dark:text-white">
                      {selectedAgent.insuranceProvider?.contactEmail || "N/A"}
                    </p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400">
                      Contact Phone
                    </label>
                    <p className="text-sm text-gray-900 dark:text-white">
                      {selectedAgent.insuranceProvider?.contactPhone || "N/A"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                  Address
                </h4>
                <p className="text-sm text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                  {selectedAgent.profile?.address || "No address provided"}
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-gray-200 dark:border-gray-700 mt-6">
                <button
                  onClick={() => setShowViewModal(false)}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setShowViewModal(false);
                    openEditModal(selectedAgent);
                  }}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2"
                >
                  <Edit className="w-4 h-4" />
                  Edit Agent
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
