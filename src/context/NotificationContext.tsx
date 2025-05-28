import React, { createContext, useContext, useState, ReactNode } from 'react';

type NotificationType = 'success' | 'error' | 'info';

interface Notification {
  id: number;
  message: string;
  type: NotificationType;
}

interface NotificationContextType {
  notifications: Notification[];
  showNotification: (message: string, type: NotificationType) => void;
  removeNotification: (id: number) => void;
}

const NotificationContext = createContext<NotificationContextType>({
  notifications: [],
  showNotification: () => {},
  removeNotification: () => {},
});

export const useNotification = () => useContext(NotificationContext);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [nextId, setNextId] = useState(1);
  
  const showNotification = (message: string, type: NotificationType) => {
    const id = nextId;
    setNextId(prevId => prevId + 1);
    
    const notification = {
      id,
      message,
      type,
    };
    
    setNotifications(prevNotifications => [...prevNotifications, notification]);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
      removeNotification(id);
    }, 5000);
    
    return id;
  };
  
  const removeNotification = (id: number) => {
    setNotifications(prevNotifications => 
      prevNotifications.filter(notification => notification.id !== id)
    );
  };
  
  return (
    <NotificationContext.Provider value={{ 
      notifications, 
      showNotification, 
      removeNotification 
    }}>
      {children}
    </NotificationContext.Provider>
  );
};