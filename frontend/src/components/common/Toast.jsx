import React, { useState, useEffect } from 'react';
import { X, CheckCircle, AlertTriangle, XCircle, Info, Bell } from 'lucide-react';

const Toast = ({ 
  id, 
  type = 'info', 
  title, 
  message, 
  duration = 5000,
  onClose 
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Slide in animation
    const timer1 = setTimeout(() => setIsVisible(true), 10);
    
    // Auto close timer
    const timer2 = setTimeout(() => {
      handleClose();
    }, duration);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [duration]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      onClose(id);
    }, 300); // Match the transition duration
  };

  const getToastStyles = () => {
    const baseStyles = "relative flex items-start gap-3 p-4 rounded-lg shadow-lg border transition-all duration-300 transform min-w-80 max-w-md";
    
    const typeStyles = {
      success: "bg-green-50 border-green-200 text-green-800",
      error: "bg-red-50 border-red-200 text-red-800", 
      warning: "bg-yellow-50 border-yellow-200 text-yellow-800",
      info: "bg-blue-50 border-blue-200 text-blue-800",
      notification: "bg-purple-50 border-purple-200 text-purple-800"
    };

    const animationStyles = isExiting 
      ? "translate-x-full opacity-0" 
      : isVisible 
        ? "translate-x-0 opacity-100" 
        : "translate-x-full opacity-0";

    return `${baseStyles} ${typeStyles[type]} ${animationStyles}`;
  };

  const getIcon = () => {
    const iconProps = { className: "w-5 h-5 flex-shrink-0 mt-0.5" };
    
    switch (type) {
      case 'success':
        return <CheckCircle {...iconProps} className="w-5 h-5 flex-shrink-0 mt-0.5 text-green-600" />;
      case 'error':
        return <XCircle {...iconProps} className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-600" />;
      case 'warning':
        return <AlertTriangle {...iconProps} className="w-5 h-5 flex-shrink-0 mt-0.5 text-yellow-600" />;
      case 'notification':
        return <Bell {...iconProps} className="w-5 h-5 flex-shrink-0 mt-0.5 text-purple-600" />;
      default:
        return <Info {...iconProps} className="w-5 h-5 flex-shrink-0 mt-0.5 text-blue-600" />;
    }
  };

  return (
    <div className={getToastStyles()}>
      {/* Icon */}
      {getIcon()}
      
      {/* Content */}
      <div className="flex-1 min-w-0">
        {title && (
          <h4 className="font-medium text-sm leading-tight mb-1">
            {title}
          </h4>
        )}
        {message && (
          <p className="text-sm opacity-90 leading-relaxed">
            {message}
          </p>
        )}
      </div>

      {/* Close button */}
      <button
        onClick={handleClose}
        className="flex-shrink-0 p-1 hover:bg-black hover:bg-opacity-10 rounded transition-colors"
        aria-label="Close notification"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

const ToastContainer = ({ toasts, onRemoveToast }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-3 pointer-events-none">
      <div className="space-y-2">
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto">
            <Toast
              {...toast}
              onClose={onRemoveToast}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export { Toast, ToastContainer };