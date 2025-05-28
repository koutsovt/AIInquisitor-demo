import React from 'react';

interface ServiceStatusProps {
  url: string;
  onStatusChange?: (status: 'checking' | 'online' | 'offline') => void;
}

const ServiceStatus: React.FC<ServiceStatusProps> = ({ onStatusChange }) => {
  React.useEffect(() => {
    onStatusChange?.('online');
  }, [onStatusChange]);

  return null;
};

export default ServiceStatus;