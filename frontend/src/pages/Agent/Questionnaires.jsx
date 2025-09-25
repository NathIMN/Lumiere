import { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  Copy,
  ToggleLeft,
  ToggleRight,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  AlertTriangle,
  Users,
  BarChart3,
  Settings,
  Download,
  Upload,
  Zap,
  Target,
  Activity,
  RefreshCw
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Questionnaires = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('templates');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterClaimType, setFilterClaimType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [templates, setTemplates] = useState([]);
  const [coverage, setCoverage] = useState([]);
  const [coverageStats, setCoverageStats] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  // Valid combinations from your model
  const VALID_COMBINATIONS = {
    life: ["hospitalization", "channelling", "medication", "death"],
    vehicle: ["accident", "theft", "fire", "naturalDisaster"]
  };

  // Mock data that matches your API structure
  const [mockData] = useState({
    templates: [
      {
        _id: "66f1234567890abcdef12345",
        templateId: "LIFE_HOSP",
        claimType: "life",
        claimOption: "hospitalization",
        title: "Life Insurance - Hospitalization Claims",
        description: "Questionnaire for hospitalization-related life insurance claims",
        questions: [
          {
            questionId: "hosp_001",
            questionText: "What is the admission date?",
            questionType: "date",
            isRequired: true,
            order: 1,
            helpText: "Please provide the exact date of hospital admission"
          },
          {
            questionId: "hosp_002",
            questionText: "Type of treatment received",
            questionType: "select",
            options: ["Surgery", "Medication", "Therapy", "Emergency Care"],
            isRequired: true,
            order: 2
          },
          {
            questionId: "hosp_003",
            questionText: "Upload medical reports",
            questionType: "file",
            isRequired: true,
            order: 3,
            helpText: "Upload all relevant medical documents and reports"
          }
        ],
        isActive: true,
        version: 1,
        lastModified: "2025-01-15T10:30:00Z",
        modifiedBy: {
          firstName: "John",
          lastName: "Smith",
          email: "john.smith@company.com"
        }
      },
      {
        _id: "66f1234567890abcdef12346",
        templateId: "VEHICLE_ACC",
        claimType: "vehicle",
        claimOption: "accident",
        title: "Vehicle Insurance - Accident Claims",
        description: "Questionnaire for vehicle accident insurance claims",
        questions: [
          {
            questionId: "acc_001",
            questionText: "Date and time of accident",
            questionType: "date",
            isRequired: true,
            order: 1
          },
          {
            questionId: "acc_002",
            questionText: "Was police report filed?",
            questionType: "boolean",
            isRequired: true,
            order: 2
          }
        ],
        isActive: true,
        version: 2,
        lastModified: "2025-01-14T15:45:00Z",
        modifiedBy: {
          firstName: "Sarah",
          lastName: "Wilson",
          email: "sarah.wilson@company.com"
        }
      },
      {
        _id: "66f1234567890abcdef12347",
        templateId: "LIFE_DEATH",
        claimType: "life",
        claimOption: "death",
        title: "Life Insurance - Death Claims",
        description: "Questionnaire for death benefit claims",
        questions: [
          {
            questionId: "death_001",
            questionText: "Date of death",
            questionType: "date",
            isRequired: true,
            order: 1
          }
        ],
        isActive: false,
        version: 1,
        lastModified: "2025-01-12T09:20:00Z",
        modifiedBy: {
          firstName: "Mike",
          lastName: "Johnson",
          email: "mike.johnson@company.com"
        }
      }
    ],
    coverageStats: {
      total: 8,
      covered: 3,
      missing: 5
    }
  });

  // Initialize data
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      // In real app, fetch from API
      // const response = await fetch('/api/questionnaire-templates');
      // const data = await response.json();
      
      setTemplates(mockData.templates);
      setCoverageStats(mockData.coverageStats);
      generateCoverageData();
    } catch (error) {
      console.error('Failed to load templates:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateCoverageData = () => {
    const coverageData = [];
    Object.keys(VALID_COMBINATIONS).forEach(type => {
      VALID_COMBINATIONS[type].forEach(option => {
        const existing = mockData.templates.find(t => 
          t.claimType === type && t.claimOption === option
        );
        coverageData.push({
          claimType: type,
          claimOption: option,
          hasTemplate: !!existing,
          template: existing || null
        });
      });
    });
    setCoverage(coverageData);
  };

  // Filter templates
  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.templateId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterClaimType === 'all' || template.claimType === filterClaimType;
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'active' && template.isActive) ||
                         (filterStatus === 'inactive' && !template.isActive);
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const handleCreateTemplate = () => {
    navigate('/agent/questionnaires/create');
  };

  const handleEditTemplate = (templateId) => {
    navigate(`/agent/questionnaires/edit/${templateId}`);
  };

  const handlePreviewTemplate = (template) => {
    setSelectedTemplate(template);
    setShowPreviewModal(true);
  };

  const handleToggleStatus = async (templateId) => {
    try {
      // In real app: await toggleTemplateStatus(templateId)
      setTemplates(prev => prev.map(t => 
        t._id === templateId ? { ...t, isActive: !t.isActive } : t
      ));
    } catch (error) {
      console.error('Failed to toggle status:', error);
    }
  };

  const handleDeleteTemplate = async (templateId) => {
    if (!confirm('Are you sure you want to delete this template?')) return;
    
    try {
      // In real app: await deleteTemplate(templateId)
      setTemplates(prev => prev.filter(t => t._id !== templateId));
    } catch (error) {
      console.error('Failed to delete template:', error);
    }
  };

  const handleCloneTemplate = async (templateId) => {
    try {
      // In real app: await cloneTemplate(templateId)
      const original = templates.find(t => t._id === templateId);
      const cloned = {
        ...original,
        _id: Date.now().toString(),
        templateId: `${original.templateId}_V${original.version + 1}`,
        version: original.version + 1,
        isActive: false,
        title: `${original.title} (Copy)`
      };
      setTemplates(prev => [...prev, cloned]);
    } catch (error) {
      console.error('Failed to clone template:', error);
    }
  };

  const getStatusColor = (isActive) => {
    return isActive 
      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
      : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
  };

  const getTypeColor = (type) => {
    return type === 'life' 
      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
      : 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
  };

  const formatOption = (option) => {
    return option.charAt(0).toUpperCase() + option.slice(1).replace(/([A-Z])/g, ' $1');
  };

  const tabs = [
    { id: 'templates', label: 'Templates', icon: FileText },
    { id: 'coverage', label: 'Coverage', icon: BarChart3 },
    { id: 'analytics', label: 'Analytics', icon: Activity }
  ];

  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Questionnaire Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Create, manage, and monitor questionnaire templates for insurance claims
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            disabled={isLoading}
            className="flex items-center gap-2 bg-gray-500 hover:bg-gray-600 disabled:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          
          <button
            onClick={handleCreateTemplate}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors font-medium"
          >
            <Plus className="w-4 h-4" />
            Create Template
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <FileText className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Templates</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{templates.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Active Templates</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {templates.filter(t => t.isActive).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
              <Target className="w-8 h-8 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Coverage Rate</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {Math.round((coverageStats.covered / coverageStats.total) * 100)}%
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-lg">
              <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Missing</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{coverageStats.missing}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 mb-8">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => {
              const IconComponent = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  <IconComponent className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'templates' && (
            <div>
              {/* Filters */}
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search templates by title or ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <select
                  value={filterClaimType}
                  onChange={(e) => setFilterClaimType(e.target.value)}
                  className="px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Claim Types</option>
                  <option value="life">Life Insurance</option>
                  <option value="vehicle">Vehicle Insurance</option>
                </select>

                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active Only</option>
                  <option value="inactive">Inactive Only</option>
                </select>
              </div>

              {/* Templates List */}
              <div className="space-y-4">
                {isLoading ? (
                  <div className="text-center py-12">
                    <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-500 dark:text-gray-400">Loading templates...</p>
                  </div>
                ) : filteredTemplates.length > 0 ? (
                  filteredTemplates.map((template) => (
                    <div
                      key={template._id}
                      className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors border border-gray-200 dark:border-gray-600"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                              {template.title}
                            </h3>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(template.isActive)}`}>
                              {template.isActive ? 'Active' : 'Inactive'}
                            </span>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getTypeColor(template.claimType)}`}>
                              {template.claimType.toUpperCase()}
                            </span>
                            <span className="px-3 py-1 bg-gray-200 text-gray-800 dark:bg-gray-600 dark:text-gray-200 rounded-full text-xs font-medium">
                              {formatOption(template.claimOption)}
                            </span>
                          </div>
                          
                          <p className="text-gray-600 dark:text-gray-300 mb-4">
                            {template.description || 'No description provided'}
                          </p>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="text-gray-500 dark:text-gray-400">Template ID:</span>
                              <p className="font-medium text-gray-900 dark:text-white">{template.templateId}</p>
                            </div>
                            <div>
                              <span className="text-gray-500 dark:text-gray-400">Questions:</span>
                              <p className="font-medium text-gray-900 dark:text-white">{template.questions.length}</p>
                            </div>
                            <div>
                              <span className="text-gray-500 dark:text-gray-400">Version:</span>
                              <p className="font-medium text-gray-900 dark:text-white">v{template.version}</p>
                            </div>
                            <div>
                              <span className="text-gray-500 dark:text-gray-400">Last Modified:</span>
                              <p className="font-medium text-gray-900 dark:text-white">
                                {new Date(template.lastModified).toLocaleDateString()}
                              </p>
                            </div>
                          </div>

                          <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                            Modified by: {template.modifiedBy.firstName} {template.modifiedBy.lastName}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 ml-6">
                          <button
                            onClick={() => handlePreviewTemplate(template)}
                            className="p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                            title="Preview"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          
                          <button
                            onClick={() => handleEditTemplate(template._id)}
                            className="p-2 text-green-600 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          
                          <button
                            onClick={() => handleCloneTemplate(template._id)}
                            className="p-2 text-purple-600 hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded-lg transition-colors"
                            title="Clone"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                          
                          <button
                            onClick={() => handleToggleStatus(template._id)}
                            className="p-2 text-orange-600 hover:bg-orange-100 dark:hover:bg-orange-900/30 rounded-lg transition-colors"
                            title={template.isActive ? 'Deactivate' : 'Activate'}
                          >
                            {template.isActive ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                          </button>
                          
                          <button
                            onClick={() => handleDeleteTemplate(template._id)}
                            className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <FileText className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                    <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      No templates found
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-4">
                      {searchTerm || filterClaimType !== 'all' || filterStatus !== 'all'
                        ? 'Try adjusting your filters'
                        : 'Create your first questionnaire template'
                      }
                    </p>
                    <button
                      onClick={handleCreateTemplate}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      Create Template
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'coverage' && (
            <div>
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Template Coverage Matrix
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Overview of questionnaire template coverage across all claim type and option combinations
                </p>
              </div>

              <div className="grid gap-6">
                {Object.keys(VALID_COMBINATIONS).map(claimType => (
                  <div key={claimType} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 capitalize">
                      {claimType} Insurance
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {VALID_COMBINATIONS[claimType].map(option => {
                        const coverageItem = coverage.find(c => 
                          c.claimType === claimType && c.claimOption === option
                        );
                        const hasTemplate = coverageItem?.hasTemplate;
                        
                        return (
                          <div
                            key={option}
                            className={`p-4 rounded-lg border-2 transition-all ${
                              hasTemplate
                                ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20'
                                : 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <h5 className="font-medium text-gray-900 dark:text-white">
                                {formatOption(option)}
                              </h5>
                              {hasTemplate ? (
                                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                              ) : (
                                <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                              )}
                            </div>
                            <p className={`text-xs ${
                              hasTemplate 
                                ? 'text-green-700 dark:text-green-300'
                                : 'text-red-700 dark:text-red-300'
                            }`}>
                              {hasTemplate ? 'Template Available' : 'No Template'}
                            </p>
                            {hasTemplate && coverageItem.template && (
                              <div className="mt-2">
                                <p className="text-xs text-gray-600 dark:text-gray-400">
                                  {coverageItem.template.templateId}
                                </p>
                              </div>
                            )}
                            {!hasTemplate && (
                              <button
                                onClick={handleCreateTemplate}
                                className="mt-2 text-xs bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded transition-colors"
                              >
                                Create Template
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div>
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Template Analytics
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Usage statistics and performance metrics for your questionnaire templates
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Template Usage
                  </h4>
                  <div className="space-y-4">
                    {templates.filter(t => t.isActive).map(template => (
                      <div key={template._id} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {template.templateId}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {template.title}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {Math.floor(Math.random() * 50) + 1} uses
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Last 30 days
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Response Rates
                  </h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 dark:text-gray-300">Average Completion Rate</span>
                      <span className="font-semibold text-green-600 dark:text-green-400">87%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 dark:text-gray-300">Average Response Time</span>
                      <span className="font-semibold text-blue-600 dark:text-blue-400">2.5 days</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 dark:text-gray-300">Most Used Template</span>
                      <span className="font-semibold text-purple-600 dark:text-purple-400">LIFE_HOSP</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Preview Modal */}
      {showPreviewModal && selectedTemplate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Template Preview: {selectedTemplate.title}
                </h3>
                <button
                  onClick={() => setShowPreviewModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="mb-6">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Template Information</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Template ID:</span>
                    <p className="font-medium">{selectedTemplate.templateId}</p>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Claim Type:</span>
                    <p className="font-medium">{selectedTemplate.claimType}</p>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Claim Option:</span>
                    <p className="font-medium">{formatOption(selectedTemplate.claimOption)}</p>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Version:</span>
                    <p className="font-medium">v{selectedTemplate.version}</p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Questions ({selectedTemplate.questions.length})</h4>
                <div className="space-y-4">
                  {selectedTemplate.questions.map((question, index) => (
                    <div key={question.questionId} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h5 className="font-medium text-gray-900 dark:text-white">
                          {index + 1}. {question.questionText}
                        </h5>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            question.isRequired 
                              ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                              : 'bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-200'
                          }`}>
                            {question.isRequired ? 'Required' : 'Optional'}
                          </span>
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 rounded-full text-xs font-medium">
                            {question.questionType}
                          </span>
                        </div>
                      </div>
                      
                      {question.helpText && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          {question.helpText}
                        </p>
                      )}
                      
                      {question.options && (
                        <div className="mt-2">
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Options:</p>
                          <div className="flex flex-wrap gap-2">
                            {question.options.map((option, optionIndex) => (
                              <span
                                key={optionIndex}
                                className="px-2 py-1 bg-white dark:bg-gray-600 border border-gray-200 dark:border-gray-500 rounded text-sm"
                              >
                                {option}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Questionnaires;
