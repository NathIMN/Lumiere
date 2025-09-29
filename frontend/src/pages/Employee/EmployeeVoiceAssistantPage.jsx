import React from 'react';
import EmployeeVoiceAssistant from '../../components/EmployeeVoiceAssistant';

export const EmployeeVoiceAssistantPage = () => {
  return (
    <div className="employee-voice-assistant-page p-6 bg-gray-50 dark:bg-neutral-900 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
            Voice Assistant
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Get instant help with your insurance questions using our voice-powered assistant.
          </p>
        </div>

        {/* Voice Assistant Component */}
        <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-md">
          <EmployeeVoiceAssistant />
        </div>

        {/* Quick Reference Section */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-neutral-800 rounded-lg p-6 shadow-md">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
              📋 Claims & Processing
            </h3>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
              <li>• How to submit a claim</li>
              <li>• Required documents for claims</li>
              <li>• Checking claim status</li>
              <li>• Claim processing timeframes</li>
              <li>• What to do if claim is denied</li>
            </ul>
          </div>

          <div className="bg-white dark:bg-neutral-800 rounded-lg p-6 shadow-md">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
              📜 Policies & Coverage
            </h3>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
              <li>• Viewing your policies</li>
              <li>• Understanding your coverage</li>
              <li>• Policy renewal information</li>
              <li>• Adding beneficiaries</li>
              <li>• Deductible information</li>
            </ul>
          </div>

          <div className="bg-white dark:bg-neutral-800 rounded-lg p-6 shadow-md">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
              ⚙️ Account & System
            </h3>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
              <li>• Password reset help</li>
              <li>• Updating personal information</li>
              <li>• Browser compatibility</li>
              <li>• Downloading documents</li>
              <li>• System navigation tips</li>
            </ul>
          </div>

          <div className="bg-white dark:bg-neutral-800 rounded-lg p-6 shadow-md">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
              📞 Support & Contact
            </h3>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
              <li>• How to contact support</li>
              <li>• Business hours information</li>
              <li>• Emergency claim reporting</li>
              <li>• Live chat availability</li>
              <li>• Support ticket submission</li>
            </ul>
          </div>
        </div>

        {/* Usage Tips */}
        <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-300 mb-3">
            💡 How to Use the Voice Assistant
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-700 dark:text-blue-300">
            <div>
              <h4 className="font-medium mb-2">Getting Started:</h4>
              <ol className="space-y-1 list-decimal list-inside">
                <li>Click "Start Voice Assistant"</li>
                <li>Allow microphone permissions</li>
                <li>Wait for the greeting</li>
                <li>Ask your question clearly</li>
              </ol>
            </div>
            <div>
              <h4 className="font-medium mb-2">Sample Questions:</h4>
              <ul className="space-y-1">
                <li>• "How do I submit a claim?"</li>
                <li>• "What documents do I need?"</li>
                <li>• "How do I reset my password?"</li>
                <li>• "What does my policy cover?"</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Contact Fallback */}
        <div className="mt-6 text-center text-gray-600 dark:text-gray-400">
          <p className="text-sm">
            Need personalized help? Contact our support team at{' '}
            <a href="tel:1-800-LUMIERE" className="text-blue-600 dark:text-blue-400 font-medium">
              1-800-LUMIERE
            </a>{' '}
            or use the live chat in your dashboard.
          </p>
        </div>
      </div>
    </div>
  );
};

export default EmployeeVoiceAssistantPage;