import { useState, useEffect } from 'react';
import {
  Plus,
  Trash2,
  GripVertical,
  ChevronDown,
  ChevronUp,
  Save,
  X,
  AlertTriangle,
  CheckCircle,
  Info,
  Eye,
  Copy,
  Settings,
  FileText,
  Upload,
  Calendar,
  Hash,
  Type,
  List,
  CheckSquare,
  ToggleLeft,
  HelpCircle,
  Wand2,
  Zap
} from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

const CreateTemplate = () => {
  const [template, setTemplate] = useState({
    templateId: '',
    title: '',
    description: '',
    claimType: '',
    claimOption: '',
    questions: [],
    isActive: true,
    validationRules: {
      crossFieldValidations: [],
      conditionalValidations: [],
      fraudPrevention: {
        duplicateSubmissionCheck: true,
        suspiciousPatternDetection: {
          repetitiveAnswers: true,
          timeToComplete: { min: "2_minutes", max: "2_hours" }
        }
      }
    }
  });

  const [currentQuestion, setCurrentQuestion] = useState({
    questionId: '',
    sectionTitle: '',
    questionText: '',
    questionType: 'text',
    isRequired: true,
    order: 1,
    options: [],
    validation: {},
    helpText: '',
    conditionalDisplay: null
  });

  const [showQuestionBuilder, setShowQuestionBuilder] = useState(false);
  const [editingQuestionIndex, setEditingQuestionIndex] = useState(null);
  const [activeSection, setActiveSection] = useState('basic');
  const [validationErrors, setValidationErrors] = useState({});
  const [previewMode, setPreviewMode] = useState(false);
  const [showValidationHelper, setShowValidationHelper] = useState(false);

  // Question Types with their validation options
  const QUESTION_TYPES = {
    text: {
      label: 'Text Input',
      icon: Type,
      validations: ['minLength', 'maxLength', 'pattern', 'required', 'noRepeatingChars', 'properCase']
    },
    textarea: {
      label: 'Long Text',
      icon: FileText,
      validations: ['minLength', 'maxLength', 'required', 'wordCount']
    },
    number: {
      label: 'Number',
      icon: Hash,
      validations: ['min', 'max', 'decimals', 'required', 'positiveOnly']
    },
    date: {
      label: 'Date',
      icon: Calendar,
      validations: ['required', 'minDate', 'maxDate', 'format', 'logicalDateCheck']
    },
    datetime: {
      label: 'Date & Time',
      icon: Calendar,
      validations: ['required', 'minDate', 'maxDate', 'format', 'businessHours']
    },
    time: {
      label: 'Time',
      icon: Calendar,
      validations: ['required', 'format', 'businessHours']
    },
    select: {
      label: 'Dropdown',
      icon: ChevronDown,
      validations: ['required', 'validOptions', 'conditionalRequired']
    },
    multiselect: {
      label: 'Multi-Select',
      icon: List,
      validations: ['required', 'minSelected', 'maxSelected', 'validCombinations', 'invalidCombinations']
    },
    boolean: {
      label: 'Yes/No',
      icon: ToggleLeft,
      validations: ['required', 'triggerFields']
    },
    checkbox: {
      label: 'Checkbox',
      icon: CheckSquare,
      validations: ['required', 'mustBeChecked']
    },
    file: {
      label: 'File Upload',
      icon: Upload,
      validations: ['required', 'fileTypes', 'maxSize', 'minSize', 'maxFiles', 'imageDimensions', 'virusScanning']
    }
  };

  // Predefined validation templates
  const VALIDATION_TEMPLATES = {
    personName: {
      pattern: "^[a-zA-Z\\s\\.'-]+$",
      minLength: 2,
      maxLength: 100,
      message: "Name must contain only letters, spaces, dots, hyphens, and apostrophes"
    },
    phoneNumber: {
      pattern: "^[+]?[0-9]{10,15}$",
      message: "Please enter valid phone number (10-15 digits)"
    },
    email: {
      pattern: "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$",
      message: "Please enter valid email address"
    },
    currency: {
      min: 1,
      max: 10000000,
      decimals: 2,
      positiveOnly: true,
      message: "Please enter valid amount"
    },
    address: {
      minLength: 10,
      maxLength: 500,
      pattern: "^[a-zA-Z0-9\\s\\.,#\\-/]+$",
      message: "Address must include street, city, and postal code"
    },
    doctorName: {
      pattern: "^Dr\\.[\\s][a-zA-Z\\s\\.]+$",
      message: "Enter doctor's name starting with 'Dr.' (e.g., Dr. John Smith)"
    },
    icd10Code: {
      pattern: "^[A-Z][0-9]{2}(\\.[0-9X]{1,4})?$",
      message: "Please enter valid ICD-10 code (e.g., A00.1)"
    }
  };

  const CLAIM_TYPES = {
    life: {
      label: 'Life Insurance',
      options: ['hospitalization', 'channelling', 'medication', 'death']
    },
    vehicle: {
      label: 'Vehicle Insurance',
      options: ['accident', 'theft', 'fire', 'naturalDisaster']
    }
  };

  // Initialize new question
  const initializeNewQuestion = () => {
    const newOrder = template.questions.length + 1;
    setCurrentQuestion({
      questionId: `q_${Date.now()}`,
      sectionTitle: '',
      questionText: '',
      questionType: 'text',
      isRequired: true,
      order: newOrder,
      options: [],
      validation: {},
      helpText: '',
      conditionalDisplay: null
    });
    setEditingQuestionIndex(null);
    setShowQuestionBuilder(true);
  };

  // Add or update question
  const handleSaveQuestion = () => {
    if (validateQuestion(currentQuestion)) {
      const updatedQuestions = [...template.questions];
      
      if (editingQuestionIndex !== null) {
        updatedQuestions[editingQuestionIndex] = { ...currentQuestion };
      } else {
        updatedQuestions.push({ ...currentQuestion });
      }
      
      setTemplate(prev => ({ ...prev, questions: updatedQuestions }));
      setShowQuestionBuilder(false);
      resetCurrentQuestion();
    }
  };

  // Validate question before saving
  const validateQuestion = (question) => {
    const errors = {};
    
    if (!question.questionText.trim()) {
      errors.questionText = 'Question text is required';
    }
    
    if (['select', 'multiselect'].includes(question.questionType) && question.options.length === 0) {
      errors.options = 'At least one option is required for this question type';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Reset current question
  const resetCurrentQuestion = () => {
    setCurrentQuestion({
      questionId: `q_${Date.now()}`,
      sectionTitle: '',
      questionText: '',
      questionType: 'text',
      isRequired: true,
      order: template.questions.length + 1,
      options: [],
      validation: {},
      helpText: '',
      conditionalDisplay: null
    });
  };

  // Handle drag end for question reordering
  const handleDragEnd = (result) => {
    if (!result.destination) return;
    
    const items = Array.from(template.questions);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    // Update order numbers
    const updatedItems = items.map((item, index) => ({ ...item, order: index + 1 }));
    setTemplate(prev => ({ ...prev, questions: updatedItems }));
  };

  // Apply validation template
  const applyValidationTemplate = (templateKey) => {
    const template = VALIDATION_TEMPLATES[templateKey];
    if (template) {
      setCurrentQuestion(prev => ({
        ...prev,
        validation: { ...prev.validation, ...template }
      }));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Create New Template
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Build a comprehensive questionnaire with advanced validations
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => setPreviewMode(!previewMode)}
              className="flex items-center gap-2 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <Eye className="w-4 h-4" />
              {previewMode ? 'Edit Mode' : 'Preview'}
            </button>
            
            <button
              onClick={() => {/* Handle save */}}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition-colors"
            >
              <Save className="w-4 h-4" />
              Save Template
            </button>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar Navigation */}
        <div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 min-h-screen">
          <div className="p-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Template Builder
            </h3>
            
            <div className="space-y-2">
              {[
                { id: 'basic', label: 'Basic Info', icon: Settings },
                { id: 'questions', label: 'Questions', icon: FileText, count: template.questions.length },
                { id: 'validations', label: 'Advanced Validations', icon: Zap },
                { id: 'preview', label: 'Preview & Test', icon: Eye }
              ].map((section) => {
                const IconComponent = section.icon;
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors text-left ${
                      activeSection === section.id
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <IconComponent className="w-5 h-5" />
                      <span className="font-medium">{section.label}</span>
                    </div>
                    {section.count !== undefined && (
                      <span className="bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 px-2 py-1 rounded-full text-xs">
                        {section.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6">
          {activeSection === 'basic' && (
            <div className="max-w-4xl">
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                  Template Basic Information
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Template ID */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Template ID *
                    </label>
                    <input
                      type="text"
                      value={template.templateId}
                      onChange={(e) => setTemplate(prev => ({ ...prev, templateId: e.target.value.toUpperCase() }))}
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., LIFE_HOSPITAL_V1"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Unique identifier for this template
                    </p>
                  </div>

                  {/* Claim Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Insurance Type *
                    </label>
                    <select
                      value={template.claimType}
                      onChange={(e) => setTemplate(prev => ({ ...prev, claimType: e.target.value, claimOption: '' }))}
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Insurance Type</option>
                      {Object.entries(CLAIM_TYPES).map(([key, value]) => (
                        <option key={key} value={key}>{value.label}</option>
                      ))}
                    </select>
                  </div>

                  {/* Claim Option */}
                  {template.claimType && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Claim Type *
                      </label>
                      <select
                        value={template.claimOption}
                        onChange={(e) => setTemplate(prev => ({ ...prev, claimOption: e.target.value }))}
                        className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select Claim Type</option>
                        {CLAIM_TYPES[template.claimType].options.map((option) => (
                          <option key={option} value={option}>
                            {option.charAt(0).toUpperCase() + option.slice(1).replace(/([A-Z])/g, ' $1')}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Status */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Initial Status
                    </label>
                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="status"
                          checked={template.isActive}
                          onChange={() => setTemplate(prev => ({ ...prev, isActive: true }))}
                          className="text-green-600 focus:ring-green-500"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">Active</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="status"
                          checked={!template.isActive}
                          onChange={() => setTemplate(prev => ({ ...prev, isActive: false }))}
                          className="text-gray-600 focus:ring-gray-500"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">Draft</span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Template Title */}
                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Template Title *
                  </label>
                  <input
                    type="text"
                    value={template.title}
                    onChange={(e) => setTemplate(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Life Insurance - Hospitalization Claims"
                  />
                </div>

                {/* Description */}
                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    value={template.description}
                    onChange={(e) => setTemplate(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
                    placeholder="Describe the purpose and scope of this questionnaire template..."
                  />
                </div>
              </div>
            </div>
          )}

          {activeSection === 'questions' && (
            <div className="max-w-6xl">
              {/* Questions Header */}
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                      Questions ({template.questions.length})
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                      Build your questionnaire with advanced validation rules
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setShowValidationHelper(!showValidationHelper)}
                      className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      <HelpCircle className="w-4 h-4" />
                      Validation Guide
                    </button>
                    
                    <button
                      onClick={initializeNewQuestion}
                      className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      Add Question
                    </button>
                  </div>
                </div>
              </div>

              {/* Validation Helper */}
              {showValidationHelper && (
                <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-6 mb-6">
                  <h3 className="text-lg font-semibold text-purple-800 dark:text-purple-200 mb-4 flex items-center gap-2">
                    <Wand2 className="w-5 h-5" />
                    Smart Validation Templates
                  </h3>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {Object.entries(VALIDATION_TEMPLATES).map(([key, template]) => (
                      <button
                        key={key}
                        onClick={() => applyValidationTemplate(key)}
                        className="p-3 bg-white dark:bg-gray-700 rounded-lg border border-purple-200 dark:border-purple-700 hover:bg-purple-50 dark:hover:bg-purple-900/30 transition-colors text-left"
                      >
                        <div className="font-medium text-purple-800 dark:text-purple-200 text-sm">
                          {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}
                        </div>
                        <div className="text-xs text-purple-600 dark:text-purple-300 mt-1">
                          {template.message || 'Predefined validation rules'}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Questions List */}
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                {template.questions.length > 0 ? (
                  <DragDropContext onDragEnd={handleDragEnd}>
                    <Droppable droppableId="questions">
                      {(provided) => (
                        <div {...provided.droppableProps} ref={provided.innerRef} className="p-6">
                          {template.questions.map((question, index) => (
                            <Draggable key={question.questionId} draggableId={question.questionId} index={index}>
                              {(provided) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-4 border border-gray-200 dark:border-gray-600"
                                >
                                  <div className="flex items-start gap-4">
                                    <div {...provided.dragHandleProps} className="mt-2">
                                      <GripVertical className="w-5 h-5 text-gray-400" />
                                    </div>
                                    
                                    <div className="flex-1">
                                      <div className="flex items-center gap-3 mb-2">
                                        <span className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 px-2 py-1 rounded text-sm font-medium">
                                          #{question.order}
                                        </span>
                                        <span className="bg-gray-200 text-gray-700 dark:bg-gray-600 dark:text-gray-300 px-2 py-1 rounded text-sm">
                                          {QUESTION_TYPES[question.questionType]?.label}
                                        </span>
                                        {question.isRequired && (
                                          <span className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 px-2 py-1 rounded text-sm">
                                            Required
                                          </span>
                                        )}
                                        {Object.keys(question.validation || {}).length > 0 && (
                                          <span className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 px-2 py-1 rounded text-sm flex items-center gap-1">
                                            <CheckCircle className="w-3 h-3" />
                                            Validated
                                          </span>
                                        )}
                                      </div>
                                      
                                      <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                                        {question.questionText}
                                      </h4>
                                      
                                      {question.helpText && (
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                          {question.helpText}
                                        </p>
                                      )}
                                      
                                      {question.options && question.options.length > 0 && (
                                        <div className="flex flex-wrap gap-1 mt-2">
                                          {question.options.slice(0, 3).map((option, idx) => (
                                            <span key={idx} className="bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300 px-2 py-1 rounded text-xs">
                                              {option}
                                            </span>
                                          ))}
                                          {question.options.length > 3 && (
                                            <span className="text-xs text-gray-500 dark:text-gray-400">
                                              +{question.options.length - 3} more
                                            </span>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                    
                                    <div className="flex items-center gap-2">
                                      <button
                                        onClick={() => {
                                          setCurrentQuestion(question);
                                          setEditingQuestionIndex(index);
                                          setShowQuestionBuilder(true);
                                        }}
                                        className="p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                                      >
                                        <Settings className="w-4 h-4" />
                                      </button>
                                      
                                      <button
                                        onClick={() => {
                                          const updatedQuestions = template.questions.filter((_, idx) => idx !== index);
                                          setTemplate(prev => ({ ...prev, questions: updatedQuestions }));
                                        }}
                                        className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </DragDropContext>
                ) : (
                  <div className="p-12 text-center">
                    <FileText className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                    <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      No questions yet
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-4">
                      Start building your questionnaire by adding your first question
                    </p>
                    <button
                      onClick={initializeNewQuestion}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      Add First Question
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* More sections (validations, preview) would continue here... */}
        </div>
      </div>

      {/* Question Builder Modal */}
      {showQuestionBuilder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {editingQuestionIndex !== null ? 'Edit Question' : 'Add New Question'}
                </h3>
                <button
                  onClick={() => setShowQuestionBuilder(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6">
              {/* Question Builder Content - This would be a comprehensive form */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column - Question Details */}
                <div className="space-y-6">
                  {/* Question Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      Question Type *
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {Object.entries(QUESTION_TYPES).map(([type, config]) => {
                        const IconComponent = config.icon;
                        return (
                          <button
                            key={type}
                            onClick={() => setCurrentQuestion(prev => ({ ...prev, questionType: type }))}
                            className={`p-3 border-2 rounded-lg transition-colors text-left ${
                              currentQuestion.questionType === type
                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <IconComponent className="w-4 h-4" />
                              <span className="text-sm font-medium">{config.label}</span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Question Text */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Question Text *
                    </label>
                    <textarea
                      value={currentQuestion.questionText}
                      onChange={(e) => setCurrentQuestion(prev => ({ ...prev, questionText: e.target.value }))}
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[80px]"
                      placeholder="Enter your question..."
                    />
                    {validationErrors.questionText && (
                      <p className="text-red-600 text-sm mt-1">{validationErrors.questionText}</p>
                    )}
                  </div>

                  {/* Help Text */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Help Text
                    </label>
                    <input
                      type="text"
                      value={currentQuestion.helpText}
                      onChange={(e) => setCurrentQuestion(prev => ({ ...prev, helpText: e.target.value }))}
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Guidance text for users..."
                    />
                  </div>

                  {/* Options for Select/MultiSelect */}
                  {['select', 'multiselect'].includes(currentQuestion.questionType) && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Options *
                      </label>
                      <div className="space-y-2">
                        {currentQuestion.options.map((option, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <input
                              type="text"
                              value={option}
                              onChange={(e) => {
                                const newOptions = [...currentQuestion.options];
                                newOptions[index] = e.target.value;
                                setCurrentQuestion(prev => ({ ...prev, options: newOptions }));
                              }}
                              className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <button
                              onClick={() => {
                                const newOptions = currentQuestion.options.filter((_, idx) => idx !== index);
                                setCurrentQuestion(prev => ({ ...prev, options: newOptions }));
                              }}
                              className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                        <button
                          onClick={() => setCurrentQuestion(prev => ({ ...prev, options: [...prev.options, ''] }))}
                          className="flex items-center gap-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/30 p-2 rounded transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                          Add Option
                        </button>
                      </div>
                      {validationErrors.options && (
                        <p className="text-red-600 text-sm mt-1">{validationErrors.options}</p>
                      )}
                    </div>
                  )}
                </div>

                {/* Right Column - Validation Rules */}
                <div className="space-y-6">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                      <Zap className="w-5 h-5 text-yellow-500" />
                      Validation Rules
                    </h4>

                    {/* Required Toggle */}
                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg mb-4">
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">Required Field</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">User must fill this field</div>
                      </div>
                      <button
                        onClick={() => setCurrentQuestion(prev => ({ ...prev, isRequired: !prev.isRequired }))}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          currentQuestion.isRequired ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-600'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            currentQuestion.isRequired ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>

                    {/* Dynamic Validation Options */}
                    <div className="space-y-4">
                      {QUESTION_TYPES[currentQuestion.questionType]?.validations.map((validationType) => (
                        <div key={validationType} className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
                          {/* Validation configuration would go here */}
                          <div className="font-medium text-gray-900 dark:text-white mb-2">
                            {validationType.charAt(0).toUpperCase() + validationType.slice(1).replace(/([A-Z])/g, ' $1')}
                          </div>
                          {/* Specific validation inputs based on type */}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex items-center justify-end gap-3">
                <button
                  onClick={() => setShowQuestionBuilder(false)}
                  className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveQuestion}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
                >
                  <Save className="w-4 h-4" />
                  Save Question
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateTemplate;
