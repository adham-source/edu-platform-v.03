import React, { createContext, useContext, useEffect, useState } from 'react';
import { useKeycloak } from '@react-keycloak/web';
import { useDevice } from './DeviceContext';
import { authAPI, setDeviceInfo } from '../api/apiClient';

interface User {
  id: string;
  username: string;
  email: string;
  roles: string[];
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: () => void;
  logout: () => void;
  hasRole: (role: string) => boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: () => {},
  logout: () => {},
  hasRole: () => false,
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { keycloak, initialized } = useKeycloak();
  const { deviceId, deviceInfo, isLoading: deviceLoading } = useDevice();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (initialized && !deviceLoading && deviceId && deviceInfo) {
      setDeviceInfo(deviceId, deviceInfo);
      
      if (keycloak.authenticated) {
        handleAuthentication();
      } else {
        setIsLoading(false);
      }
    }
  }, [initialized, deviceLoading, deviceId, deviceInfo, keycloak.authenticated]);

  const handleAuthentication = async () => {
    try {
      if (!deviceId || !deviceInfo) {
        console.error('Device information not available');
        return;
      }

      // Send device information to backend for verification
      const response = await authAPI.login(deviceId, deviceInfo);
      
      if (response.data.user) {
        setUser(response.data.user);
      }
    } catch (error: any) {
      console.error('Authentication error:', error);
      
      if (error.response?.data?.code === 'DEVICE_LIMIT_EXCEEDED') {
        alert('تم تجاوز الحد الأقصى للأجهزة المسموح بها (جهازين فقط). تم إغلاق حسابك لأسباب أمنية.');
        logout();
      } else if (error.response?.data?.code === 'ACCOUNT_DISABLED') {
        alert('تم إيقاف حسابك. يرجى التواصل مع الدعم الفني.');
        logout();
      }
    } finally {
      setIsLoading(false);
    }
  };

  const login = () => {
    keycloak.login();
  };

  const logout = async () => {
    try {
      if (keycloak.authenticated) {
        await authAPI.logout();
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      localStorage.clear();
      keycloak.logout();
    }
  };

  const hasRole = (role: string): boolean => {
    return user?.roles?.includes(role) || false;
  };

  const value = {
    user,
    isAuthenticated: keycloak.authenticated || false,
    isLoading,
    login,
    logout,
    hasRole,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};