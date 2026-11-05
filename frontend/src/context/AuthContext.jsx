import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService, notificationService } from '../services/api';
import { initSocket, disconnectSocket, getSocket } from '../services/socket';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Load user from token on startup
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('urbanpulse_token');
      if (token) {
        try {
          const res = await authService.getMe();
          setUser(res.data.user);
          initSocket(res.data.user);
          loadNotifications();
        } catch (err) {
          console.warn('Session expired or invalid token');
          localStorage.removeItem('urbanpulse_token');
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const loadNotifications = async () => {
    try {
      const res = await notificationService.getMy();
      setNotifications(res.data.notifications || []);
      setUnreadCount(res.data.unreadCount || 0);
    } catch (e) {
      console.warn('Could not load notifications:', e.message);
    }
  };

  // Setup Socket listeners for incoming alerts
  useEffect(() => {
    if (!user) return;
    const socket = getSocket();
    if (!socket) return;

    const handleComplaintUpdate = (complaint) => {
      loadNotifications();
    };

    const handleNewComplaint = (complaint) => {
      loadNotifications();
    };

    socket.on('complaint_updated', handleComplaintUpdate);
    socket.on('new_complaint', handleNewComplaint);

    return () => {
      socket.off('complaint_updated', handleComplaintUpdate);
      socket.off('new_complaint', handleNewComplaint);
    };
  }, [user]);

  const login = async (email, password) => {
    const res = await authService.login({ email, password });
    const { token, user: loggedUser } = res.data;
    localStorage.setItem('urbanpulse_token', token);
    setUser(loggedUser);
    initSocket(loggedUser);
    loadNotifications();
    return loggedUser;
  };

  const register = async (userData) => {
    const res = await authService.register(userData);
    const { token, user: registeredUser } = res.data;
    localStorage.setItem('urbanpulse_token', token);
    setUser(registeredUser);
    initSocket(registeredUser);
    loadNotifications();
    return registeredUser;
  };

  const logout = () => {
    localStorage.removeItem('urbanpulse_token');
    disconnectSocket();
    setUser(null);
    setNotifications([]);
    setUnreadCount(0);
  };

  // Demo user quick login
  const switchDemoRole = async (role) => {
    const credentials = {
      citizen: { email: 'citizen@urbanpulse.io', password: 'password123' },
      authority: { email: 'authority@urbanpulse.io', password: 'password123' },
      admin: { email: 'admin@urbanpulse.io', password: 'password123' },
    }[role];

    if (credentials) {
      return await login(credentials.email, credentials.password);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        notifications,
        unreadCount,
        login,
        register,
        logout,
        switchDemoRole,
        refreshNotifications: loadNotifications,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
