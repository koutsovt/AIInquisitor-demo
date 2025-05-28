import React from 'react';
import { useNotification } from '../context/NotificationContext';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

const Notifications = () => {
  const { notifications, removeNotification } = useNotification();
  
  if (notifications.length === 0) {
    return null;
  }
  
  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2 w-full max-w-sm">
      {notifications.map((notification) => {
        const { id, message, type } = notification;
        
        const bgColor = type === 'success' 
          ? 'bg-green-50 border-green-400' 
          : type === 'error' 
            ? 'bg-red-50 border-red-400' 
            : 'bg-blue-50 border-blue-400';
            
        const textColor = type === 'success' 
          ? 'text-green-800' 
          : type === 'error' 
            ? 'text-red-800' 
            : 'text-blue-800';
            
        const Icon = type === 'success' 
          ? CheckCircle 
          : type === 'error' 
            ? AlertCircle 
            : Info;
            
        const iconColor = type === 'success' 
          ? 'text-green-500' 
          : type === 'error' 
            ? 'text-red-500' 
            : 'text-blue-500';
        
        return (
          <div 
            key={id}
            className={`${bgColor} border ${textColor} rounded-lg shadow-md p-4 pointer-events-auto animate-fade-in`}
            role="alert"
          >
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <Icon className={`h-5 w-5 ${iconColor}`} />
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium">{message}</p>
              </div>
              <div className="ml-4 flex-shrink-0 flex">
                <button
                  onClick={() => removeNotification(id)}
                  className={`inline-flex ${textColor} hover:opacity-75 focus:outline-none`}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Notifications;