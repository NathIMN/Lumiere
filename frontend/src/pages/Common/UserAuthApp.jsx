import { useState } from "react";
import { Eye, EyeOff, User, Lock, Mail, ArrowRight, Shield } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

const UserAuthApp = () => {
   const { login, error, isLoading, clearError } = useAuth();
   const navigate = useNavigate();

   const LoginForm = () => {
      const [formData, setFormData] = useState({
         email: "",
         password: ""
      });
      const [showPassword, setShowPassword] = useState(false);
      const [validationErrors, setValidationErrors] = useState({});
      const [focusedField, setFocusedField] = useState("");

      const handleInputChange = (e) => {
         const { name, value } = e.target;
         setFormData(prev => ({
            ...prev,
            [name]: value
         }));

         if (validationErrors[name]) {
            setValidationErrors(prev => ({
               ...prev,
               [name]: ""
            }));
         }

         if (error) {
            clearError();
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

         setValidationErrors(newErrors);
         return Object.keys(newErrors).length === 0;
      };

      const handleSubmit = async (e) => {
         e.preventDefault();

         if (!validateForm()) return;

         const result = await login(formData.email, formData.password);

         if (result.success) {
            const userRole = result.user.role;
            switch (userRole) {
               case 'admin':
                  navigate('/admin');
                  break;
               case 'hr_officer':
                  navigate('/hr');
                  break;
               case 'employee':
                  navigate('/employee');
                  break;
               case 'insurance_agent':
                  navigate('/agent');
                  break;
               default:
                  navigate('/');
            }
         }
      };

      return (
         <div className="min-h-screen bg-slate-50 flex">
            {/* Left Panel - Branding */}
            <div className="hidden lg:flex lg:w-1/2 bg-[#151E3D] relative overflow-hidden">
               {/* Decorative Elements */}
               <div className="absolute top-20 left-20 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
               <div className="absolute bottom-40 right-16 w-40 h-40 bg-white/5 rounded-full blur-2xl"></div>
               <div className="absolute top-1/2 left-1/3 w-20 h-20 bg-white/15 rounded-full blur-lg"></div>

               <div className="relative z-10 flex flex-col justify-center items-start p-16 text-white w-full">
                  <div className="mb-8">
                     <div className="flex items-center mb-6">
                        <img
                           src="/lum2.png"
                           alt="Lumiere Logo"
                           className={`h-48 w-auto `}
                        />
                     </div>
                     <h1 className="text-4xl font-bold mb-6 leading-tight">
                        Secure Access to<br />
                        Your Workspace
                     </h1>
                     <p className="text-lg text-red-100 leading-relaxed max-w-md">
                        Streamlined authentication for modern teams. Access your dashboard with enterprise-grade security.
                     </p>
                  </div>

                  <div className="space-y-4 mt-8">
                     <div className="flex items-center text-red-100">
                        <div className="w-2 h-2 bg-white rounded-full mr-3"></div>
                        <span>Multi-role access management</span>
                     </div>
                     <div className="flex items-center text-red-100">
                        <div className="w-2 h-2 bg-white rounded-full mr-3"></div>
                        <span>Enterprise security standards</span>
                     </div>
                     <div className="flex items-center text-red-100">
                        <div className="w-2 h-2 bg-white rounded-full mr-3"></div>
                        <span>Real-time dashboard access</span>
                     </div>
                  </div>
               </div>
            </div>

            {/* Right Panel - Login Form */}
            <div className="flex-1 flex items-center justify-center p-8 lg:p-16">
               <div className="w-full max-w-md">
                  {/* Mobile Logo */}
                  <div className="lg:hidden flex items-center justify-center mb-8">
                     <Shield className="w-8 h-8 mr-3 text-red-900" />
                     <span className="text-2xl font-bold text-slate-800">Lumiere</span>
                  </div>

                  <div className="mb-8">
                     <h2 className="text-3xl font-bold text-slate-800 mb-2">Welcome back</h2>
                     <p className="text-slate-600">Please sign in to your account</p>
                  </div>

                  {error && (
                     <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
                        <p className="text-red-700 text-sm">{error}</p>
                     </div>
                  )}

                  <div className="space-y-6">
                     <div className="space-y-4">
                        <div>
                           <label className="block text-sm font-semibold text-slate-700 mb-2">
                              Email Address
                           </label>
                           <div className="relative group">
                              <Mail className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors ${focusedField === 'email' ? 'text-blue-600' : 'text-slate-400'
                                 }`} />
                              <input
                                 type="email"
                                 name="email"
                                 value={formData.email}
                                 onChange={handleInputChange}
                                 onFocus={() => setFocusedField('email')}
                                 onBlur={() => setFocusedField('')}
                                 className={`w-full pl-10 pr-4 py-3 border-2 rounded-lg bg-white text-slate-800 placeholder-slate-400 transition-all duration-200 ${validationErrors.email
                                       ? 'border-red-400 focus:border-red-500 focus:ring-red-500/10'
                                       : focusedField === 'email'
                                          ? 'border-blue-600 focus:ring-blue-600/10'
                                          : 'border-slate-200 hover:border-slate-300 focus:border-blue-600 focus:ring-blue-600/10'
                                    } focus:outline-none focus:ring-4`}
                                 placeholder="Enter your email address"
                                 disabled={isLoading}
                              />
                           </div>
                           {validationErrors.email && (
                              <p className="text-red-600 text-sm mt-1 flex items-center">
                                 <span className="w-1 h-1 bg-red-600 rounded-full mr-2"></span>
                                 {validationErrors.email}
                              </p>
                           )}
                        </div>

                        <div>
                           <label className="block text-sm font-semibold text-slate-700 mb-2">
                              Password
                           </label>
                           <div className="relative group">
                              <Lock className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors ${focusedField === 'password' ? 'text-blue-600' : 'text-slate-400'
                                 }`} />
                              <input
                                 type={showPassword ? "text" : "password"}
                                 name="password"
                                 value={formData.password}
                                 onChange={handleInputChange}
                                 onFocus={() => setFocusedField('password')}
                                 onBlur={() => setFocusedField('')}
                                 className={`w-full pl-10 pr-12 py-3 border-2 rounded-lg bg-white text-slate-800 placeholder-slate-400 transition-all duration-200 ${validationErrors.password
                                       ? 'border-red-400 focus:border-red-500 focus:ring-red-500/10'
                                       : focusedField === 'password'
                                          ? 'border-blue-600 focus:ring-blue-600/10'
                                          : 'border-slate-200 hover:border-slate-300 focus:border-blue-600 focus:ring-blue-600/10'
                                    } focus:outline-none focus:ring-4`}
                                 placeholder="Enter your password"
                                 disabled={isLoading}
                              />
                              <button
                                 type="button"
                                 onClick={() => setShowPassword(!showPassword)}
                                 className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-blue-600 transition-colors"
                                 disabled={isLoading}
                              >
                                 {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                              </button>
                           </div>
                           {validationErrors.password && (
                              <p className="text-red-600 text-sm mt-1 flex items-center">
                                 <span className="w-1 h-1 bg-red-600 rounded-full mr-2"></span>
                                 {validationErrors.password}
                              </p>
                           )}
                        </div>
                     </div>

                     <button
                        onClick={handleSubmit}
                        disabled={isLoading}
                        className="group w-full bg-red-900 hover:bg-red-800 text-white py-3 px-4 rounded-lg font-semibold transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-red-900/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center relative overflow-hidden"
                     >
                        {isLoading ? (
                           <>
                              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-3"></div>
                              Signing you in...
                           </>
                        ) : (
                           <>
                              <span>Sign In</span>
                              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-200" />
                           </>
                        )}
                     </button>
                  </div>

                  <div className="mt-8 text-center">
                     <p className="text-slate-600 text-sm">
                        Need help? Contact{" "}
                        <button className="text-blue-600 hover:text-blue-700 font-medium transition-colors">
                           support
                        </button>
                     </p>
                  </div>
               </div>
            </div>
         </div>
      );
   };

   return <LoginForm />;
};

export default UserAuthApp;