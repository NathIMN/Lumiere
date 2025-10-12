import React from 'react';
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Coins, 
  Users, 
  TrendingUp,
  Heart,
  Car
} from 'lucide-react';

const StatisticsCard = ({ 
  icon: IconComponent, 
  iconColor = "bg-gray-800", 
  title, 
  value, 
  change,
  changeType = "positive" // "positive", "negative", "neutral"
}) => {
  const getChangeColor = () => {
    switch (changeType) {
      case "positive": return "text-green-500";
      case "negative": return "text-red-500";
      default: return "text-gray-500";
    }
  };

  return (
    <div className="relative rounded-2xl shadow-xl p-6 pl-20 min-h-[120px] bg-[url('/card-bg10.jpeg')] bg-cover bg-center bg-no-repeat relative">
      {/* Icon Container - positioned to "pop out" */}
      <div className={`absolute left-6 -top-6 w-16 h-16 ${iconColor} rounded-xl flex items-center justify-center shadow-lg`}>
        <IconComponent className="w-8 h-8 text-white" />
      </div>
      
      {/* Card Content */}
      <div className="flex flex-col justify-between h-full">
        {/* Title and Value */}
        <div className="text-right">
          <p className="text-gray-700 text-md font-medium mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-800">{value}</p>
        </div>
        
        
      </div>
    </div>
  );
};

// Example usage component
export const DashboardStats = () => {
  const statsData = [
    {
      icon: FileText,
      iconColor: "bg-gradient-to-br from-neutral-400 to-neutral-500",
      title: "Total Claims",
      value: "142",
      change: "12%",
      changeType: "positive"
    },
    {
      icon: Clock,
      iconColor: "bg-gradient-to-br from-blue-400 to-blue-500",
      title: "Pending Review",
      value: "28",
      change: "5%",
      changeType: "positive"
    },
    {
      icon: CheckCircle,
      iconColor: "bg-gradient-to-br from-green-400 to-green-500",
      title: "Approved",
      value: "98",
      change: "18%",
      changeType: "positive"
    },
    {
      icon: XCircle,
      iconColor: "bg-gradient-to-br from-rose-400 to-rose-500",
      title: "Rejected",
      value: "16",
      change: "3%",
      changeType: "negative"
    }
  ];

  return (
    <div className="p-8 min-h-screen">
      <h1 className="text-2xl font-bold text-gray-800 mb-8">Claims Dashboard Statistics</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {statsData.map((stat, index) => (
          <StatisticsCard
            key={index}
            icon={stat.icon}
            iconColor={stat.iconColor}
            title={stat.title}
            value={stat.value}
            change={stat.change}
            changeType={stat.changeType}
          />
        ))}
      </div>
    </div>
  );
};

