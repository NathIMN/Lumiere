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
  FileText,
} from "lucide-react";
import userApiService from "../../services/user-api";
import reportsApiService from "../../services/reports-api";

export const AdminHrOfficers = () => {
  const [hrOfficers, setHrOfficers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedOfficer, setSelectedOfficer] = useState(null);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    profile: {
      firstName: "",
      lastName: "",
      dateOfBirth: "",
      nic: "",
      phoneNumber: "",
      address: "",
    },
  });
  const [errors, setErrors] = useState({});
  const [actionLoading, setActionLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // Fetch HR officers on component mount
  useEffect(() => {
    fetchHrOfficers();
  }, []);

  const fetchHrOfficers = async () => {
    try {
      setLoading(true);
      const response = await userApiService.getUsersByRole("hr_officer");
      setHrOfficers(response.users || []);
    } catch (error) {
      console.error("Error fetching HR officers:", error);
      setHrOfficers([]);
    } finally {
      setLoading(false);
    }
  };

  // Real-time validation functions
  const handleNicChange = (e) => {
    let value = e.target.value.toUpperCase();
    
    // Remove any invalid characters
    value = value.replace(/[^0-9V]/g, '');
    
    if (value.includes('V')) {
      const vIndex = value.indexOf('V');
      if (vIndex === 9 && value.length <= 10) {
        value = value.substring(0, 10);
      } else if (vIndex < 9) {
        value = value.replace('V', '');
      } else {
        value = value.substring(0, 9) + 'V';
      }
    } else {
      value = value.substring(0, 12);
    }
    
    // Create synthetic event
    const syntheticEvent = {
      ...e,
      target: {
        ...e.target,
        name: 'profile.nic',
        value: value
      }
    };
    
    handleInputChange(syntheticEvent);
  };

  const handlePhoneChange = (e) => {
    let value = e.target.value;
    
    // Remove any non-numeric characters
    value = value.replace(/[^0-9]/g, '');
    
    // Limit to exactly 10 digits
    value = value.substring(0, 10);
    
    // Create synthetic event
    const syntheticEvent = {
      ...e,
      target: {
        ...e.target,
        name: 'profile.phoneNumber',
        value: value
      }
    };
    
    handleInputChange(syntheticEvent);
  };

  const handleKeyPress = (e, type) => {
    const isControlKey = ['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 'ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key);
    
    // Always allow control keys
    if (isControlKey) {
      return;
    }

    if (type === 'name') {
      // Allow letters and space only
      if (!/[a-zA-Z\s]/.test(e.key)) {
        e.preventDefault();
      }
    }
  };

  // Real-time validation functions
  const validateField = (name, value, formData) => {
    const errors = {};
    
    switch (name) {
      case 'email':
        if (!value) {
          errors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          errors.email = 'Please enter a valid email address';
        }
        break;
        
      case 'password':
        if (!value) {
          errors.password = 'Password is required';
        } else if (value.length < 8) {
          errors.password = 'Password must be at least 8 characters';
        }
        break;
        
      case 'confirmPassword':
        if (!value) {
          errors.confirmPassword = 'Please confirm your password';
        } else if (formData.password !== value) {
          errors.confirmPassword = 'Passwords do not match';
        }
        break;
        
      case 'profile.firstName':
        if (!value) {
          errors['profile.firstName'] = 'First name is required';
        } else if (!/^[a-zA-Z\s]+$/.test(value)) {
          errors['profile.firstName'] = 'First name should contain only letters';
        }
        break;
        
      case 'profile.lastName':
        if (!value) {
          errors['profile.lastName'] = 'Last name is required';
        } else if (!/^[a-zA-Z\s]+$/.test(value)) {
          errors['profile.lastName'] = 'Last name should contain only letters';
        }
        break;
        
      case 'profile.dateOfBirth':
        if (!value) {
          errors['profile.dateOfBirth'] = 'Date of birth is required';
        } else {
          const birthDate = new Date(value);
          const today = new Date();
          let age = today.getFullYear() - birthDate.getFullYear();
          const monthDiff = today.getMonth() - birthDate.getMonth();
          
          if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
          }
          
          if (age < 18) {
            errors['profile.dateOfBirth'] = 'Employee must be at least 18 years old';
          } else if (age > 55) {
            errors['profile.dateOfBirth'] = 'Employee must be no older than 55 years';
          }
        }
        break;
        
      case 'profile.nic':
        if (!value) {
          errors['profile.nic'] = 'NIC is required';
        } else {
          const nic = value.toUpperCase();
          if (nic.includes('V')) {
            if (!/^\d{9}V$/.test(nic)) {
              errors['profile.nic'] = 'Invalid old NIC format. Must be 9 digits followed by V';
            }
          } else {
            if (!/^\d{12}$/.test(nic)) {
              errors['profile.nic'] = 'Invalid new NIC format. Must be exactly 12 digits';
            }
          }
        }
        break;
        
      case 'profile.phoneNumber':
        if (!value) {
          errors['profile.phoneNumber'] = 'Phone number is required';
        } else if (!/^\d{10}$/.test(value)) {
          errors['profile.phoneNumber'] = 'Phone number must be exactly 10 digits';
        }
        break;
        
      case 'profile.address':
        if (!value) {
          errors['profile.address'] = 'Address is required';
        }
        break;
    }
    
    return errors;
  };

  // Get real-time validation feedback for a field
  const getFieldFeedback = (name, value, formData) => {
    if (!value) return null;
    
    switch (name) {
      case 'email':
        if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          return { type: 'success', message: '✓ Valid email address' };
        } else {
          return { type: 'error', message: 'Invalid email format' };
        }
        
      case 'password':
        if (value.length >= 8) {
          return { type: 'success', message: '✓ Password meets requirements' };
        } else {
          return { type: 'error', message: `Password too short: ${value.length}/8 characters` };
        }
        
      case 'profile.firstName':
      case 'profile.lastName':
        if (/^[a-zA-Z\s]+$/.test(value)) {
          return { type: 'success', message: '✓ Valid name format' };
        } else {
          return { type: 'error', message: 'Only letters and spaces allowed' };
        }
        
      case 'profile.address':
        if (value.length >= 10) {
          return { type: 'success', message: '✓ Address looks complete' };
        } else {
          return { type: 'warning', message: `Address: ${value.length} characters (recommended: 10+)` };
        }
        
      case 'profile.nic':
        const nic = value.toUpperCase();
        if (nic.includes('V')) {
          // Old NIC format validation
          if (nic.length === 10 && /^\d{9}V$/.test(nic)) {
            return { type: 'success', message: '✓ Valid old NIC format (9 digits + V)' };
          } else if (nic.length < 10) {
            return { type: 'warning', message: `Old NIC format: ${nic.length}/10 characters (9 digits + V)` };
          } else {
            return { type: 'error', message: 'Invalid old NIC format. Must be 9 digits + V' };
          }
        } else {
          // New NIC format validation
          if (nic.length === 12 && /^\d{12}$/.test(nic)) {
            return { type: 'success', message: '✓ Valid new NIC format (12 digits)' };
          } else if (nic.length < 12) {
            return { type: 'warning', message: `New NIC format: ${nic.length}/12 digits` };
          } else {
            return { type: 'error', message: 'Invalid new NIC format. Must be exactly 12 digits' };
          }
        }
        
      case 'profile.phoneNumber':
        if (value.length === 10 && /^\d{10}$/.test(value)) {
          return { type: 'success', message: '✓ Valid phone number' };
        } else if (value.length < 10) {
          return { type: 'warning', message: `Phone number: ${value.length}/10 digits` };
        } else {
          return { type: 'error', message: 'Phone number must be exactly 10 digits' };
        }
        
      case 'confirmPassword':
        if (formData.password && value === formData.password) {
          return { type: 'success', message: '✓ Passwords match' };
        } else if (formData.password && value) {
          return { type: 'error', message: 'Passwords do not match' };
        }
        break;
        
      case 'profile.dateOfBirth':
        if (value) {
          const birthDate = new Date(value);
          const today = new Date();
          let age = today.getFullYear() - birthDate.getFullYear();
          const monthDiff = today.getMonth() - birthDate.getMonth();
          
          if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
          }
          
          if (age >= 18 && age <= 55) {
            return { type: 'success', message: `✓ Valid age: ${age} years` };
          } else if (age < 18) {
            return { type: 'error', message: `Too young: ${age} years (minimum 18)` };
          } else {
            return { type: 'error', message: `Too old: ${age} years (maximum 55)` };
          }
        }
        break;
    }
    
    return null;
  };

  // Calculate date restrictions for 18-55 years
  const getDateRestrictions = () => {
    const today = new Date();
    const maxDate = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
    const minDate = new Date(today.getFullYear() - 55, today.getMonth(), today.getDate());
    
    return {
      min: minDate.toISOString().split('T')[0],
      max: maxDate.toISOString().split('T')[0]
    };
  };

  const dateRestrictions = getDateRestrictions();

  // Filter HR officers based on search and status
  const filteredOfficers = hrOfficers.filter((officer) => {
    const matchesSearch =
      officer.profile?.firstName
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      officer.profile?.lastName
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      officer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      officer.userId?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || officer.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Handle form input changes with validation
  const handleInputChange = (e, validationType = null) => {
    const { name, value } = e.target;
    let processedValue = value;

    // Apply validation based on type
    if (validationType === 'name') {
      const nameRegex = /^[a-zA-Z\s]*$/;
      if (!nameRegex.test(value)) {
        return; // Don't update if invalid
      }
    }

    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: processedValue,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: processedValue,
      }));
    }
    
    // Get updated formData for validation
    const updatedFormData = { ...formData };
    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      updatedFormData[parent] = { ...updatedFormData[parent], [child]: processedValue };
    } else {
      updatedFormData[name] = processedValue;
    }
    
    // Perform real-time validation
    const fieldErrors = validateField(name, processedValue, updatedFormData);
    
    // Update errors state
    setErrors((prev) => ({
      ...prev,
      ...fieldErrors,
      // Clear error if field is now valid
      ...(Object.keys(fieldErrors).length === 0 && prev[name] ? { [name]: '' } : {})
    }));

    // Special handling for confirm password validation
    if (name === 'confirmPassword' && errors.confirmPassword) {
      setErrors(prev => ({
        ...prev,
        confirmPassword: ''
      }));
    }
    
    // Clear confirm password error when password changes
    if (name === 'password' && errors.confirmPassword) {
      setErrors(prev => ({
        ...prev,
        confirmPassword: ''
      }));
    }
  };

  // Validate form data with comprehensive validation
  const validateForm = (isEdit = false) => {
    const newErrors = {};

    // Email validation
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Password validation (only for create)
    if (!isEdit) {
      if (!formData.password) {
        newErrors.password = "Password is required";
      } else if (formData.password.length < 8) {
        newErrors.password = "Password must be at least 8 characters";
      }

      // Confirm password validation
      if (!formData.confirmPassword) {
        newErrors.confirmPassword = "Please confirm your password";
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match";
      }
    }

    // First name validation
    if (!formData.profile.firstName) {
      newErrors["profile.firstName"] = "First name is required";
    } else if (!/^[a-zA-Z\s]+$/.test(formData.profile.firstName)) {
      newErrors["profile.firstName"] = "First name should contain only letters";
    }

    // Last name validation
    if (!formData.profile.lastName) {
      newErrors["profile.lastName"] = "Last name is required";
    } else if (!/^[a-zA-Z\s]+$/.test(formData.profile.lastName)) {
      newErrors["profile.lastName"] = "Last name should contain only letters";
    }

    // Date of birth validation with age requirement
    if (!formData.profile.dateOfBirth) {
      newErrors["profile.dateOfBirth"] = "Date of birth is required";
    } else {
      const birthDate = new Date(formData.profile.dateOfBirth);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      
      // Adjust age if birthday hasn't occurred this year
      const actualAge = monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate()) 
        ? age - 1 
        : age;

      if (actualAge < 18) {
        newErrors["profile.dateOfBirth"] = "HR Officer must be at least 18 years old";
      }

      if (birthDate > today) {
        newErrors["profile.dateOfBirth"] = "Date of birth cannot be in the future";
      }
    }

    // NIC validation
    if (!formData.profile.nic) {
      newErrors["profile.nic"] = "NIC is required";
    } else {
      const nic = formData.profile.nic.toUpperCase();
      if (nic.includes('V')) {
        // Old NIC format validation (9 digits + V)
        if (!/^\d{9}V$/.test(nic)) {
          newErrors["profile.nic"] = "Invalid old NIC format. Must be 9 digits followed by V";
        }
      } else {
        // New NIC format validation (12 digits)
        if (!/^\d{12}$/.test(nic)) {
          newErrors["profile.nic"] = "Invalid new NIC format. Must be exactly 12 digits";
        }
      }
    }

    // Phone number validation
    if (!formData.profile.phoneNumber) {
      newErrors["profile.phoneNumber"] = "Phone number is required";
    } else if (!/^\d{10}$/.test(formData.profile.phoneNumber)) {
      newErrors["profile.phoneNumber"] = "Phone number must be exactly 10 digits";
    }

    // Address validation
    if (!formData.profile.address) {
      newErrors["profile.address"] = "Address is required";
    } else if (formData.profile.address.trim().length < 10) {
      newErrors["profile.address"] = "Address must be at least 10 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle create HR officer
  const handleCreate = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setActionLoading(true);
      const createData = {
        ...formData,
        role: "hr_officer",
      };

      await userApiService.createUser(createData);
      setShowCreateModal(false);
      resetForm();
      fetchHrOfficers();
      // Show success message (you can add a toast notification here)
    } catch (error) {
      console.error("Error creating HR officer:", error);
      if (error.message.includes("email already exists")) {
        setErrors({ email: "This email is already registered" });
      }
    } finally {
      setActionLoading(false);
    }
  };

  // Handle update HR officer
  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!validateForm(true)) return;

    try {
      setActionLoading(true);
      const updateData = { ...formData };
      delete updateData.password; // Don't update password through this route

      await userApiService.updateUser(selectedOfficer._id, updateData);
      setShowEditModal(false);
      resetForm();
      fetchHrOfficers();
    } catch (error) {
      console.error("Error updating HR officer:", error);
    } finally {
      setActionLoading(false);
    }
  };

  // Handle delete HR officer
  const handleDelete = async (officerId) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this HR officer? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      setActionLoading(true);
      await userApiService.deleteUser(officerId);
      fetchHrOfficers();
    } catch (error) {
      console.error("Error deleting HR officer:", error);
    } finally {
      setActionLoading(false);
    }
  };

  // Handle status update
  const handleStatusUpdate = async (officerId, newStatus) => {
    try {
      setActionLoading(true);
      await userApiService.updateUserStatus(officerId, newStatus);
      fetchHrOfficers();
    } catch (error) {
      console.error("Error updating status:", error);
    } finally {
      setActionLoading(false);
    }
  };

  // Show success/error messages
  const showMessage = (message, isError = false) => {
    if (isError) {
      setError(message);
      setSuccess('');
    } else {
      setSuccess(message);
      setError('');
    }
    
    // Clear message after 5 seconds
    setTimeout(() => {
      setError('');
      setSuccess('');
    }, 5000);
  };

  // Handle HR officers report generation
  const handleGenerateHROfficersReport = async () => {
    try {
      setLoading(true);
      
      // Prepare filters based on current page filters
      const reportFilters = {
        status: statusFilter !== 'all' ? statusFilter : undefined,
        format: 'pdf'
      };

      // Remove undefined values
      Object.keys(reportFilters).forEach(key => {
        if (reportFilters[key] === undefined) {
          delete reportFilters[key];
        }
      });

      // Get the report blob (using users report for HR officers)
      const blob = await reportsApiService.generateUsersReport({ 
        ...reportFilters, 
        role: 'hr_officer' 
      });
      
      // Create download link and trigger download (same as AdminReports.jsx)
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `hr-officers-report-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      showMessage('HR Officers report downloaded successfully');
    } catch (err) {
      console.error('Error generating HR officers report:', err);
      showMessage(err.message || 'Failed to generate HR officers report', true);
    } finally {
      setLoading(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      email: "",
      password: "",
      confirmPassword: "",
      profile: {
        firstName: "",
        lastName: "",
        dateOfBirth: "",
        nic: "",
        phoneNumber: "",
        address: "",
      },
    });
    setErrors({});
    setSelectedOfficer(null);
  };

  // Open edit modal with selected officer data
  const openEditModal = (officer) => {
    setSelectedOfficer(officer);
    setFormData({
      email: officer.email,
      password: "", // Don't pre-fill password
      profile: {
        firstName: officer.profile.firstName || "",
        lastName: officer.profile.lastName || "",
        dateOfBirth: officer.profile.dateOfBirth
          ? officer.profile.dateOfBirth.split("T")[0]
          : "",
        nic: officer.profile.nic || "",
        phoneNumber: officer.profile.phoneNumber || "",
        address: officer.profile.address || "",
      },
    });
    setShowEditModal(true);
  };

  // Open view modal
  const openViewModal = (officer) => {
    setSelectedOfficer(officer);
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
              <Users className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-[#151E3D] dark:text-white">
              HR Officers Management
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage HR officer accounts and permissions
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-gradient-to-r from-red-900 to-[#151E3D] hover:from-red-800 hover:to-[#1a2332] text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all duration-200 shadow-lg transform hover:scale-105"
        >
          <Plus className="w-4 h-4" />
          Add HR Officer
        </button>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center">
            <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
            <span className="text-green-800">{success}</span>
          </div>
        </div>
      )}
      
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <XCircle className="w-5 h-5 text-red-500 mr-2" />
            <span className="text-red-800">{error}</span>
          </div>
        </div>
      )}

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6 bg-white dark:bg-gray-800 rounded-xl p-4 border-2 border-red-900/10">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search by name, email, or user ID..."
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
        <button
          onClick={handleGenerateHROfficersReport}
          disabled={loading}
          className="flex items-center px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-200 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FileText className="w-4 h-4 mr-2" />
          Generate Report
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-blue-600 dark:text-blue-400">
            Total HR Officers
          </h3>
          <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
            {hrOfficers.length}
          </p>
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-green-600 dark:text-green-400">
            Active
          </h3>
          <p className="text-2xl font-bold text-green-900 dark:text-green-100">
            {hrOfficers.filter((o) => o.status === "active").length}
          </p>
        </div>
        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-yellow-600 dark:text-yellow-400">
            Suspended
          </h3>
          <p className="text-2xl font-bold text-yellow-900 dark:text-yellow-100">
            {hrOfficers.filter((o) => o.status === "suspended").length}
          </p>
        </div>
        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-red-600 dark:text-red-400">
            Inactive
          </h3>
          <p className="text-2xl font-bold text-red-900 dark:text-red-100">
            {hrOfficers.filter((o) => o.status === "inactive").length}
          </p>
        </div>
      </div>

      {/* HR Officers Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
          </div>
        ) : filteredOfficers.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No HR Officers Found
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              {searchTerm || statusFilter !== "all"
                ? "Try adjusting your search or filter criteria."
                : "Get started by adding your first HR officer."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Officer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Contact
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
                {filteredOfficers.map((officer) => (
                  <tr
                    key={officer._id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium">
                          {officer.profile?.firstName?.[0]}
                          {officer.profile?.lastName?.[0]}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {officer.profile?.firstName}{" "}
                            {officer.profile?.lastName}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            ID: {officer.userId}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        {officer.email}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        {officer.profile?.phoneNumber || "N/A"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                          officer.status
                        )}`}
                      >
                        {officer.status === "active" && (
                          <CheckCircle className="w-3 h-3 mr-1" />
                        )}
                        {officer.status === "suspended" && (
                          <AlertTriangle className="w-3 h-3 mr-1" />
                        )}
                        {(officer.status === "inactive" ||
                          officer.status === "terminated") && (
                          <XCircle className="w-3 h-3 mr-1" />
                        )}
                        {officer.status.charAt(0).toUpperCase() +
                          officer.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(officer.lastLogin)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openViewModal(officer)}
                          className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openEditModal(officer)}
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
                            {officer.status === "active" ? (
                              <button
                                onClick={() =>
                                  handleStatusUpdate(officer._id, "suspended")
                                }
                                className="w-full text-left px-4 py-2 text-sm text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 flex items-center gap-2"
                              >
                                <UserX className="w-4 h-4" />
                                Suspend
                              </button>
                            ) : (
                              <button
                                onClick={() =>
                                  handleStatusUpdate(officer._id, "active")
                                }
                                className="w-full text-left px-4 py-2 text-sm text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 flex items-center gap-2"
                              >
                                <UserCheck className="w-4 h-4" />
                                Activate
                              </button>
                            )}
                            <button
                              onClick={() => handleDelete(officer._id)}
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
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Create HR Officer
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
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              {/* CREATE MODAL FORM */}
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
                    placeholder="Enter email"
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:border-transparent dark:bg-gray-700 dark:text-white ${
                      errors.email 
                        ? 'border-red-500 focus:ring-red-500' 
                        : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500'
                    }`}
                  />
                  {errors.email && (
                    <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                  )}
                  {getFieldFeedback('email', formData.email, formData) && (
                    <p className={`text-xs mt-1 ${
                      getFieldFeedback('email', formData.email, formData).type === 'success' 
                        ? 'text-green-600' 
                        : 'text-red-600'
                    }`}>
                      {getFieldFeedback('email', formData.email, formData).message}
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
                    placeholder="Enter password"
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:border-transparent dark:bg-gray-700 dark:text-white ${
                      errors.password 
                        ? 'border-red-500 focus:ring-red-500' 
                        : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500'
                    }`}
                  />
                  {errors.password && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.password}
                    </p>
                  )}
                  {getFieldFeedback('password', formData.password, formData) && (
                    <p className={`text-xs mt-1 ${
                      getFieldFeedback('password', formData.password, formData).type === 'success' 
                        ? 'text-green-600' 
                        : 'text-red-600'
                    }`}>
                      {getFieldFeedback('password', formData.password, formData).message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Confirm Password *
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    placeholder="Confirm password"
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:border-transparent dark:bg-gray-700 dark:text-white ${
                      errors.confirmPassword 
                        ? 'border-red-500 focus:ring-red-500' 
                        : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500'
                    }`}
                  />
                  {errors.confirmPassword && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.confirmPassword}
                    </p>
                  )}
                  {getFieldFeedback('confirmPassword', formData.confirmPassword, formData) && (
                    <p className={`text-xs mt-1 ${
                      getFieldFeedback('confirmPassword', formData.confirmPassword, formData).type === 'success' 
                        ? 'text-green-600' 
                        : 'text-red-600'
                    }`}>
                      {getFieldFeedback('confirmPassword', formData.confirmPassword, formData).message}
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
                    onChange={(e) => handleInputChange(e, 'name')}
                    onKeyDown={(e) => handleKeyPress(e, 'name')}
                    placeholder="Enter first name"
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:border-transparent dark:bg-gray-700 dark:text-white ${
                      errors["profile.firstName"] 
                        ? 'border-red-500 focus:ring-red-500' 
                        : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500'
                    }`}
                  />
                  {errors["profile.firstName"] && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors["profile.firstName"]}
                    </p>
                  )}
                  {getFieldFeedback('profile.firstName', formData.profile.firstName, formData) && (
                    <p className={`text-xs mt-1 ${
                      getFieldFeedback('profile.firstName', formData.profile.firstName, formData).type === 'success' 
                        ? 'text-green-600' 
                        : 'text-red-600'
                    }`}>
                      {getFieldFeedback('profile.firstName', formData.profile.firstName, formData).message}
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
                    onChange={(e) => handleInputChange(e, 'name')}
                    onKeyDown={(e) => handleKeyPress(e, 'name')}
                    placeholder="Enter last name"
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:border-transparent dark:bg-gray-700 dark:text-white ${
                      errors["profile.lastName"] 
                        ? 'border-red-500 focus:ring-red-500' 
                        : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500'
                    }`}
                  />
                  {errors["profile.lastName"] && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors["profile.lastName"]}
                    </p>
                  )}
                  {getFieldFeedback('profile.lastName', formData.profile.lastName, formData) && (
                    <p className={`text-xs mt-1 ${
                      getFieldFeedback('profile.lastName', formData.profile.lastName, formData).type === 'success' 
                        ? 'text-green-600' 
                        : 'text-red-600'
                    }`}>
                      {getFieldFeedback('profile.lastName', formData.profile.lastName, formData).message}
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
                    min={dateRestrictions.min}
                    max={dateRestrictions.max}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:border-transparent dark:bg-gray-700 dark:text-white ${
                      errors["profile.dateOfBirth"] 
                        ? 'border-red-500 focus:ring-red-500' 
                        : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500'
                    }`}
                  />
                  {errors["profile.dateOfBirth"] && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors["profile.dateOfBirth"]}
                    </p>
                  )}
                  {getFieldFeedback('profile.dateOfBirth', formData.profile.dateOfBirth, formData) && (
                    <p className={`text-xs mt-1 ${
                      getFieldFeedback('profile.dateOfBirth', formData.profile.dateOfBirth, formData).type === 'success' 
                        ? 'text-green-600' 
                        : getFieldFeedback('profile.dateOfBirth', formData.profile.dateOfBirth, formData).type === 'error'
                        ? 'text-red-600'
                        : 'text-amber-600'
                    }`}>
                      {getFieldFeedback('profile.dateOfBirth', formData.profile.dateOfBirth, formData).message}
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
                    onChange={handleNicChange}
                    placeholder="Enter NIC (e.g., 123456789V or 199812345678)"
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:border-transparent dark:bg-gray-700 dark:text-white ${
                      errors["profile.nic"] 
                        ? 'border-red-500 focus:ring-red-500' 
                        : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500'
                    }`}
                  />
                  {errors["profile.nic"] && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors["profile.nic"]}
                    </p>
                  )}
                  {getFieldFeedback('profile.nic', formData.profile.nic, formData) && (
                    <p className={`text-xs mt-1 ${
                      getFieldFeedback('profile.nic', formData.profile.nic, formData).type === 'success' 
                        ? 'text-green-600' 
                        : 'text-red-600'
                    }`}>
                      {getFieldFeedback('profile.nic', formData.profile.nic, formData).message}
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
                    onChange={handlePhoneChange}
                    placeholder="Enter phone number (10 digits)"
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:border-transparent dark:bg-gray-700 dark:text-white ${
                      errors["profile.phoneNumber"] 
                        ? 'border-red-500 focus:ring-red-500' 
                        : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500'
                    }`}
                  />
                  {errors["profile.phoneNumber"] && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors["profile.phoneNumber"]}
                    </p>
                  )}
                  {getFieldFeedback('profile.phoneNumber', formData.profile.phoneNumber, formData) && (
                    <p className={`text-xs mt-1 ${
                      getFieldFeedback('profile.phoneNumber', formData.profile.phoneNumber, formData).type === 'success' 
                        ? 'text-green-600' 
                        : 'text-red-600'
                    }`}>
                      {getFieldFeedback('profile.phoneNumber', formData.profile.phoneNumber, formData).message}
                    </p>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Address *
                </label>
                <textarea
                  name="profile.address"
                  value={formData.profile.address}
                  onChange={handleInputChange}
                  rows={3}
                  placeholder="Enter address"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:border-transparent dark:bg-gray-700 dark:text-white ${
                    errors["profile.address"] 
                      ? 'border-red-500 focus:ring-red-500' 
                      : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500'
                  }`}
                />
                {errors["profile.address"] && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors["profile.address"]}
                  </p>
                )}
                {getFieldFeedback('profile.address', formData.profile.address, formData) && (
                  <p className={`text-xs mt-1 ${
                    getFieldFeedback('profile.address', formData.profile.address, formData).type === 'success' 
                      ? 'text-green-600' 
                      : 'text-red-600'
                  }`}>
                    {getFieldFeedback('profile.address', formData.profile.address, formData).message}
                  </p>
                )}
              </div>
              <div className="flex justify-end gap-3 pt-4">
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
                  Create HR Officer
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
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Edit HR Officer
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
            <form onSubmit={handleUpdate} className="p-6 space-y-4">
              {/* EDIT MODAL FORM */}
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
                    placeholder="Enter email"
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:border-transparent dark:bg-gray-700 dark:text-white ${
                      errors.email 
                        ? 'border-red-500 focus:ring-red-500' 
                        : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500'
                    }`}
                  />
                  {errors.email && (
                    <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    User ID
                  </label>
                  <input
                    type="text"
                    value={selectedOfficer?.userId || ""}
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
                    onChange={(e) => handleInputChange(e, 'name')}
                    onKeyDown={(e) => handleKeyPress(e, 'name')}
                    placeholder="Enter first name"
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:border-transparent dark:bg-gray-700 dark:text-white ${
                      errors["profile.firstName"] 
                        ? 'border-red-500 focus:ring-red-500' 
                        : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500'
                    }`}
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
                    onChange={(e) => handleInputChange(e, 'name')}
                    onKeyDown={(e) => handleKeyPress(e, 'name')}
                    placeholder="Enter last name"
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:border-transparent dark:bg-gray-700 dark:text-white ${
                      errors["profile.lastName"] 
                        ? 'border-red-500 focus:ring-red-500' 
                        : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500'
                    }`}
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
                    min={dateRestrictions.min}
                    max={dateRestrictions.max}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:border-transparent dark:bg-gray-700 dark:text-white ${
                      errors["profile.dateOfBirth"] 
                        ? 'border-red-500 focus:ring-red-500' 
                        : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500'
                    }`}
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
                    onChange={handleNicChange}
                    placeholder="Enter NIC (e.g., 123456789V or 199812345678)"
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:border-transparent dark:bg-gray-700 dark:text-white ${
                      errors["profile.nic"] 
                        ? 'border-red-500 focus:ring-red-500' 
                        : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500'
                    }`}
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
                    onChange={handlePhoneChange}
                    placeholder="Enter phone number (10 digits)"
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:border-transparent dark:bg-gray-700 dark:text-white ${
                      errors["profile.phoneNumber"] 
                        ? 'border-red-500 focus:ring-red-500' 
                        : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500'
                    }`}
                  />
                  {errors["profile.phoneNumber"] && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors["profile.phoneNumber"]}
                    </p>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Address *
                </label>
                <textarea
                  name="profile.address"
                  value={formData.profile.address}
                  onChange={handleInputChange}
                  rows={3}
                  placeholder="Enter address"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:border-transparent dark:bg-gray-700 dark:text-white ${
                    errors["profile.address"] 
                      ? 'border-red-500 focus:ring-red-500' 
                      : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500'
                  }`}
                />
                {errors["profile.address"] && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors["profile.address"]}
                  </p>
                )}
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
              <div className="flex justify-end gap-3 pt-4">
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
                  Update HR Officer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Modal */}
      {showViewModal && selectedOfficer && (
        <div
          className="fixed inset-0 flex items-center justify-center p-4 z-50"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.6)" }}
        >
          {" "}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                HR Officer Details
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
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
                  {selectedOfficer.profile?.firstName?.[0]}
                  {selectedOfficer.profile?.lastName?.[0]}
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {selectedOfficer.profile?.firstName}{" "}
                    {selectedOfficer.profile?.lastName}
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    HR Officer • {selectedOfficer.userId}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                        selectedOfficer.status
                      )}`}
                    >
                      {selectedOfficer.status === "active" && (
                        <CheckCircle className="w-3 h-3 mr-1" />
                      )}
                      {selectedOfficer.status === "suspended" && (
                        <AlertTriangle className="w-3 h-3 mr-1" />
                      )}
                      {(selectedOfficer.status === "inactive" ||
                        selectedOfficer.status === "terminated") && (
                        <XCircle className="w-3 h-3 mr-1" />
                      )}
                      {selectedOfficer.status.charAt(0).toUpperCase() +
                        selectedOfficer.status.slice(1)}
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
                        {selectedOfficer.email}
                      </p>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 dark:text-gray-400">
                        Phone
                      </label>
                      <p className="text-sm text-gray-900 dark:text-white">
                        {selectedOfficer.profile?.phoneNumber || "N/A"}
                      </p>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 dark:text-gray-400">
                        Date of Birth
                      </label>
                      <p className="text-sm text-gray-900 dark:text-white">
                        {formatDate(selectedOfficer.profile?.dateOfBirth)}
                      </p>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 dark:text-gray-400">
                        NIC
                      </label>
                      <p className="text-sm text-gray-900 dark:text-white">
                        {selectedOfficer.profile?.nic || "N/A"}
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
                        {selectedOfficer.userId}
                      </p>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 dark:text-gray-400">
                        Role
                      </label>
                      <p className="text-sm text-gray-900 dark:text-white">
                        HR Officer
                      </p>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 dark:text-gray-400">
                        Last Login
                      </label>
                      <p className="text-sm text-gray-900 dark:text-white">
                        {formatDate(selectedOfficer.lastLogin)}
                      </p>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 dark:text-gray-400">
                        Created
                      </label>
                      <p className="text-sm text-gray-900 dark:text-white">
                        {formatDate(selectedOfficer.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                  Address
                </h4>
                <p className="text-sm text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                  {selectedOfficer.profile?.address || "No address provided"}
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
                    openEditModal(selectedOfficer);
                  }}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2"
                >
                  <Edit className="w-4 h-4" />
                  Edit Officer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
