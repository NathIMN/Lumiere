import React, { createContext, useContext } from 'react';
import { useMessaging } from '../../hooks/useMessaging';

const MessagingContext = createContext();

export const MessagingProvider = ({ children }) => {
  const messaging = useMessaging();
  
  return (
    <MessagingContext.Provider value={messaging}>
      {children}
    </MessagingContext.Provider>
  );
};

export const useMessagingContext = () => {
  const context = useContext(MessagingContext);
  if (!context) {
    throw new Error('useMessagingContext must be used within a MessagingProvider');
  }
  return context;
};