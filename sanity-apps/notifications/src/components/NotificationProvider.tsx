import React, { createContext, useContext, ReactNode } from "react";

interface NotificationContextType {
  // Add any shared state or methods here if needed
  refreshNotifications?: () => void;
}

const NotificationContext = createContext<NotificationContextType>({});

export function useNotificationContext() {
  return useContext(NotificationContext);
}

interface NotificationProviderProps {
  children: ReactNode;
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  const contextValue: NotificationContextType = {
    // Add any shared functionality here
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  );
}
