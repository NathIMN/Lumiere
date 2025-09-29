import React, { createContext, useContext, useState, useCallback } from 'react';
import { ToastContainer } from '../components/common/Toast';

const ToastContext = createContext();

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((toast) => {
    const id = Date.now() + Math.random();
    const newToast = {
      id,
      type: 'info',
      duration: 5000,
      ...toast
    };

    setToasts(prev => [...prev, newToast]);

    // Auto remove after duration + animation time
    setTimeout(() => {
      removeToast(id);
    }, newToast.duration + 500);

    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const removeAllToasts = useCallback(() => {
    setToasts([]);
  }, []);

  // Convenience methods
  const toast = {
    success: (title, message, options) => addToast({ type: 'success', title, message, ...options }),
    error: (title, message, options) => addToast({ type: 'error', title, message, duration: 7000, ...options }),
    warning: (title, message, options) => addToast({ type: 'warning', title, message, ...options }),
    info: (title, message, options) => addToast({ type: 'info', title, message, ...options }),
    notification: (title, message, options) => addToast({ type: 'notification', title, message, ...options })
  };

  const value = {
    toasts,
    addToast,
    removeToast,
    removeAllToasts,
    toast
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer toasts={toasts} onRemoveToast={removeToast} />
    </ToastContext.Provider>
  );
};