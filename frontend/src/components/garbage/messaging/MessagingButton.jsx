import React from 'react';
import { MessageCircle, Bell } from 'lucide-react';

export const MessagingButton = ({ 
  onClick, 
  unreadCount = 0, 
  className = "",
  variant = "default", // default, compact, icon-only
  showBadge = true 
}) => {
  const baseClasses = "relative inline-flex items-center justify-center transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2";
  
  const variants = {
    default: "px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium",
    compact: "px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm",
    "icon-only": "p-2 text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
  };

  return (
    <button 
      onClick={onClick}
      className={`${baseClasses} ${variants[variant]} ${className}`}
      title="Open Messages"
    >
      <MessageCircle className={variant === "default" ? "w-5 h-5 mr-2" : "w-5 h-5"} />
      {variant === "default" && <span>Messages</span>}
      
      {showBadge && unreadCount > 0 && (
        <span className="absolute -top-2 -right-2 min-w-[20px] h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center px-1">
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </button>
  );
};