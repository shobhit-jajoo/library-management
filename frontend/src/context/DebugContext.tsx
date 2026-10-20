import React, { createContext, useContext, useState, useEffect } from 'react';
import { ApiDebugEntry } from '../types';
import { setDebugListener } from '../api/client';

interface DebugContextType {
  logs: ApiDebugEntry[];
  clearLogs: () => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const DebugContext = createContext<DebugContextType | undefined>(undefined);

export const DebugProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [logs, setLogs] = useState<ApiDebugEntry[]>([]);
  const [isOpen, setIsOpen] = useState<boolean>(false);

  useEffect(() => {
    setDebugListener((entry: ApiDebugEntry) => {
      setLogs((prev) => [entry, ...prev.slice(0, 99)]); // Keep last 100 requests
    });

    return () => {
      setDebugListener(null);
    };
  }, []);

  const clearLogs = () => {
    setLogs([]);
  };

  return (
    <DebugContext.Provider value={{ logs, clearLogs, isOpen, setIsOpen }}>
      {children}
    </DebugContext.Provider>
  );
};

export const useDebug = (): DebugContextType => {
  const context = useContext(DebugContext);
  if (!context) {
    throw new Error('useDebug must be used within a DebugProvider');
  }
  return context;
};
