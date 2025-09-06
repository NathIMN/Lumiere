import React from 'react';
import { useTheme } from '../hooks/useTheme';
import { themeClasses } from '../utils/themeUtils';

const StatCard = ({ 
  title, 
  value, 
  icon: Icon, 
  iconColor = 'blue',
  trend,
  trendColor = 'green' 
}) => {
  const { isDark } = useTheme();

  const iconColorClasses = {
    blue: `${isDark ? 'bg-blue-900 text-blue-400' : 'bg-blue-100 text-blue-600'}`,
    green: `${isDark ? 'bg-green-900 text-green-400' : 'bg-green-100 text-green-600'}`,
    purple: `${isDark ? 'bg-purple-900 text-purple-400' : 'bg-purple-100 text-purple-600'}`,
    orange: `${isDark ? 'bg-orange-900 text-orange-400' : 'bg-orange-100 text-orange-600'}`,
    red: `${isDark ? 'bg-red-900 text-red-400' : 'bg-red-100 text-red-600'}`,
  };

  const trendColorClasses = {
    green: 'text-green-500',
    red: 'text-red-500',
    gray: isDark ? 'text-gray-400' : 'text-gray-500',
  };

  return (
    <div className={`p-6 rounded-lg shadow-sm border ${themeClasses.background.card(isDark)}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className={`text-sm ${themeClasses.text.secondary(isDark)}`}>
            {title}
          </p>
          <p className={`text-2xl font-bold ${themeClasses.text.primary(isDark)}`}>
            {value}
          </p>
          {trend && (
            <p className={`text-sm mt-1 ${trendColorClasses[trendColor]}`}>
              {trend}
            </p>
          )}
        </div>
        {Icon && (
          <div className={`p-3 rounded-lg ${iconColorClasses[iconColor]}`}>
            <Icon size={24} />
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;