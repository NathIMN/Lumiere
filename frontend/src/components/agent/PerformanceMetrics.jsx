import { useState } from 'react';
import { BarChart3, Target, Clock, Info } from "lucide-react";

export const PerformanceMetrics = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('This Month');
  const [showTooltip, setShowTooltip] = useState(null);

  const metrics = [
    {
      label: "Claims Processed",
      value: 87,
      total: 100,
      color: "bg-blue-500",
      textColor: "text-blue-500 dark:text-blue-400",
      displayValue: "87/100",
      target: 90,
      tooltip: "Claims successfully processed this month. Target: 90",
      icon: BarChart3
    },
    {
      label: "Approval Rate", 
      value: 94,
      total: 100,
      color: "bg-green-500",
      textColor: "text-green-500 dark:text-green-400",
      displayValue: "94%",
      target: 85,
      tooltip: "Percentage of claims approved. Target: 85%",
      icon: Target
    },
    {
      label: "Response Time",
      value: 77,
      total: 100, 
      color: "bg-purple-500",
      textColor: "text-purple-500 dark:text-purple-400",
      displayValue: "2.3 days avg",
      target: 80,
      tooltip: "Average response time for claims. Target: <3 days",
      icon: Clock
    },
  ];

  const getPerformanceStatus = (value, target) => {
    if (value >= target) return { status: 'excellent', color: 'text-green-500 dark:text-green-400' };
    if (value >= target * 0.8) return { status: 'good', color: 'text-yellow-500 dark:text-yellow-400' };
    return { status: 'needs improvement', color: 'text-red-500 dark:text-red-400' };
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
      {/* Enhanced Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Performance Overview
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Your claim processing statistics
          </p>
        </div>
        
        <select
          value={selectedPeriod}
          onChange={(e) => setSelectedPeriod(e.target.value)}
          className="px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white text-sm focus:outline-none focus:border-blue-500"
        >
          <option value="This Week">This Week</option>
          <option value="This Month">This Month</option>
          <option value="Last Month">Last Month</option>
          <option value="This Quarter">This Quarter</option>
        </select>
      </div>

      <div className="space-y-6">
        {metrics.map((metric, index) => {
          const performance = getPerformanceStatus(metric.value, metric.target);
          const IconComponent = metric.icon;
          
          return (
            <div key={index} className="relative">
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                  <IconComponent className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {metric.label}
                  </span>
                  <button
                    onMouseEnter={() => setShowTooltip(index)}
                    onMouseLeave={() => setShowTooltip(null)}
                    className="relative"
                  >
                    <Info className="w-4 h-4 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300" />
                    
                    {showTooltip === index && (
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded-lg whitespace-nowrap z-10 border border-gray-700 dark:border-gray-600">
                        {metric.tooltip}
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900 dark:border-t-gray-700"></div>
                      </div>
                    )}
                  </button>
                </div>
                
                <div className="flex items-center gap-3">
                  <span className={`text-sm font-semibold ${metric.textColor}`}>
                    {metric.displayValue}
                  </span>
                  <span className={`text-xs font-medium ${performance.color}`}>
                    {performance.status}
                  </span>
                </div>
              </div>
              
              <div className="relative">
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                  <div
                    className={`h-3 rounded-full ${metric.color} transition-all duration-700 ease-out relative`}
                    style={{ width: `${(metric.value / metric.total) * 100}%` }}
                  >
                    {/* Animated shine effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
                  </div>
                </div>
                
                {/* Target indicator */}
                <div 
                  className="absolute top-0 h-3 w-0.5 bg-gray-500 dark:bg-gray-400"
                  style={{ left: `${(metric.target / metric.total) * 100}%` }}
                  title={`Target: ${metric.target}%`}
                >
                </div>
              </div>
              
              <div className="flex justify-between mt-1 text-xs text-gray-400 dark:text-gray-500">
                <span>0</span>
                <span className="text-gray-500 dark:text-gray-400">Target: {metric.target}</span>
                <span>{metric.total}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Overall Performance Summary */}
      <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-750 rounded-lg border border-gray-200 dark:border-gray-600">
        <div className="flex items-center gap-2 mb-2">
          <Target className="w-5 h-5 text-blue-500 dark:text-blue-400" />
          <h3 className="font-semibold text-gray-900 dark:text-white">Overall Performance</h3>
        </div>
        <p className="text-green-600 dark:text-green-400 font-medium">Excellent performance this month!</p>
        <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
          You're exceeding targets in most areas. Keep up the great work!
        </p>
      </div>
    </div>
  );
};
