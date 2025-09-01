import React, { useState, useEffect } from 'react';
import {Shield, Users, FileText, MessageCircle, Zap, ArrowRight, CheckCircle, Menu, X, Bot, Bell, Database, Lock, Clock, BarChart3, Upload, Eye, Search, ChevronLeft, ChevronRight, Star, Play, Pause } from 'lucide-react';
import { FallingStar } from '../../components/garbage/FallingStar';

export const LandingPage = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [currentFeature, setCurrentFeature] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (isAutoPlaying) {
      const interval = setInterval(() => {
        setCurrentFeature(prev => (prev + 1) % 7);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [isAutoPlaying]);

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "HR Director, Janashakthi Group",
      content: "Lumiere reduced our claim processing time by 90%. What used to take weeks now happens in days.",
      rating: 5
    },
    {
      name: "Michael Chen",
      role: "Insurance Agent, SLIC",
      content: "The seamless integration with multiple providers has transformed how we handle corporate claims.",
      rating: 5
    },
    {
      name: "Priya Patel",
      role: "Employee Relations Manager",
      content: "Our employees love how simple it is to submit and track their insurance claims now.",
      rating: 5
    }
  ];

  const interactiveFeatures = [
    {
      title: "User Management",
      description: "Role-based access control with enterprise-grade security",
      icon: Users,
      demo: "Managing 10,000+ users across multiple departments"
    },
    {
      title: "Policy Management",
      description: "Comprehensive policy lifecycle management for all insurance types",
      icon: FileText,
      demo: "Active policies: Life, Medical, Vehicle coverage tracking"
    },
    {
      title: "Claims Processing",
      description: "End-to-end claim management from submission to settlement",
      icon: Clock,
      demo: "Average processing time: 3 days vs 21 days traditional"
    },
    {
      title: "Document Management",
      description: "AI-powered document classification and secure storage",
      icon: Upload,
      demo: "99.9% document accuracy with automated categorization"
    },
    {
      title: "Real-time Messaging",
      description: "Instant communication between all stakeholders",
      icon: MessageCircle,
      demo: "Live updates and notifications across the platform"
    },
    {
      title: "Analytics Dashboard",
      description: "Comprehensive insights and reporting for decision makers",
      icon: BarChart3,
      demo: "Real-time analytics on claim trends and processing efficiency"
    },
    {
      title: "AI Assistant",
      description: "24/7 intelligent support for all users",
      icon: Bot,
      demo: "Handles 80% of user queries automatically"
    }
  ];

  const stats = [
    { number: "98%", label: "Processing Time Reduction", icon: Clock },
    { number: "10K+", label: "Employees Supported", icon: Users },
    { number: "24/7", label: "AI Support Available", icon: Bot },
    { number: "99.9%", label: "System Uptime", icon: Shield }
  ];

  const securityFeatures = [
    { title: "End-to-End Encryption", desc: "All data encrypted in transit and at rest" },
    { title: "Multi-Factor Authentication", desc: "Advanced security for all user accounts" },
    { title: "Role-Based Access", desc: "Granular permissions for different user types" },
    { title: "Audit Trails", desc: "Complete logging of all system activities" },
    { title: "GDPR Compliance", desc: "Full compliance with data protection regulations" },
    { title: "Regular Security Audits", desc: "Continuous monitoring and security assessments" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-pink-50 to-red-50 text-gray-900 overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 z-0">
        <div className="absolute top-20 left-20 w-72 h-72 bg-gradient-to-r from-orange-300/20 to-pink-300/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-60 right-20 w-96 h-96 bg-gradient-to-r from-red-300/20 to-orange-300/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 left-1/2 w-80 h-80 bg-gradient-to-r from-pink-300/20 to-yellow-300/20 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      {/* Navigation */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        scrollY > 50 ? 'bg-white/90 backdrop-blur-md border-b border-gray-200/50 shadow-sm' : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-pink-500 rounded-xl flex items-center justify-center">
                <span className="text-xl font-bold text-white">L</span>
              </div>
              <span className="text-2xl font-bold tracking-tight text-gray-900">Lumiere</span>
            </div>
            
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-600 hover:text-gray-900 transition-colors">Features</a>
              <a href="#security" className="text-gray-600 hover:text-gray-900 transition-colors">Security</a>
              <a href="#testimonials" className="text-gray-600 hover:text-gray-900 transition-colors">Reviews</a>
              <a href="#contact" className="text-gray-600 hover:text-gray-900 transition-colors">Contact</a>
              <button className="bg-gradient-to-r from-orange-500 to-pink-500 text-white px-6 py-2 rounded-full font-medium hover:shadow-lg hover:shadow-pink-500/25 transition-all duration-300">
                Get Started
              </button>
            </div>

            <button 
              className="md:hidden text-gray-900"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white/95 backdrop-blur-md border-t border-gray-200/50">
            <div className="px-6 py-4 space-y-4">
              <a href="#features" className="block text-gray-600 hover:text-gray-900 transition-colors">Features</a>
              <a href="#security" className="block text-gray-600 hover:text-gray-900 transition-colors">Security</a>
              <a href="#testimonials" className="block text-gray-600 hover:text-gray-900 transition-colors">Reviews</a>
              <a href="#contact" className="block text-gray-600 hover:text-gray-900 transition-colors">Contact</a>
              <button className="w-full bg-gradient-to-r from-orange-500 to-pink-500 text-white px-6 py-2 rounded-full font-medium">
                Get Started
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 pt-32 pb-20 px-6 min-h-screen flex items-center">
        <div className="max-w-7xl mx-auto w-full">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center space-x-2 bg-white/60 backdrop-blur-sm border border-gray-200/50 rounded-full px-4 py-2 mb-8">
              <Zap className="w-4 h-4 text-orange-500" />
              <span className="text-sm text-gray-700">Revolutionizing Insurance Claims</span>
            </div>
            
            <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold mb-8 leading-none">
              <span className="bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Unified
              </span>
              <br />
              <span className="text-gray-700">Insurance</span>
              <br />
              <span className="bg-gradient-to-r from-orange-400 via-pink-500 to-red-500 bg-clip-text text-transparent">
                Claims
              </span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
              Transform your corporate insurance claim management with our intelligent platform. 
              From submission to approval, experience seamless collaboration across all stakeholders.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
              <button className="group bg-gradient-to-r from-orange-500 to-pink-500 text-white px-8 py-4 rounded-full font-medium text-lg hover:shadow-2xl hover:shadow-pink-500/25 transition-all duration-300 flex items-center space-x-2">
                <span>Start Your Journey</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="px-8 py-4 rounded-full border border-gray-300 hover:border-gray-400 text-gray-700 hover:text-gray-900 transition-all duration-300 font-medium text-lg">
                Watch Demo
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Animated Stats Carousel */}
      <section className="relative z-10 py-20 px-6 bg-gradient-to-r from-white/40 to-gray-50/40 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16">
            <span className="bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              Why Choose Lumiere?
            </span>
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center group">
                <div className="bg-white/60 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-8 hover:bg-white/80 transition-all duration-300 group-hover:scale-105 hover:border-purple-300/50 hover:shadow-lg hover:shadow-purple-100/50">
                  <stat.icon className="w-12 h-12 text-orange-500 mx-auto mb-4 group-hover:scale-110 transition-transform" />
                  <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-orange-400 via-pink-500 to-red-500 bg-clip-text text-transparent mb-4">
                    {stat.number}
                  </div>
                  <div className="text-gray-600 text-base font-medium">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Feature Showcase */}
      <section id="features" className="relative z-10 py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-bold mb-8">
              <span className="bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Powerful Features
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Experience each feature through interactive demonstrations
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-bold text-gray-900">Feature Showcase</h3>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setIsAutoPlaying(!isAutoPlaying)}
                    className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                  >
                    {isAutoPlaying ? <Pause size={16} className="text-purple-500" /> : <Play size={16} className="text-purple-500" />}
                  </button>
                </div>
              </div>

              {interactiveFeatures.map((feature, index) => (
                <div
                  key={index}
                  className={`p-6 rounded-2xl cursor-pointer transition-all duration-300 ${
                    currentFeature === index
                      ? 'bg-gradient-to-r from-pink-50 to-blue-50 border-2 border-purple-300/50'
                      : 'bg-white/60 border border-gray-200/50 hover:bg-white/80'
                  }`}
                  onClick={() => setCurrentFeature(index)}
                >
                  <div className="flex items-center space-x-4">
                    <div className={`p-3 rounded-xl ${
                      currentFeature === index
                        ? 'bg-gradient-to-r from-orange-500 to-pink-500'
                        : 'bg-gray-100'
                    }`}>
                      <feature.icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-lg font-bold text-gray-900 mb-1">{feature.title}</h4>
                      <p className="text-gray-600 text-sm">{feature.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="lg:sticky lg:top-32">
              <div className="bg-white/60 backdrop-blur-sm border border-gray-200/50 rounded-3xl p-8 min-h-[500px] flex items-center justify-center">
                <div className="text-center">
                  <div className="w-24 h-24 bg-gradient-to-r from-orange-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    {React.createElement(interactiveFeatures[currentFeature].icon, { className: "w-12 h-12 text-white" })}
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    {interactiveFeatures[currentFeature].title}
                  </h3>
                  <p className="text-gray-700 mb-6 max-w-md">
                    {interactiveFeatures[currentFeature].description}
                  </p>
                  <div className="bg-gray-900/5 rounded-xl p-4 border border-gray-200/50">
                    <p className="text-orange-500 text-sm font-mono">
                      {interactiveFeatures[currentFeature].demo}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Document Management Showcase */}
      <section className="relative z-10 py-32 px-6 bg-gradient-to-r from-white/40 to-gray-50/40 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-bold mb-8">
              <span className="bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Smart Document Management
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              AI-powered document processing that understands your insurance documents
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="bg-white/60 backdrop-blur-sm border border-gray-200/50 rounded-3xl p-8 h-full">
                <div className="mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Upload & Classification</h3>
                  <p className="text-gray-600 mb-6">
                    Drag and drop your documents. Our AI automatically categorizes them by type and extracts key information.
                  </p>
                </div>
                
                <div className="border-2 border-dashed border-gray-300 rounded-2xl p-12 text-center hover:border-purple-400/50 transition-colors cursor-pointer group">
                  <Upload className="w-12 h-12 text-gray-400 group-hover:text-purple-500 mx-auto mb-4 transition-colors" />
                  <p className="text-gray-600 group-hover:text-gray-900 transition-colors">
                    Drop your insurance documents here
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    Supports PDF, JPG, PNG, DOC formats
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <FileText className="w-6 h-6 text-green-500" />
                  <span className="text-gray-900 font-medium">Medical Bills</span>
                </div>
                <div className="text-sm text-gray-600">
                  <div className="flex justify-between mb-1">
                    <span>Processing...</span>
                    <span>95%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-gradient-to-r from-green-400 to-emerald-500 h-2 rounded-full" style={{width: '95%'}}></div>
                  </div>
                </div>
              </div>

              <div className="bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <Shield className="w-6 h-6 text-blue-500" />
                  <span className="text-gray-900 font-medium">Police Report</span>
                </div>
                <div className="text-sm text-gray-600">
                  <div className="flex justify-between mb-1">
                    <span>Validated</span>
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  </div>
                </div>
              </div>

              <div className="bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <FileText className="w-6 h-6 text-purple-500" />
                  <span className="text-gray-900 font-medium">ID Verification</span>
                </div>
                <div className="text-sm text-gray-600">
                  <div className="flex justify-between mb-1">
                    <span>Analyzing...</span>
                    <span>60%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-gradient-to-r from-purple-400 to-pink-500 h-2 rounded-full" style={{width: '60%'}}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AI Chatbot Demo */}
      <section className="relative z-10 py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-bold mb-8">
              <span className="bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                24/7 AI Assistant
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Get instant help with claims, policies, and procedures
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="bg-white/60 backdrop-blur-sm border border-gray-200/50 rounded-3xl p-8">
              <div className="flex items-center space-x-3 mb-8">
                <div className="w-8 h-8 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <span className="text-gray-900 font-semibold">Lumiere AI Assistant</span>
                <div className="flex-1"></div>
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-green-600 text-sm">Online</span>
              </div>

              <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div className="bg-gray-100 rounded-2xl rounded-tl-sm p-4 max-w-md">
                    <p className="text-gray-900 text-sm">
                      Hi! I'm your insurance claims assistant. How can I help you today?
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 justify-end">
                  <div className="bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 rounded-2xl rounded-tr-sm p-4 max-w-md">
                    <p className="text-white text-sm">
                      How do I submit a medical insurance claim?
                    </p>
                  </div>
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-gray-900 text-xs font-bold">U</span>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div className="bg-gray-100 rounded-2xl rounded-tl-sm p-4 max-w-md">
                    <p className="text-gray-900 text-sm mb-2">
                      To submit a medical claim, follow these steps:
                    </p>
                    <ol className="text-gray-700 text-xs space-y-1 list-decimal list-inside">
                      <li>Log into your Lumiere account</li>
                      <li>Click "Submit New Claim"</li>
                      <li>Select "Medical Insurance"</li>
                      <li>Upload your medical bills and receipts</li>
                      <li>Fill in the claim details</li>
                      <li>Submit for HR review</li>
                    </ol>
                    <p className="text-gray-700 text-xs mt-2">
                      Would you like me to guide you through the process?
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <input
                  type="text"
                  placeholder="Type your question here..."
                  className="flex-1 bg-gray-100 border border-gray-200 rounded-full px-4 py-3 text-gray-900 placeholder-gray-500 focus:outline-none focus:border-purple-400"
                />
                <button className="w-12 h-12 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 rounded-full flex items-center justify-center hover:shadow-lg hover:shadow-purple-500/25 transition-all">
                  <ArrowRight className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Analytics Dashboard Preview */}
      <section className="relative z-10 py-32 px-6 bg-gradient-to-r from-white/40 to-gray-50/40 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-bold mb-8">
              <span className="bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Powerful Analytics
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Make data-driven decisions with comprehensive insights
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="bg-white/60 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-gray-900 font-semibold">Claim Volume</h3>
                <BarChart3 className="w-5 h-5 text-purple-500" />
              </div>
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">This Month</span>
                  <span className="text-gray-900">1,247</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 h-2 rounded-full" style={{width: '78%'}}></div>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">vs Last Month</span>
                  <span className="text-green-600">+12%</span>
                </div>
              </div>
            </div>

            <div className="bg-white/60 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-gray-900 font-semibold">Processing Time</h3>
                <Clock className="w-5 h-5 text-blue-500" />
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent mb-2">
                  2.8 Days
                </div>
                <div className="text-gray-600 text-sm mb-4">Average Processing</div>
                <div className="text-green-600 text-sm">-65% vs Traditional</div>
              </div>
            </div>

            <div className="bg-white/60 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-gray-900 font-semibold">Approval Rate</h3>
                <CheckCircle className="w-5 h-5 text-green-500" />
              </div>
              <div className="relative w-24 h-24 mx-auto mb-4">
                <div className="absolute inset-0 rounded-full border-4 border-gray-200"></div>
                <div className="absolute inset-0 rounded-full border-4 border-green-500 border-t-transparent transform rotate-45" style={{clipPath: 'polygon(0 0, 85% 0, 85% 85%, 0 85%)'}}></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xl font-bold text-gray-900">85%</span>
                </div>
              </div>
              <div className="text-center text-sm text-gray-600">First-time approvals</div>
            </div>
          </div>
        </div>
      </section>

      {/* Security Features Grid */}
      <section id="security" className="relative z-10 py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-bold mb-8">
              <span className="bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Enterprise Security
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Built with security-first principles to protect your sensitive data
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {securityFeatures.map((feature, index) => (
              <div
                key={index}
                className="group bg-white/60 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-6 hover:bg-white/80 transition-all duration-300 hover:scale-105 hover:border-purple-300/50"
              >
                <div className="flex items-center space-x-3 mb-4">
                  <Lock className="w-6 h-6 text-purple-500" />
                  <h3 className="text-lg font-bold text-gray-900">{feature.title}</h3>
                </div>
                <p className="text-gray-600 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* User Journey Workflow */}
      <section className="relative z-10 py-32 px-6 bg-gradient-to-r from-white/40 to-gray-50/40 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-bold mb-8">
              <span className="bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Streamlined Workflow
              </span>
            </h2>
          </div>
          
          <div className="relative">
            <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-gradient-to-b from-pink-500 via-purple-500 to-blue-500 rounded-full"></div>
            
            <div className="space-y-24">
              {[
                { 
                  step: "01", 
                  title: "Employee Submission", 
                  desc: "Employees submit claims through an intuitive interface with drag-and-drop document upload",
                  icon: Upload,
                  side: "left"
                },
                { 
                  step: "02", 
                  title: "AI Processing", 
                  desc: "Our AI automatically categorizes documents and validates claim information",
                  icon: Bot,
                  side: "right"
                },
                { 
                  step: "03", 
                  title: "HR Review", 
                  desc: "HR officers receive notifications and can review claims with all necessary context",
                  icon: Eye,
                  side: "left"
                },
                { 
                  step: "04", 
                  title: "Agent Decision", 
                  desc: "Insurance agents access streamlined claim packages and make informed decisions",
                  icon: CheckCircle,
                  side: "right"
                }
              ].map((process, index) => (
                <div key={index} className={`flex items-center ${process.side === 'right' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-1/2 ${process.side === 'right' ? 'pl-12' : 'pr-12'}`}>
                    <div className="bg-white/60 backdrop-blur-sm border border-gray-200/50 rounded-3xl p-8 hover:bg-white/80 transition-all duration-300 group hover:border-purple-300/50">
                      <div className="flex items-center space-x-4 mb-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 rounded-xl flex items-center justify-center">
                          <process.icon className="w-6 h-6 text-white" />
                        </div>
                        <div className="text-4xl font-bold text-gray-300">{process.step}</div>
                      </div>
                      <h3 className="text-xl font-bold mb-4 text-gray-900 group-hover:text-purple-600 transition-colors">{process.title}</h3>
                      <p className="text-gray-600 leading-relaxed">{process.desc}</p>
                    </div>
                  </div>
                  
                  <div className="w-8 h-8 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 rounded-full border-4 border-white flex items-center justify-center relative z-10">
                    <div className="w-3 h-3 bg-white rounded-full"></div>
                  </div>
                  
                  <div className="w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Carousel */}
      <section id="testimonials" className="relative z-10 py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-bold mb-8">
              <span className="bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Client Success Stories
              </span>
            </h2>
          </div>

          <div className="relative max-w-4xl mx-auto">
            <div className="bg-white/60 backdrop-blur-sm border border-gray-200/50 rounded-3xl p-12 text-center">
              <div className="flex justify-center mb-6">
                {[...Array(testimonials[currentTestimonial].rating)].map((_, i) => (
                  <Star key={i} className="w-6 h-6 text-yellow-500 fill-current" />
                ))}
              </div>
              
              <blockquote className="text-2xl text-gray-700 mb-8 leading-relaxed">
                "{testimonials[currentTestimonial].content}"
              </blockquote>
              
              <div className="flex items-center justify-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-lg font-bold text-white">
                    {testimonials[currentTestimonial].name.charAt(0)}
                  </span>
                </div>
                <div className="text-left">
                  <div className="text-gray-900 font-semibold">{testimonials[currentTestimonial].name}</div>
                  <div className="text-gray-600 text-sm">{testimonials[currentTestimonial].role}</div>
                </div>
              </div>
            </div>

            <div className="flex justify-center items-center space-x-4 mt-8">
              <button
                onClick={() => setCurrentTestimonial(prev => prev === 0 ? testimonials.length - 1 : prev - 1)}
                className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-purple-500" />
              </button>
              
              <div className="flex space-x-2">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentTestimonial(index)}
                    className={`w-3 h-3 rounded-full transition-colors ${
                      currentTestimonial === index ? 'bg-purple-500' : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>
              
              <button
                onClick={() => setCurrentTestimonial(prev => (prev + 1) % testimonials.length)}
                className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                <ChevronRight className="w-5 h-5 text-purple-500" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="relative z-10 py-32 px-6 bg-gradient-to-r from-white/40 to-gray-50/40 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-white/60 backdrop-blur-sm border border-gray-200/50 rounded-3xl p-16 hover:border-purple-300/50 transition-all duration-300">
            <h2 className="text-5xl md:text-6xl font-bold mb-8">
              <span className="bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent">
                Ready to Transform?
              </span>
            </h2>
            <p className="text-xl text-gray-700 mb-12 max-w-2xl mx-auto">
              Join thousands of companies already using Lumiere to revolutionize their insurance claim management
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
              <button className="group bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 text-white px-12 py-4 rounded-full font-medium text-lg hover:shadow-2xl hover:shadow-purple-500/25 transition-all duration-300 flex items-center space-x-2">
                <span>Start Free Trial</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="px-12 py-4 rounded-full border border-gray-300 hover:border-gray-400 text-gray-700 hover:text-gray-900 transition-all duration-300 font-medium text-lg">
                Schedule Demo
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-gray-200 py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-pink-500 via-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                  <span className="text-lg font-bold text-white">L</span>
                </div>
                <span className="text-xl font-bold text-gray-900">Lumiere</span>
              </div>
              <p className="text-gray-600 text-sm">
                Transforming insurance claim management for the digital age.
              </p>
            </div>
            
            <div>
              <h3 className="text-gray-900 font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-gray-600 text-sm">
                <li><a href="#" className="hover:text-gray-900 transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-gray-900 transition-colors">Security</a></li>
                <li><a href="#" className="hover:text-gray-900 transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-gray-900 transition-colors">API</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-gray-900 font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-600 text-sm">
                <li><a href="#" className="hover:text-gray-900 transition-colors">About</a></li>
                <li><a href="#" className="hover:text-gray-900 transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-gray-900 transition-colors">Press</a></li>
                <li><a href="#" className="hover:text-gray-900 transition-colors">Contact</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-gray-900 font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-600 text-sm">
                <li><a href="#" className="hover:text-gray-900 transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-gray-900 transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-gray-900 transition-colors">Status</a></li>
                <li><a href="#" className="hover:text-gray-900 transition-colors">Community</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-200 pt-8 flex flex-col md:flex-row items-center justify-between">
            <div className="text-gray-600 text-sm mb-4 md:mb-0">
              © 2025 Lumiere. All rights reserved.
            </div>
            <div className="flex space-x-6 text-gray-600 text-sm">
              <a href="#" className="hover:text-gray-900 transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-gray-900 transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-gray-900 transition-colors">Cookie Policy</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

