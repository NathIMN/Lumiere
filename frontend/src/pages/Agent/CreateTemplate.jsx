import React, { useState } from 'react';
import { X, Plus, Trash2, GripVertical, ChevronDown, ChevronUp } from 'lucide-react';
import insuranceApiService from '../../services/insurance-api';

const VALIDATION_PATTERNS = {
  'alphanumeric': {
    label: 'Alphanumeric (letters, numbers, spaces)',
    regex: '^[A-Za-z0-9 ]+$'
  },
  'alphanumeric-punctuation': {
    label: 'Alphanumeric with punctuation',
    regex: '^[A-Za-z0-9 ,.()-]+$'
  },
  'letters-only': {
    label: 'Letters only',
    regex: '^[A-Za-z .\'-]+$'
  },
  'uppercase-alphanumeric': {
    label: 'Uppercase letters and numbers',
    regex: '^[A-Z0-9-]+$'
  },
  'email': {
    label: 'Email address',
    regex: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$'
  },
  'phone': {
    label: 'Phone number',
    regex: '^[0-9+\\-\\s()]+$'
  },
  'numeric': {
    label: 'Numbers only',
    regex: '^[0-9]+$'
  },
  'postal-code': {
    label: 'Postal/ZIP code',
    regex: '^[A-Z0-9\\s-]+$'
  }
};

const QUESTION_TYPES = [
  { value: 'text', label: 'Text' },
  { value: 'number', label: 'Number' },
  { value: 'date', label: 'Date' },
  { value: 'boolean', label: 'Yes/No' },
  { value: 'select', label: 'Dropdown' },
  { value: 'file', label: 'File Upload' }
];

const CLAIM_OPTIONS = {
  life: ['hospitalization', 'channelling', 'medication', 'death'],
  vehicle: ['accident', 'theft', 'fire', 'naturalDisaster']
};

export const CreateTemplateModal = ({ isOpen, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    claimType: 'vehicle',
    claimOption: 'accident',
    title: '',
    description: '',
    sections: [
      {
        title: '',
        description: '',
        order: 1,
        questions: [
          {
            questionId: '',
            questionText: '',
            questionType: 'text',
            options: [],
            isRequired: true,
            validation: {},
            order: 1,
            helpText: ''
          }
        ]
      }
    ]
  });

  const [expandedSections, setExpandedSections] = useState([0]);

  const addSection = () => {
    setFormData({
      ...formData,
      sections: [
        ...formData.sections,
        {
          title: '',
          description: '',
          order: formData.sections.length + 1,
          questions: [
            {
              questionId: '',
              questionText: '',
              questionType: 'text',
              options: [],
              isRequired: true,
              validation: {},
              order: 1,
              helpText: ''
            }
          ]
        }
      ]
    });
    setExpandedSections([...expandedSections, formData.sections.length]);
  };

  const removeSection = (sectionIndex) => {
    const newSections = formData.sections.filter((_, i) => i !== sectionIndex);
    setFormData({ ...formData, sections: newSections });
    setExpandedSections(expandedSections.filter(i => i !== sectionIndex));
  };

  const updateSection = (sectionIndex, field, value) => {
    const newSections = [...formData.sections];
    newSections[sectionIndex][field] = value;
    setFormData({ ...formData, sections: newSections });
  };

  const addQuestion = (sectionIndex) => {
    const newSections = [...formData.sections];
    newSections[sectionIndex].questions.push({
      questionId: '',
      questionText: '',
      questionType: 'text',
      options: [],
      isRequired: true,
      validation: {},
      order: newSections[sectionIndex].questions.length + 1,
      helpText: ''
    });
    setFormData({ ...formData, sections: newSections });
  };

  const removeQuestion = (sectionIndex, questionIndex) => {
    const newSections = [...formData.sections];
    newSections[sectionIndex].questions = newSections[sectionIndex].questions.filter((_, i) => i !== questionIndex);
    setFormData({ ...formData, sections: newSections });
  };

  const updateQuestion = (sectionIndex, questionIndex, field, value) => {
    const newSections = [...formData.sections];
    newSections[sectionIndex].questions[questionIndex][field] = value;
    setFormData({ ...formData, sections: newSections });
  };

  const updateValidation = (sectionIndex, questionIndex, validationField, value) => {
    const newSections = [...formData.sections];
    const currentValidation = newSections[sectionIndex].questions[questionIndex].validation || {};
    newSections[sectionIndex].questions[questionIndex].validation = {
      ...currentValidation,
      [validationField]: value
    };
    setFormData({ ...formData, sections: newSections });
  };

  const addOption = (sectionIndex, questionIndex) => {
    const newSections = [...formData.sections];
    const currentOptions = newSections[sectionIndex].questions[questionIndex].options || [];
    newSections[sectionIndex].questions[questionIndex].options = [...currentOptions, ''];
    setFormData({ ...formData, sections: newSections });
  };

  const updateOption = (sectionIndex, questionIndex, optionIndex, value) => {
    const newSections = [...formData.sections];
    newSections[sectionIndex].questions[questionIndex].options[optionIndex] = value;
    setFormData({ ...formData, sections: newSections });
  };

  const removeOption = (sectionIndex, questionIndex, optionIndex) => {
    const newSections = [...formData.sections];
    newSections[sectionIndex].questions[questionIndex].options = 
      newSections[sectionIndex].questions[questionIndex].options.filter((_, i) => i !== optionIndex);
    setFormData({ ...formData, sections: newSections });
  };

  const toggleSection = (index) => {
    if (expandedSections.includes(index)) {
      setExpandedSections(expandedSections.filter(i => i !== index));
    } else {
      setExpandedSections([...expandedSections, index]);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await insuranceApiService.createQuestionnaireTemplate(formData);
      onSuccess && onSuccess(response);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to create template');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-800">Create Questionnaire Template</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          <div className="space-y-4 mb-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Claim Type *
                </label>
                <select
                  value={formData.claimType}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    claimType: e.target.value,
                    claimOption: CLAIM_OPTIONS[e.target.value][0]
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="life">Life</option>
                  <option value="vehicle">Vehicle</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Claim Option *
                </label>
                <select
                  value={formData.claimOption}
                  onChange={(e) => setFormData({ ...formData, claimOption: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {CLAIM_OPTIONS[formData.claimType].map(option => (
                    <option key={option} value={option}>
                      {option.charAt(0).toUpperCase() + option.slice(1).replace(/([A-Z])/g, ' $1')}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Template Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="2"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-800">Sections</h3>
              <button
                type="button"
                onClick={addSection}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                <Plus size={18} />
                Add Section
              </button>
            </div>

            {formData.sections.map((section, sIndex) => (
              <div key={sIndex} className="border border-gray-300 rounded-lg overflow-hidden">
                <div className="bg-gray-50 p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <GripVertical size={20} className="text-gray-400" />
                    <span className="font-medium text-gray-700">
                      Section {sIndex + 1}: {section.title || 'Untitled'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => toggleSection(sIndex)}
                      className="p-1 text-gray-600 hover:text-gray-800"
                    >
                      {expandedSections.includes(sIndex) ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </button>
                    {formData.sections.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeSection(sIndex)}
                        className="p-1 text-red-600 hover:text-red-800"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>
                </div>

                {expandedSections.includes(sIndex) && (
                  <div className="p-4 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Section Title *
                      </label>
                      <input
                        type="text"
                        value={section.title}
                        onChange={(e) => updateSection(sIndex, 'title', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Section Description
                      </label>
                      <input
                        type="text"
                        value={section.description}
                        onChange={(e) => updateSection(sIndex, 'description', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div className="space-y-3 mt-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-gray-700">Questions</h4>
                        <button
                          type="button"
                          onClick={() => addQuestion(sIndex)}
                          className="flex items-center gap-1 px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
                        >
                          <Plus size={16} />
                          Add Question
                        </button>
                      </div>

                      {section.questions.map((question, qIndex) => (
                        <div key={qIndex} className="bg-gray-50 p-4 rounded-md space-y-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-600">
                              Question {qIndex + 1}
                            </span>
                            {section.questions.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeQuestion(sIndex, qIndex)}
                                className="text-red-600 hover:text-red-800"
                              >
                                <Trash2 size={16} />
                              </button>
                            )}
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">
                                Question ID *
                              </label>
                              <input
                                type="text"
                                value={question.questionId}
                                onChange={(e) => updateQuestion(sIndex, qIndex, 'questionId', e.target.value)}
                                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">
                                Question Type *
                              </label>
                              <select
                                value={question.questionType}
                                onChange={(e) => updateQuestion(sIndex, qIndex, 'questionType', e.target.value)}
                                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                              >
                                {QUESTION_TYPES.map(type => (
                                  <option key={type.value} value={type.value}>{type.label}</option>
                                ))}
                              </select>
                            </div>
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Question Text *
                            </label>
                            <input
                              type="text"
                              value={question.questionText}
                              onChange={(e) => updateQuestion(sIndex, qIndex, 'questionText', e.target.value)}
                              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Help Text
                            </label>
                            <input
                              type="text"
                              value={question.helpText}
                              onChange={(e) => updateQuestion(sIndex, qIndex, 'helpText', e.target.value)}
                              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>

                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={question.isRequired}
                              onChange={(e) => updateQuestion(sIndex, qIndex, 'isRequired', e.target.checked)}
                              className="rounded"
                            />
                            <label className="text-xs text-gray-700">Required</label>
                          </div>

                          {question.questionType === 'select' && (
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">
                                Options
                              </label>
                              {(question.options || []).map((option, oIndex) => (
                                <div key={oIndex} className="flex gap-2 mb-2">
                                  <input
                                    type="text"
                                    value={option}
                                    onChange={(e) => updateOption(sIndex, qIndex, oIndex, e.target.value)}
                                    className="flex-1 px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder={`Option ${oIndex + 1}`}
                                  />
                                  <button
                                    type="button"
                                    onClick={() => removeOption(sIndex, qIndex, oIndex)}
                                    className="text-red-600 hover:text-red-800"
                                  >
                                    <X size={16} />
                                  </button>
                                </div>
                              ))}
                              <button
                                type="button"
                                onClick={() => addOption(sIndex, qIndex)}
                                className="text-xs text-blue-600 hover:text-blue-800"
                              >
                                + Add Option
                              </button>
                            </div>
                          )}

                          <details className="mt-2">
                            <summary className="text-xs font-medium text-gray-700 cursor-pointer hover:text-gray-900">
                              Validation Rules
                            </summary>
                            <div className="mt-2 space-y-2 pl-4">
                              {question.questionType === 'text' && (
                                <>
                                  <div>
                                    <label className="block text-xs text-gray-600 mb-1">
                                      Pattern Type
                                    </label>
                                    <select
                                      value={Object.keys(VALIDATION_PATTERNS).find(key => 
                                        VALIDATION_PATTERNS[key].regex === question.validation?.pattern
                                      ) || ''}
                                      onChange={(e) => updateValidation(
                                        sIndex, 
                                        qIndex, 
                                        'pattern', 
                                        e.target.value ? VALIDATION_PATTERNS[e.target.value].regex : ''
                                      )}
                                      className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                      <option value="">No pattern</option>
                                      {Object.entries(VALIDATION_PATTERNS).map(([key, val]) => (
                                        <option key={key} value={key}>{val.label}</option>
                                      ))}
                                    </select>
                                  </div>
                                  <div className="grid grid-cols-2 gap-2">
                                    <div>
                                      <label className="block text-xs text-gray-600 mb-1">Min Length</label>
                                      <input
                                        type="number"
                                        value={question.validation?.minLength || ''}
                                        onChange={(e) => updateValidation(sIndex, qIndex, 'minLength', e.target.value ? parseInt(e.target.value) : undefined)}
                                        className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-xs text-gray-600 mb-1">Max Length</label>
                                      <input
                                        type="number"
                                        value={question.validation?.maxLength || ''}
                                        onChange={(e) => updateValidation(sIndex, qIndex, 'maxLength', e.target.value ? parseInt(e.target.value) : undefined)}
                                        className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                      />
                                    </div>
                                  </div>
                                </>
                              )}

                              {(question.questionType === 'number' || question.questionType === 'date') && (
                                <div className="grid grid-cols-2 gap-2">
                                  <div>
                                    <label className="block text-xs text-gray-600 mb-1">Min</label>
                                    <input
                                      type="text"
                                      value={question.validation?.min || ''}
                                      onChange={(e) => updateValidation(sIndex, qIndex, 'min', e.target.value)}
                                      className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                      placeholder={question.questionType === 'date' ? 'e.g., 1yAgo, today' : 'Min value'}
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-xs text-gray-600 mb-1">Max</label>
                                    <input
                                      type="text"
                                      value={question.validation?.max || ''}
                                      onChange={(e) => updateValidation(sIndex, qIndex, 'max', e.target.value)}
                                      className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                      placeholder={question.questionType === 'date' ? 'e.g., today' : 'Max value'}
                                    />
                                  </div>
                                </div>
                              )}

                              <div>
                                <label className="block text-xs text-gray-600 mb-1">
                                  Validation Message
                                </label>
                                <input
                                  type="text"
                                  value={question.validation?.message || ''}
                                  onChange={(e) => updateValidation(sIndex, qIndex, 'message', e.target.value)}
                                  className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  placeholder="Custom error message"
                                />
                              </div>
                            </div>
                          </details>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 p-6 border-t">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
            disabled={loading}
          >
            {loading ? 'Creating...' : 'Create Template'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default function App() {

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            Questionnaire Template Manager
          </h1>
          <p className="text-gray-600 mb-6">
            Create and manage insurance claim questionnaire templates with sections, questions, and validation rules.
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            Create New Template
          </button>
        </div>
      </div>
    </div>
  );
}