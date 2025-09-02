import { useState } from "react";
import { Eye, EyeOff, User, Lock, Mail, Phone, MapPin, Calendar, Building, CreditCard, UserPlus } from "lucide-react";

const UserAuthApp = () => {
  const [currentView, setCurrentView] = useState("login");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  // Mock users for testing (matching your backend structure)
  const mockUsers = [
    {
      email: "admin@company.com",
      password: "admin123",
      role: "admin",
      profile: { firstName: "Admin", lastName: "User" }
    },
    {
      email: "hr@company.com", 
      password: "hr123",
      role: "hr_officer",
      profile: { firstName: "HR", lastName: "Officer" }
    },
    {
      email: "employee@company.com",
      password: "emp123", 
      role: "employee",
      profile: { firstName: "John", lastName: "Employee" }
    },
    {
      email: "agent@insurance.com",
      password: "agent123",
      role: "insurance_agent", 
      profile: { firstName: "Insurance", lastName: "Agent" }
    }
  ];

  const LoginForm = () => {
    const [formData, setFormData] = useState({
      email: "",
      password: ""
    });
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);

    const handleInputChange = (e) => {
      const { name, value } = e.target;
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
      // Clear error when user starts typing
      if (errors[name]) {
        setErrors(prev => ({
          ...prev,
          [name]: ""
        }));
      }
    };

    const validateForm = () => {
      const newErrors = {};
      
      if (!formData.email) {
        newErrors.email = "Email is required";
      } else if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(formData.email)) {
        newErrors.email = "Please enter a valid email";
      }
      
      if (!formData.password) {
        newErrors.password = "Password is required";
      }
      
      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
      e.preventDefault();
      
      if (!validateForm()) return;
      
      setIsLoading(true);
      
      // Simulate API call delay
      setTimeout(() => {
        const foundUser = mockUsers.find(
          u => u.email === formData.email && u.password === formData.password
        );
        
        if (foundUser) {
          setUser(foundUser);
          setIsAuthenticated(true);
          setErrors({});
        } else {
          setErrors({ general: "Invalid email or password" });
        }
        setIsLoading(false);
      }, 1000);
    };

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-4">
              <User className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">Welcome Back</h2>
            <p className="text-blue-200">Sign in to your account</p>
          </div>

          {errors.general && (
            <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 mb-6 text-red-200 text-center">
              {errors.general}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-blue-200 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-blue-300" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Enter your email"
                />
              </div>
              {errors.email && <p className="text-red-400 text-sm mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-blue-200 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-blue-300" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-12 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-300 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && <p className="text-red-400 text-sm mt-1">{errors.password}</p>}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-transparent transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Signing In..." : "Sign In"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-blue-200">
              Don't have an account?{" "}
              <button
                onClick={() => setCurrentView("register")}
                className="text-blue-400 hover:text-blue-300 font-semibold transition-colors"
              >
                Sign up
              </button>
            </p>
          </div>

          <div className="mt-8 p-4 bg-black/20 rounded-lg">
            <p className="text-xs text-blue-200 mb-2 font-semibold">Test Accounts:</p>
            <div className="grid grid-cols-2 gap-2 text-xs text-blue-300">
              <div>Admin: admin@company.com</div>
              <div>HR: hr@company.com</div>
              <div>Employee: employee@company.com</div>
              <div>Agent: agent@insurance.com</div>
            </div>
            <p className="text-xs text-blue-300 mt-2">All passwords: admin123, hr123, emp123, agent123</p>
          </div>
        </div>
      </div>
    );
  };

  const RegisterForm = () => {
    const [formData, setFormData] = useState({
      email: "",
      password: "",
      confirmPassword: "",
      role: "employee",
      profile: {
        firstName: "",
        lastName: "",
        dateOfBirth: "",
        nic: "",
        phoneNumber: "",
        address: ""
      },
      employment: {
        department: "",
        designation: "",
        employmentType: "permanent",
        joinDate: "",
        salary: ""
      },
      bankDetails: {
        accountHolderName: "",
        bankName: "",
        branchName: "",
        accountNumber: ""
      },
      insuranceProvider: {
        companyName: "",
        agentId: "",
        licenseNumber: "",
        contactEmail: "",
        contactPhone: ""
      }
    });
    
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);

    const handleInputChange = (e) => {
      const { name, value, dataset } = e.target;
      const section = dataset.section;
      
      let processedValue = value;
      
      // Name validation - only allow letters and spaces
      if (name === "firstName" || name === "lastName" || name === "accountHolderName") {
        processedValue = value.replace(/[^a-zA-Z\s]/g, "");
      }
      
      // Phone number formatting
      if (name === "phoneNumber" || name === "contactPhone") {
        processedValue = value.replace(/[^\d+]/g, "");
      }
      
      // NIC formatting
      if (name === "nic") {
        processedValue = value.replace(/[^\dVvXx]/g, "").toUpperCase();
      }
      
      // Account number - only digits
      if (name === "accountNumber") {
        processedValue = value.replace(/[^\d]/g, "");
      }

      if (section) {
        setFormData(prev => ({
          ...prev,
          [section]: {
            ...prev[section],
            [name]: processedValue
          }
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          [name]: processedValue
        }));
      }
      
      // Clear errors when user types
      if (errors[name] || errors[`${section}.${name}`]) {
        const errorKey = section ? `${section}.${name}` : name;
        setErrors(prev => ({
          ...prev,
          [errorKey]: ""
        }));
      }
    };

    const validateForm = () => {
      const newErrors = {};
      
      // Basic validation
      if (!formData.email) newErrors.email = "Email is required";
      else if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(formData.email)) {
        newErrors.email = "Please enter a valid email";
      }
      
      if (!formData.password) newErrors.password = "Password is required";
      else if (formData.password.length < 8) newErrors.password = "Password must be at least 8 characters";
      
      if (!formData.confirmPassword) newErrors.confirmPassword = "Please confirm password";
      else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match";
      }
      
      // Profile validation
      if (!formData.profile.firstName) newErrors["profile.firstName"] = "First name is required";
      if (!formData.profile.lastName) newErrors["profile.lastName"] = "Last name is required";
      if (!formData.profile.dateOfBirth) newErrors["profile.dateOfBirth"] = "Date of birth is required";
      if (!formData.profile.nic) newErrors["profile.nic"] = "NIC is required";
      else if (!/^([0-9]{9}[vVxX]|[0-9]{12})$/.test(formData.profile.nic)) {
        newErrors["profile.nic"] = "Invalid NIC format";
      }
      if (!formData.profile.phoneNumber) newErrors["profile.phoneNumber"] = "Phone number is required";
      if (!formData.profile.address) newErrors["profile.address"] = "Address is required";
      
      // Role-specific validation
      if (formData.role === "employee") {
        if (!formData.employment.department) newErrors["employment.department"] = "Department is required";
        if (!formData.employment.designation) newErrors["employment.designation"] = "Designation is required";
        if (!formData.employment.joinDate) newErrors["employment.joinDate"] = "Join date is required";
        if (!formData.employment.salary) newErrors["employment.salary"] = "Salary is required";
        if (!formData.bankDetails.accountHolderName) newErrors["bankDetails.accountHolderName"] = "Account holder name is required";
        if (!formData.bankDetails.bankName) newErrors["bankDetails.bankName"] = "Bank name is required";
        if (!formData.bankDetails.branchName) newErrors["bankDetails.branchName"] = "Branch name is required";
        if (!formData.bankDetails.accountNumber) newErrors["bankDetails.accountNumber"] = "Account number is required";
      }
      
      if (formData.role === "insurance_agent") {
        if (!formData.insuranceProvider.companyName) newErrors["insuranceProvider.companyName"] = "Company name is required";
        if (!formData.insuranceProvider.agentId) newErrors["insuranceProvider.agentId"] = "Agent ID is required";
        if (!formData.insuranceProvider.licenseNumber) newErrors["insuranceProvider.licenseNumber"] = "License number is required";
        if (!formData.insuranceProvider.contactEmail) newErrors["insuranceProvider.contactEmail"] = "Contact email is required";
        if (!formData.insuranceProvider.contactPhone) newErrors["insuranceProvider.contactPhone"] = "Contact phone is required";
      }
      
      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
      e.preventDefault();
      
      if (!validateForm()) return;
      
      setIsLoading(true);
      
      // Simulate API call
      setTimeout(() => {
        // Check if email already exists
        const existingUser = mockUsers.find(u => u.email === formData.email);
        if (existingUser) {
          setErrors({ email: "User with this email already exists" });
        } else {
          alert("Registration successful! Please login with your credentials.");
          setCurrentView("login");
        }
        setIsLoading(false);
      }, 1500);
    };

    return (
      <div className="min-h-screen bg-gradient-to-br from-green-900 via-teal-900 to-blue-900 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 p-8">
            <div className="text-center mb-8">
              <div className="mx-auto w-16 h-16 bg-gradient-to-r from-green-500 to-teal-600 rounded-full flex items-center justify-center mb-4">
                <UserPlus className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-2">Create Account</h2>
              <p className="text-green-200">Join our platform today</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-green-200 mb-2">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-300" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-green-200 focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Enter email"
                    />
                  </div>
                  {errors.email && <p className="text-red-400 text-sm mt-1">{errors.email}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-green-200 mb-2">Role</label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="employee" className="bg-gray-800">Employee</option>
                    <option value="hr_officer" className="bg-gray-800">HR Officer</option>
                    <option value="insurance_agent" className="bg-gray-800">Insurance Agent</option>
                    <option value="admin" className="bg-gray-800">Admin</option>
                  </select>
                </div>
              </div>

              {/* Password Fields */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-green-200 mb-2">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-300" />
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-12 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-green-200 focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Enter password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-300 hover:text-white"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {errors.password && <p className="text-red-400 text-sm mt-1">{errors.password}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-green-200 mb-2">Confirm Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-300" />
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-12 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-green-200 focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Confirm password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-300 hover:text-white"
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {errors.confirmPassword && <p className="text-red-400 text-sm mt-1">{errors.confirmPassword}</p>}
                </div>
              </div>

              {/* Personal Information */}
              <div className="bg-white/5 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Personal Information</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-green-200 mb-2">First Name</label>
                    <input
                      type="text"
                      name="firstName"
                      data-section="profile"
                      value={formData.profile.firstName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-green-200 focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Enter first name"
                    />
                    {errors["profile.firstName"] && <p className="text-red-400 text-sm mt-1">{errors["profile.firstName"]}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-green-200 mb-2">Last Name</label>
                    <input
                      type="text"
                      name="lastName"
                      data-section="profile"
                      value={formData.profile.lastName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-green-200 focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Enter last name"
                    />
                    {errors["profile.lastName"] && <p className="text-red-400 text-sm mt-1">{errors["profile.lastName"]}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-green-200 mb-2">Date of Birth</label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-300" />
                      <input
                        type="date"
                        name="dateOfBirth"
                        data-section="profile"
                        value={formData.profile.dateOfBirth}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                    {errors["profile.dateOfBirth"] && <p className="text-red-400 text-sm mt-1">{errors["profile.dateOfBirth"]}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-green-200 mb-2">NIC Number</label>
                    <input
                      type="text"
                      name="nic"
                      data-section="profile"
                      value={formData.profile.nic}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-green-200 focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="123456789V or 123456789012"
                    />
                    {errors["profile.nic"] && <p className="text-red-400 text-sm mt-1">{errors["profile.nic"]}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-green-200 mb-2">Phone Number</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-300" />
                      <input
                        type="text"
                        name="phoneNumber"
                        data-section="profile"
                        value={formData.profile.phoneNumber}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-green-200 focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="0771234567"
                      />
                    </div>
                    {errors["profile.phoneNumber"] && <p className="text-red-400 text-sm mt-1">{errors["profile.phoneNumber"]}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-green-200 mb-2">Address</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 w-5 h-5 text-green-300" />
                      <textarea
                        name="address"
                        data-section="profile"
                        value={formData.profile.address}
                        onChange={handleInputChange}
                        rows="3"
                        className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-green-200 focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                        placeholder="Enter address"
                      />
                    </div>
                    {errors["profile.address"] && <p className="text-red-400 text-sm mt-1">{errors["profile.address"]}</p>}
                  </div>
                </div>
              </div>

              {/* Employment Information - Only for employees */}
              {formData.role === "employee" && (
                <>
                  <div className="bg-white/5 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Employment Information</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-green-200 mb-2">Department</label>
                        <div className="relative">
                          <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-300" />
                          <input
                            type="text"
                            name="department"
                            data-section="employment"
                            value={formData.employment.department}
                            onChange={handleInputChange}
                            className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-green-200 focus:outline-none focus:ring-2 focus:ring-green-500"
                            placeholder="IT Department"
                          />
                        </div>
                        {errors["employment.department"] && <p className="text-red-400 text-sm mt-1">{errors["employment.department"]}</p>}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-green-200 mb-2">Designation</label>
                        <input
                          type="text"
                          name="designation"
                          data-section="employment"
                          value={formData.employment.designation}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-green-200 focus:outline-none focus:ring-2 focus:ring-green-500"
                          placeholder="Software Engineer"
                        />
                        {errors["employment.designation"] && <p className="text-red-400 text-sm mt-1">{errors["employment.designation"]}</p>}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-green-200 mb-2">Employment Type</label>
                        <select
                          name="employmentType"
                          data-section="employment"
                          value={formData.employment.employmentType}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                        >
                          <option value="permanent" className="bg-gray-800">Permanent</option>
                          <option value="contract" className="bg-gray-800">Contract</option>
                          <option value="probation" className="bg-gray-800">Probation</option>
                          <option value="executive" className="bg-gray-800">Executive</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-green-200 mb-2">Join Date</label>
                        <input
                          type="date"
                          name="joinDate"
                          data-section="employment"
                          value={formData.employment.joinDate}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                        {errors["employment.joinDate"] && <p className="text-red-400 text-sm mt-1">{errors["employment.joinDate"]}</p>}
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-green-200 mb-2">Salary</label>
                        <input
                          type="number"
                          name="salary"
                          data-section="employment"
                          value={formData.employment.salary}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-green-200 focus:outline-none focus:ring-2 focus:ring-green-500"
                          placeholder="Enter salary"
                          min="0"
                        />
                        {errors["employment.salary"] && <p className="text-red-400 text-sm mt-1">{errors["employment.salary"]}</p>}
                      </div>
                    </div>
                  </div>

                  {/* Bank Details */}
                  <div className="bg-white/5 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Bank Details</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-green-200 mb-2">Account Holder Name</label>
                        <input
                          type="text"
                          name="accountHolderName"
                          data-section="bankDetails"
                          value={formData.bankDetails.accountHolderName}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-green-200 focus:outline-none focus:ring-2 focus:ring-green-500"
                          placeholder="Enter account holder name"
                        />
                        {errors["bankDetails.accountHolderName"] && <p className="text-red-400 text-sm mt-1">{errors["bankDetails.accountHolderName"]}</p>}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-green-200 mb-2">Bank Name</label>
                        <input
                          type="text"
                          name="bankName"
                          data-section="bankDetails"
                          value={formData.bankDetails.bankName}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-green-200 focus:outline-none focus:ring-2 focus:ring-green-500"
                          placeholder="Enter bank name"
                        />
                        {errors["bankDetails.bankName"] && <p className="text-red-400 text-sm mt-1">{errors["bankDetails.bankName"]}</p>}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-green-200 mb-2">Branch Name</label>
                        <input
                          type="text"
                          name="branchName"
                          data-section="bankDetails"
                          value={formData.bankDetails.branchName}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-green-200 focus:outline-none focus:ring-2 focus:ring-green-500"
                          placeholder="Enter branch name"
                        />
                        {errors["bankDetails.branchName"] && <p className="text-red-400 text-sm mt-1">{errors["bankDetails.branchName"]}</p>}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-green-200 mb-2">Account Number</label>
                        <div className="relative">
                          <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-300" />
                          <input
                            type="text"
                            name="accountNumber"
                            data-section="bankDetails"
                            value={formData.bankDetails.accountNumber}
                            onChange={handleInputChange}
                            className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-green-200 focus:outline-none focus:ring-2 focus:ring-green-500"
                            placeholder="Enter account number"
                          />
                        </div>
                        {errors["bankDetails.accountNumber"] && <p className="text-red-400 text-sm mt-1">{errors["bankDetails.accountNumber"]}</p>}
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Insurance Provider Information - Only for insurance agents */}
              {formData.role === "insurance_agent" && (
                <div className="bg-white/5 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Insurance Provider Details</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-green-200 mb-2">Company Name</label>
                      <input
                        type="text"
                        name="companyName"
                        data-section="insuranceProvider"
                        value={formData.insuranceProvider.companyName}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-green-200 focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="Enter company name"
                      />
                      {errors["insuranceProvider.companyName"] && <p className="text-red-400 text-sm mt-1">{errors["insuranceProvider.companyName"]}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-green-200 mb-2">Agent ID</label>
                      <input
                        type="text"
                        name="agentId"
                        data-section="insuranceProvider"
                        value={formData.insuranceProvider.agentId}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-green-200 focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="Enter agent ID"
                      />
                      {errors["insuranceProvider.agentId"] && <p className="text-red-400 text-sm mt-1">{errors["insuranceProvider.agentId"]}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-green-200 mb-2">License Number</label>
                      <input
                        type="text"
                        name="licenseNumber"
                        data-section="insuranceProvider"
                        value={formData.insuranceProvider.licenseNumber}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-green-200 focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="Enter license number"
                      />
                      {errors["insuranceProvider.licenseNumber"] && <p className="text-red-400 text-sm mt-1">{errors["insuranceProvider.licenseNumber"]}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-green-200 mb-2">Contact Email</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-300" />
                        <input
                          type="email"
                          name="contactEmail"
                          data-section="insuranceProvider"
                          value={formData.insuranceProvider.contactEmail}
                          onChange={handleInputChange}
                          className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-green-200 focus:outline-none focus:ring-2 focus:ring-green-500"
                          placeholder="agent@insurance.com"
                        />
                      </div>
                      {errors["insuranceProvider.contactEmail"] && <p className="text-red-400 text-sm mt-1">{errors["insuranceProvider.contactEmail"]}</p>}
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-green-200 mb-2">Contact Phone</label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-300" />
                        <input
                          type="text"
                          name="contactPhone"
                          data-section="insuranceProvider"
                          value={formData.insuranceProvider.contactPhone}
                          onChange={handleInputChange}
                          className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-green-200 focus:outline-none focus:ring-2 focus:ring-green-500"
                          placeholder="0771234567"
                        />
                      </div>
                      {errors["insuranceProvider.contactPhone"] && <p className="text-red-400 text-sm mt-1">{errors["insuranceProvider.contactPhone"]}</p>}
                    </div>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-green-600 to-teal-600 text-white py-3 rounded-lg font-semibold hover:from-green-700 hover:to-teal-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-transparent transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Creating Account..." : "Create Account"}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-green-200">
                Already have an account?{" "}
                <button
                  onClick={() => setCurrentView("login")}
                  className="text-green-400 hover:text-green-300 font-semibold transition-colors"
                >
                  Sign in
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const Dashboard = () => {
    const handleLogout = () => {
      setIsAuthenticated(false);
      setUser(null);
      setCurrentView("login");
    };

    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
        <nav className="bg-white/10 backdrop-blur-lg border-b border-white/20 p-6">
          <div className="max-w-6xl mx-auto flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">
                  Welcome, {user.profile.firstName} {user.profile.lastName}
                </h1>
                <p className="text-indigo-200 capitalize">{user.role.replace('_', ' ')}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Logout
            </button>
          </div>
        </nav>

        <div className="max-w-6xl mx-auto p-6">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 p-8">
            <h2 className="text-2xl font-bold text-white mb-6">Dashboard</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white/10 rounded-lg p-6 border border-white/20">
                <h3 className="text-lg font-semibold text-white mb-2">Profile</h3>
                <p className="text-indigo-200">Manage your personal information</p>
              </div>
              
              {user.role === "employee" && (
                <>
                  <div className="bg-white/10 rounded-lg p-6 border border-white/20">
                    <h3 className="text-lg font-semibold text-white mb-2">Employment</h3>
                    <p className="text-indigo-200">View employment details</p>
                  </div>
                  <div className="bg-white/10 rounded-lg p-6 border border-white/20">
                    <h3 className="text-lg font-semibold text-white mb-2">Benefits</h3>
                    <p className="text-indigo-200">Access employee benefits</p>
                  </div>
                </>
              )}
              
              {(user.role === "admin" || user.role === "hr_officer") && (
                <>
                  <div className="bg-white/10 rounded-lg p-6 border border-white/20">
                    <h3 className="text-lg font-semibold text-white mb-2">User Management</h3>
                    <p className="text-indigo-200">Manage system users</p>
                  </div>
                  <div className="bg-white/10 rounded-lg p-6 border border-white/20">
                    <h3 className="text-lg font-semibold text-white mb-2">Reports</h3>
                    <p className="text-indigo-200">View system reports</p>
                  </div>
                </>
              )}
              
              {user.role === "insurance_agent" && (
                <>
                  <div className="bg-white/10 rounded-lg p-6 border border-white/20">
                    <h3 className="text-lg font-semibold text-white mb-2">Claims</h3>
                    <p className="text-indigo-200">Manage insurance claims</p>
                  </div>
                  <div className="bg-white/10 rounded-lg p-6 border border-white/20">
                    <h3 className="text-lg font-semibold text-white mb-2">Policies</h3>
                    <p className="text-indigo-200">View and manage policies</p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const LoginComponent = () => {
    return <LoginForm />;
  };

  const RegisterComponent = () => {
    return <RegisterForm />;
  };

  // Main render logic
  if (isAuthenticated && user) {
    return <Dashboard />;
  }

  if (currentView === "login") {
    return <LoginComponent />;
  }

  if (currentView === "register") {
    return <RegisterComponent />;
  }

  return <LoginComponent />;
};

export default UserAuthApp;