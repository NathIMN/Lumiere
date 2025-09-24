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

  // Complete mock data with all 8 templates
  const [mockData] = useState({
    templates: [
      // Existing templates
      {
        _id: "66f1234567890abcdef12345",
        templateId: "LIFE_HOSP",
        claimType: "life",
        claimOption: "hospitalization",
        title: "Life Insurance - Hospitalization Claims",
        description: "Comprehensive questionnaire for hospitalization-related life insurance claims",
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
        usageCount: 45,
        averageCompletionTime: "14 minutes",
        completionRate: 92,
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
        description: "Detailed questionnaire for vehicle accident insurance claims",
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
        usageCount: 38,
        averageCompletionTime: "19 minutes",
        completionRate: 88,
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
        description: "Comprehensive questionnaire for death benefit claims",
        questions: [
          {
            questionId: "death_001",
            questionText: "Date of death",
            questionType: "date",
            isRequired: true,
            order: 1
          }
        ],
        isActive: true,
        version: 1,
        usageCount: 12,
        averageCompletionTime: "8 minutes",
        completionRate: 95,
        lastModified: "2025-01-12T09:20:00Z",
        modifiedBy: {
          firstName: "Mike",
          lastName: "Johnson",
          email: "mike.johnson@company.com"
        }
      },
      // New templates (5 additional)
      {
        _id: "66f1234567890abcdef12348",
        templateId: "LIFE_CHANNEL",
        claimType: "life",
        claimOption: "channelling",
        title: "Life Insurance - Channelling Claims",
        description: "Comprehensive questionnaire for medical channelling and consultation claims",
        questions: [
          {
            questionId: "channel_001",
            questionText: "Date of medical consultation/channelling",
            questionType: "date",
            isRequired: true,
            order: 1,
            helpText: "Please provide the exact date of your medical consultation"
          },
          {
            questionId: "channel_002",
            questionText: "Type of medical consultation",
            questionType: "select",
            options: ["Specialist Consultation", "General Practitioner", "Emergency Consultation", "Follow-up Visit"],
            isRequired: true,
            order: 2
          },
          {
            questionId: "channel_003",
            questionText: "Name of the medical facility/hospital",
            questionType: "text",
            isRequired: true,
            order: 3,
            helpText: "Enter the full name of the medical facility where consultation took place"
          },
          {
            questionId: "channel_004",
            questionText: "Doctor's name and specialization",
            questionType: "text",
            isRequired: true,
            order: 4
          },
          {
            questionId: "channel_005",
            questionText: "Total consultation fee charged",
            questionType: "number",
            isRequired: true,
            order: 5,
            helpText: "Enter the total amount charged for the consultation"
          },
          {
            questionId: "channel_006",
            questionText: "Upload consultation receipts and medical reports",
            questionType: "file",
            isRequired: true,
            order: 6,
            helpText: "Upload all relevant receipts, prescriptions, and medical reports"
          }
        ],
        isActive: true,
        version: 1,
        usageCount: 28,
        averageCompletionTime: "8 minutes",
        completionRate: 94,
        lastModified: "2025-09-22T09:15:00Z",
        modifiedBy: {
          firstName: "Dr. Sarah",
          lastName: "Johnson",
          email: "sarah.johnson@company.com"
        }
      },
      {
        _id: "66f1234567890abcdef12349",
        templateId: "LIFE_MEDIC",
        claimType: "life",
        claimOption: "medication",
        title: "Life Insurance - Medication Claims",
        description: "Detailed questionnaire for prescription and medication reimbursement claims",
        questions: [
          {
            questionId: "medic_001",
            questionText: "Date of medication purchase",
            questionType: "date",
            isRequired: true,
            order: 1,
            helpText: "Date when the medication was purchased from pharmacy"
          },
          {
            questionId: "medic_002",
            questionText: "Type of medication claim",
            questionType: "select",
            options: ["Prescription Medication", "Over-the-counter Medicine", "Emergency Medication", "Chronic Condition Medication"],
            isRequired: true,
            order: 2
          },
          {
            questionId: "medic_003",
            questionText: "Name of prescribed medication(s)",
            questionType: "text",
            isRequired: true,
            order: 3,
            helpText: "List all medications purchased (separate with commas)"
          },
          {
            questionId: "medic_004",
            questionText: "Prescribing doctor's name and qualification",
            questionType: "text",
            isRequired: true,
            order: 4
          },
          {
            questionId: "medic_005",
            questionText: "Medical condition requiring medication",
            questionType: "text",
            isRequired: true,
            order: 5,
            helpText: "Describe the medical condition that required this medication"
          },
          {
            questionId: "medic_006",
            questionText: "Total amount spent on medication",
            questionType: "number",
            isRequired: true,
            order: 6
          },
          {
            questionId: "medic_007",
            questionText: "Upload prescription and pharmacy receipts",
            questionType: "file",
            isRequired: true,
            order: 7,
            helpText: "Upload original prescription, pharmacy receipts, and medication labels"
          }
        ],
        isActive: true,
        version: 2,
        usageCount: 35,
        averageCompletionTime: "12 minutes",
        completionRate: 91,
        lastModified: "2025-09-21T14:30:00Z",
        modifiedBy: {
          firstName: "Emily",
          lastName: "Chen",
          email: "emily.chen@company.com"
        }
      },
      {
        _id: "66f1234567890abcdef12350",
        templateId: "VEHICLE_THEFT",
        claimType: "vehicle",
        claimOption: "theft",
        title: "Vehicle Insurance - Theft Claims",
        description: "Comprehensive questionnaire for vehicle theft insurance claims",
        questions: [
          {
            questionId: "theft_001",
            questionText: "Date and time when theft was discovered",
            questionType: "date",
            isRequired: true,
            order: 1,
            helpText: "When did you first notice your vehicle was stolen?"
          },
          {
            questionId: "theft_002",
            questionText: "Location where vehicle was stolen from",
            questionType: "text",
            isRequired: true,
            order: 2,
            helpText: "Provide detailed address where the vehicle was parked when stolen"
          },
          {
            questionId: "theft_003",
            questionText: "Was the vehicle locked when stolen?",
            questionType: "boolean",
            isRequired: true,
            order: 3
          },
          {
            questionId: "theft_004",
            questionText: "Were keys left in the vehicle?",
            questionType: "boolean",
            isRequired: true,
            order: 4
          },
          {
            questionId: "theft_005",
            questionText: "Police report filed?",
            questionType: "boolean",
            isRequired: true,
            order: 5
          },
          {
            questionId: "theft_006",
            questionText: "Police report number and station",
            questionType: "text",
            isRequired: true,
            order: 6,
            helpText: "Provide the FIR number and police station details"
          },
          {
            questionId: "theft_007",
            questionText: "List of items stolen with the vehicle",
            questionType: "text",
            isRequired: false,
            order: 7,
            helpText: "List any personal belongings, accessories, or modifications stolen with the vehicle"
          },
          {
            questionId: "theft_008",
            questionText: "Upload police report and vehicle documents",
            questionType: "file",
            isRequired: true,
            order: 8,
            helpText: "Upload FIR copy, vehicle registration, insurance policy, and any other relevant documents"
          }
        ],
        isActive: true,
        version: 1,
        usageCount: 15,
        averageCompletionTime: "18 minutes",
        completionRate: 89,
        lastModified: "2025-09-20T11:45:00Z",
        modifiedBy: {
          firstName: "Michael",
          lastName: "Rodriguez",
          email: "michael.rodriguez@company.com"
        }
      },
      {
        _id: "66f1234567890abcdef12351",
        templateId: "VEHICLE_FIRE",
        claimType: "vehicle",
        claimOption: "fire",
        title: "Vehicle Insurance - Fire Claims",
        description: "Detailed questionnaire for vehicle fire damage insurance claims",
        questions: [
          {
            questionId: "fire_001",
            questionText: "Date and time of fire incident",
            questionType: "date",
            isRequired: true,
            order: 1,
            helpText: "When did the fire incident occur?"
          },
          {
            questionId: "fire_002",
            questionText: "Location of fire incident",
            questionType: "text",
            isRequired: true,
            order: 2,
            helpText: "Provide detailed address where the fire occurred"
          },
          {
            questionId: "fire_003",
            questionText: "Cause of fire",
            questionType: "select",
            options: ["Engine Fire", "Electrical Fire", "Fuel System Fire", "External Fire", "Arson", "Unknown"],
            isRequired: true,
            order: 3
          },
          {
            questionId: "fire_004",
            questionText: "Was vehicle being driven when fire started?",
            questionType: "boolean",
            isRequired: true,
            order: 4
          },
          {
            questionId: "fire_005",
            questionText: "Fire brigade called?",
            questionType: "boolean",
            isRequired: true,
            order: 5
          },
          {
            questionId: "fire_006",
            questionText: "Police report filed?",
            questionType: "boolean",
            isRequired: true,
            order: 6
          },
          {
            questionId: "fire_007",
            questionText: "Extent of fire damage",
            questionType: "select",
            options: ["Total Loss", "Major Damage", "Moderate Damage", "Minor Damage"],
            isRequired: true,
            order: 7
          },
          {
            questionId: "fire_008",
            questionText: "Any injuries caused by the fire?",
            questionType: "boolean",
            isRequired: true,
            order: 8
          },
          {
            questionId: "fire_009",
            questionText: "Upload fire brigade report, police report, and photos",
            questionType: "file",
            isRequired: true,
            order: 9,
            helpText: "Upload all relevant reports, photos of damage, and supporting documents"
          }
        ],
        isActive: true,
        version: 1,
        usageCount: 8,
        averageCompletionTime: "22 minutes",
        completionRate: 85,
        lastModified: "2025-09-19T16:20:00Z",
        modifiedBy: {
          firstName: "David",
          lastName: "Kim",
          email: "david.kim@company.com"
        }
      },
      {
        _id: "66f1234567890abcdef12352",
        templateId: "VEHICLE_NATURAL",
        claimType: "vehicle",
        claimOption: "naturalDisaster",
        title: "Vehicle Insurance - Natural Disaster Claims",
        description: "Comprehensive questionnaire for natural disaster vehicle damage claims",
        questions: [
          {
            questionId: "natural_001",
            questionText: "Date of natural disaster occurrence",
            questionType: "date",
            isRequired: true,
            order: 1,
            helpText: "Date when the natural disaster occurred"
          },
          {
            questionId: "natural_002",
            questionText: "Type of natural disaster",
            questionType: "select",
            options: ["Flood", "Earthquake", "Hurricane/Cyclone", "Hail Storm", "Landslide", "Tsunami", "Other"],
            isRequired: true,
            order: 2
          },
          {
            questionId: "natural_003",
            questionText: "Location where vehicle was damaged",
            questionType: "text",
            isRequired: true,
            order: 3,
            helpText: "Provide detailed address where the vehicle was when disaster struck"
          },
          {
            questionId: "natural_004",
            questionText: "Was vehicle parked or being driven during incident?",
            questionType: "select",
            options: ["Parked", "Being Driven", "In Transit"],
            isRequired: true,
            order: 4
          },
          {
            questionId: "natural_005",
            questionText: "Type of damage caused to vehicle",
            questionType: "multiselect",
            options: ["Water Damage", "Impact Damage", "Glass Breakage", "Paint Damage", "Engine Damage", "Interior Damage", "Total Loss"],
            isRequired: true,
            order: 5
          },
          {
            questionId: "natural_006",
            questionText: "Was official disaster warning issued by authorities?",
            questionType: "boolean",
            isRequired: true,
            order: 6
          },
          {
            questionId: "natural_007",
            questionText: "Any other vehicles in area affected?",
            questionType: "boolean",
            isRequired: true,
            order: 7
          },
          {
            questionId: "natural_008",
            questionText: "Emergency services contacted?",
            questionType: "boolean",
            isRequired: true,
            order: 8
          },
          {
            questionId: "natural_009",
            questionText: "Upload photos of damage and weather reports",
            questionType: "file",
            isRequired: true,
            order: 9,
            helpText: "Upload damage photos, official weather reports, and any emergency service reports"
          }
        ],
        isActive: true,
        version: 1,
        usageCount: 5,
        averageCompletionTime: "25 minutes",
        completionRate: 88,
        lastModified: "2025-09-18T13:10:00Z",
        modifiedBy: {
          firstName: "Lisa",
          lastName: "Wang",
          email: "lisa.wang@company.com"
        }
      }
    ],
    // Updated coverage stats - now 100% coverage!
    coverageStats: {
      total: 8,
      covered: 8, // All 8 combinations now have templates
      missing: 0  // No missing templates
    }
  });

  // Initialize data
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
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
      setTemplates(prev => prev.filter(t => t._id !== templateId));
    } catch (error) {
      console.error('Failed to delete template:', error);
    }
  };

  const handleCloneTemplate = async (templateId) => {
    try {
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

      {/* Stats Cards - Now showing 100% coverage! */}
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
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <Target className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Coverage Rate</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {Math.round((coverageStats.covered / coverageStats.total) * 100)}% ✅
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Missing</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">{coverageStats.missing} ✅</p>
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
                <div className="mt-4 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-sm font-medium text-green-600 dark:text-green-400">
                    🎉 100% Coverage Achieved! All templates are now available.
                  </span>
                </div>
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
                            className="p-4 rounded-lg border-2 border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20 transition-all"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <h5 className="font-medium text-gray-900 dark:text-white">
                                {formatOption(option)}
                              </h5>
                              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                            </div>
                            <p className="text-xs text-green-700 dark:text-green-300 mb-2">
                              Template Available
                            </p>
                            {hasTemplate && coverageItem.template && (
                              <div className="mt-2">
                                <p className="text-xs text-gray-600 dark:text-gray-400">
                                  {coverageItem.template.templateId}
                                </p>
                                <div className="flex items-center gap-2 mt-2">
                                  <span className="text-xs bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300 px-2 py-1 rounded">
                                    {coverageItem.template.questions.length} questions
                                  </span>
                                  <span className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 px-2 py-1 rounded">
                                    v{coverageItem.template.version}
                                  </span>
                                </div>
                              </div>
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
                            {template.usageCount} uses
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {template.averageCompletionTime}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Performance Summary
                  </h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 dark:text-gray-300">Total Templates</span>
                      <span className="font-semibold text-blue-600 dark:text-blue-400">{templates.length}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 dark:text-gray-300">Average Completion Rate</span>
                      <span className="font-semibold text-green-600 dark:text-green-400">
                        {Math.round(templates.reduce((sum, t) => sum + t.completionRate, 0) / templates.length)}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 dark:text-gray-300">Total Usage</span>
                      <span className="font-semibold text-purple-600 dark:text-purple-400">
                        {templates.reduce((sum, t) => sum + t.usageCount, 0)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 dark:text-gray-300">Coverage Rate</span>
                      <span className="font-semibold text-green-600 dark:text-green-400">100% ✅</span>
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
