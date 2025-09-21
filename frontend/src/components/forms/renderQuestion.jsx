import React from 'react';
import { Upload, Calendar, AlertCircle } from 'lucide-react';

export const QuestionRenderer = ({ 
  question, 
  value, 
  errors, 
  onInputChange 
}) => {
  const hasError = errors[question.questionId];

  switch (question.questionType) {
    case 'text':
      return (
        <div key={question.questionId} className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            {question.questionText}
            {question.isRequired && <span className="text-red-500 ml-1">*</span>}
          </label>
          <input
            type="text"
            value={value}
            onChange={(e) => onInputChange(question.questionId, e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              hasError ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {hasError && (
            <p className="text-red-500 text-sm flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {errors[question.questionId]}
            </p>
          )}
        </div>
      );

    case 'number':
      return (
        <div key={question.questionId} className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            {question.questionText}
            {question.isRequired && <span className="text-red-500 ml-1">*</span>}
          </label>
          <input
            type="number"
            value={value}
            onChange={(e) => onInputChange(question.questionId, e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              hasError ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {hasError && (
            <p className="text-red-500 text-sm flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {errors[question.questionId]}
            </p>
          )}
        </div>
      );

    case 'date':
      return (
        <div key={question.questionId} className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            {question.questionText}
            {question.isRequired && <span className="text-red-500 ml-1">*</span>}
          </label>
          <div className="relative">
            <input
              type="date"
              value={value}
              onChange={(e) => onInputChange(question.questionId, e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                hasError ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            <Calendar className="absolute right-3 top-2.5 w-5 h-5 text-gray-400 pointer-events-none" />
          </div>
          {hasError && (
            <p className="text-red-500 text-sm flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {errors[question.questionId]}
            </p>
          )}
        </div>
      );

    case 'boolean':
      return (
        <div key={question.questionId} className="space-y-2">
          <div className="flex items-start space-x-3">
            <input
              type="checkbox"
              id={question.questionId}
              checked={value === true || value === 'true'}
              onChange={(e) => onInputChange(question.questionId, e.target.checked)}
              className={`mt-1 w-4 h-4 text-blue-600 border rounded focus:ring-blue-500 ${
                hasError ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            <label htmlFor={question.questionId} className="block text-sm font-medium text-gray-700">
              {question.questionText}
              {question.isRequired && <span className="text-red-500 ml-1">*</span>}
            </label>
          </div>
          {hasError && (
            <p className="text-red-500 text-sm flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {errors[question.questionId]}
            </p>
          )}
        </div>
      );

    case 'select':
      return (
        <div key={question.questionId} className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            {question.questionText}
            {question.isRequired && <span className="text-red-500 ml-1">*</span>}
          </label>
          <select
            value={value}
            onChange={(e) => onInputChange(question.questionId, e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              hasError ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            <option value="">Select an option</option>
            {question.options?.map((option, index) => (
              <option key={index} value={option}>{option}</option>
            ))}
          </select>
          {hasError && (
            <p className="text-red-500 text-sm flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {errors[question.questionId]}
            </p>
          )}
        </div>
      );

    case 'file':
      return (
        <div key={question.questionId} className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            {question.questionText}
            {question.isRequired && <span className="text-red-500 ml-1">*</span>}
          </label>
          <div className={`border-2 border-dashed rounded-lg p-6 text-center hover:border-gray-400 transition-colors ${
            hasError ? 'border-red-300' : 'border-gray-300'
          }`}>
            <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600 mb-2">Click to upload or drag and drop files here</p>
            <input
              type="file"
              multiple
              onChange={(e) => onInputChange(question.questionId, Array.from(e.target.files))}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            {value && Array.isArray(value) && (
              <div className="mt-2 text-sm text-gray-600">
                {value.length} file(s) selected
              </div>
            )}
          </div>
          {hasError && (
            <p className="text-red-500 text-sm flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {errors[question.questionId]}
            </p>
          )}
        </div>
      );

    default:
      return null;
  }
};
