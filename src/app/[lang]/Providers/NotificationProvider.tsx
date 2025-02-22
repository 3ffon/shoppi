"use client";
import React, { createContext, useContext, useState, useCallback } from 'react';
import { Snackbar, Alert } from '@mui/material';

type NotificationContextType = {
  showNotification: (message: string, severity?: 'success' | 'error' | 'warning' | 'info') => void;
};

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider = ({ children }: { children: React.ReactNode }) => {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [severity, setSeverity] = useState<'success' | 'error' | 'warning' | 'info'>('info');


  const showNotification = useCallback((message: string, severity?: 'success' | 'error' | 'warning' | 'info') => {
    setMessage(message);
    setSeverity(severity || 'info');
    setOpen(true);
  }, []);

  const handleClose = () => setOpen(false);

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}
      <Snackbar open={open} autoHideDuration={3000} onClose={handleClose}>
        <Alert onClose={handleClose} severity={severity} sx={{ width: '100%' }}>
          {message}
        </Alert>
      </Snackbar>
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};