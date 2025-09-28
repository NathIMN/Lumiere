import React from 'react';
import { Home, ArrowLeft, RefreshCw, AlertTriangle } from 'lucide-react';

export const PageNotFound = () => {
  const handleGoHome = () => {
    window.location.href = '/';
  };

  const handleGoBack = () => {
    window.history.back();
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full text-center">
        {/* Animated 404 */}
        <div className="mb-8 relative">
          <div className="text-9xl font-bold text-blue-200 dark:text-blue-900 select-none">
            404
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-24 h-24 bg-blue-600 dark:bg-blue-500 rounded-full flex items-center justify-center animate-bounce">
              <AlertTriangle className="w-12 h-12 text-white" />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Page Not Found
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
            Sorry, we couldn't find the page you're looking for. The page might have been moved, 
            deleted, or you may have entered an incorrect URL.
          </p>
          
          {/* Current URL Display */}
          <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
              You tried to visit:
            </p>
            <code className="text-sm font-mono text-red-600 dark:text-red-400 break-all">
              {window.location.pathname}
            </code>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleGoHome}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors duration-200 shadow-md hover:shadow-lg"
            >
              <Home className="w-5 h-5" />
              Go to Home
            </button>
            
            <button
              onClick={handleGoBack}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors duration-200 shadow-md hover:shadow-lg"
            >
              <ArrowLeft className="w-5 h-5" />
              Go Back
            </button>
            
            <button
              onClick={handleRefresh}
              className="flex items-center justify-center gap-2 px-6 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg font-medium transition-colors duration-200"
            >
              <RefreshCw className="w-5 h-5" />
              Refresh Page
            </button>
          </div>
        </div>

        {/* Help Text */}
        <div className="text-gray-500 dark:text-gray-400">
          <p className="text-sm mb-2">
            If you believe this is an error, please contact our support team.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center text-sm">
            <a 
              href="mailto:support@janashakthi.lk" 
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              support@janashakthi.lk
            </a>
            <span className="hidden sm:inline text-gray-300 dark:text-gray-600">|</span>
            <a 
              href="tel:+94112345678" 
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              +94 11 234 5678
            </a>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-10 left-10 w-20 h-20 bg-blue-200 dark:bg-blue-800 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute bottom-10 right-10 w-32 h-32 bg-indigo-200 dark:bg-indigo-800 rounded-full opacity-20 animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 right-20 w-16 h-16 bg-purple-200 dark:bg-purple-800 rounded-full opacity-20 animate-pulse delay-500"></div>
      </div>
    </div>
  );
};

