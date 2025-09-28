import { Clock, CheckCircle, Users, FileText, TrendingUp, TrendingDown } from "lucide-react";

export const StatisticsCards = () => {
  const stats = [
    {
      title: "Pending Claims",
      value: "23",
      description: "Awaiting review",
      change: "+2",
      changeType: "increase",
      icon: Clock,
      iconBg: "bg-yellow-50 dark:bg-yellow-900/20",
      iconColor: "text-yellow-600 dark:text-yellow-400",
      valueColor: "text-gray-900 dark:text-white",
      descColor: "text-yellow-600 dark:text-yellow-400",
      clickable: true,
      action: "View pending claims"
    },
    {
      title: "Approved Today", 
      value: "12",
      description: "Claims processed",
      change: "+5",
      changeType: "increase",
      icon: CheckCircle,
      iconBg: "bg-green-50 dark:bg-green-900/20",
      iconColor: "text-green-600 dark:text-green-400",
      valueColor: "text-gray-900 dark:text-white",
      descColor: "text-green-600 dark:text-green-400",
      clickable: true,
      action: "View approved claims"
    },
    {
      title: "Total Employees",
      value: "156", 
      description: "Active policies",
      change: "-1",
      changeType: "decrease",
      icon: Users,
      iconBg: "bg-blue-50 dark:bg-blue-900/20",
      iconColor: "text-blue-600 dark:text-blue-400",
      valueColor: "text-gray-900 dark:text-white",
      descColor: "text-blue-600 dark:text-blue-400",
      clickable: true,
      action: "Manage employees"
    },
    {
      title: "Questionnaires",
      value: "8",
      description: "Available forms", 
      change: "+1",
      changeType: "increase",
      icon: FileText,
      iconBg: "bg-purple-50 dark:bg-purple-900/20",
      iconColor: "text-purple-600 dark:text-purple-400",
      valueColor: "text-gray-900 dark:text-white",
      descColor: "text-purple-600 dark:text-purple-400",
      clickable: true,
      action: "View questionnaires"
    },
  ];

  const handleCardClick = (action) => {
    console.log(`Action: ${action}`);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => {
        const IconComponent = stat.icon;
        const TrendIcon = stat.changeType === 'increase' ? TrendingUp : TrendingDown;
        const trendColor = stat.changeType === 'increase' ? 'text-green-500 dark:text-green-400' : 'text-red-500 dark:text-red-400';
        
        return (
          <div
            key={index}
            onClick={() => handleCardClick(stat.action)}
            className={`bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 transition-all duration-300 hover:shadow-xl hover:border-gray-300 dark:hover:border-gray-600 ${
              stat.clickable ? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-750 transform hover:-translate-y-1' : ''
            }`}
            title={stat.clickable ? `Click to ${stat.action}` : ''}
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-full ${stat.iconBg} transition-transform duration-200 hover:scale-110`}>
                <IconComponent className={`w-8 h-8 ${stat.iconColor}`} />
              </div>
              
              {/* Trend Indicator */}
              <div className={`flex items-center gap-1 text-xs ${trendColor}`}>
                <TrendIcon className="w-3 h-3" />
                {stat.change}
              </div>
            </div>

            <div>
              <div className={`text-3xl font-bold ${stat.valueColor} mb-1`}>
                {stat.value}
              </div>
              <div className={`text-sm font-medium ${stat.descColor} mb-1`}>
                {stat.title}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {stat.description}
              </div>
            </div>

            {/* Hover Action Hint */}
            {stat.clickable && (
              <div className="mt-3 text-xs text-gray-400 dark:text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                Click to {stat.action.toLowerCase()}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
