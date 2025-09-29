import React, { useState } from 'react';
import geminiApiService from '../../services/gemini-api';
import { Sparkles, Loader2 } from 'lucide-react';

const GeminiTestPage = () => {
  const [inputText, setInputText] = useState('hey can u check this real quick');
  const [formalizedText, setFormalizedText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleFormalize = async () => {
    if (!inputText.trim()) return;

    setLoading(true);
    try {
      const response = await geminiApiService.formalizeText(inputText);
      setResult(response);
      setFormalizedText(response.formalized);
    } catch (error) {
      console.error('Test failed:', error);
      setResult({ success: false, error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const testConnection = async () => {
    setLoading(true);
    try {
      const isWorking = await geminiApiService.testConnection();
      alert(`Gemini API ${isWorking ? 'is working!' : 'connection failed'}`);
    } catch (error) {
      alert(`Connection test failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-xl shadow-xl border-2 border-red-900/10 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-900 to-[#151E3D] p-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Gemini API Test</h1>
              <p className="text-white/80">Test the Google Gemini text formalization</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Test Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Casual Text to Formalize
            </label>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-900 focus:border-red-900 resize-none"
              rows={3}
              placeholder="Enter casual text here..."
            />
          </div>

          {/* Actions */}
          <div className="flex space-x-3">
            <button
              onClick={handleFormalize}
              disabled={loading || !inputText.trim()}
              className="flex items-center space-x-2 bg-red-900 text-white px-6 py-3 rounded-lg hover:bg-red-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4" />
              )}
              <span>Formalize Text</span>
            </button>

            <button
              onClick={testConnection}
              disabled={loading}
              className="flex items-center space-x-2 bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <span>Test API Connection</span>
            </button>
          </div>

          {/* Results */}
          {result && (
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Results</h3>
              
              <div className="space-y-4">
                {/* Success/Error Status */}
                <div className={`p-3 rounded-lg ${result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                  <div className="flex items-center space-x-2">
                    <span className={`w-2 h-2 rounded-full ${result.success ? 'bg-green-500' : 'bg-red-500'}`}></span>
                    <span className={`text-sm font-medium ${result.success ? 'text-green-800' : 'text-red-800'}`}>
                      {result.success ? 'Success' : 'Failed'} - Service: {result.service}
                    </span>
                  </div>
                </div>

                {/* Original Text */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Original:</label>
                  <div className="p-3 bg-gray-50 border rounded-lg">
                    <p className="text-gray-800">{result.original}</p>
                  </div>
                </div>

                {/* Formalized Text */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Formalized:</label>
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-blue-800 font-medium">{result.formalized}</p>
                  </div>
                </div>

                {/* Error Message */}
                {result.error && (
                  <div>
                    <label className="block text-sm font-medium text-red-700 mb-1">Error:</label>
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-red-800 text-sm">{result.error}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GeminiTestPage;