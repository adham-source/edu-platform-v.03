import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth0, User as Auth0User } from '@auth0/auth0-react';
import { useDevice } from './DeviceContext';
import { authAPI, setDeviceInfo, setAuthTokenGetter } from '../api/apiClient';

interface User {
  id: string;
  username: string;
  email: string;
  roles: string[];
  auth0Id: string;
  picture?: string;
  name?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: () => void;
  logout: () => void;
  hasRole: (role: string) => boolean;
  auth0User: Auth0User | undefined;
  getAccessToken: () => Promise<string | undefined>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: () => {},
  logout: () => {},
  hasRole: () => false,
  auth0User: undefined,
  getAccessToken: async () => undefined,
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { 
    user: auth0User, 
    isAuthenticated: auth0IsAuthenticated, 
    isLoading: auth0IsLoading,
    loginWithRedirect,
    logout: auth0Logout,
    getAccessTokenSilently
  } = useAuth0();
  
  const { deviceId, deviceInfo, isLoading: deviceLoading } = useDevice();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Set up token getter for API client
  useEffect(() => {
    setAuthTokenGetter(getAccessTokenSilently);
  }, [getAccessTokenSilently]);

  useEffect(() => {
    if (!auth0IsLoading && !deviceLoading && deviceId && deviceInfo) {
      setDeviceInfo(deviceId, deviceInfo);
      
      if (auth0IsAuthenticated && auth0User) {
        handleAuthentication();
      } else {
        setIsLoading(false);
      }
    }
  }, [auth0IsLoading, deviceLoading, deviceId, deviceInfo, auth0IsAuthenticated, auth0User]);

  const handleAuthentication = async () => {
    try {
      if (!deviceId || !deviceInfo || !auth0User) {
        console.error('Device information or Auth0 user not available');
        return;
      }

      // Send device information and Auth0 user data to backend for verification
      const response = await authAPI.login(deviceId, deviceInfo, {
        auth0Id: auth0User.sub,
        email: auth0User.email,
        name: auth0User.name,
        picture: auth0User.picture,
      });
      
      if (response.data.user) {
        setUser({
          ...response.data.user,
          auth0Id: auth0User.sub || '',
          picture: auth0User.picture,
          name: auth0User.name,
        });
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
    loginWithRedirect();
  };

  const logout = async () => {
    try {
      if (auth0IsAuthenticated) {
        await authAPI.logout();
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      localStorage.clear();
      auth0Logout({ 
        logoutParams: { 
          returnTo: window.location.origin 
        } 
      });
    }
  };

  const getAccessToken = async (): Promise<string | undefined> => {
    try {
      if (auth0IsAuthenticated) {
        return await getAccessTokenSilently();
      }
      return undefined;
    } catch (error) {
      console.error('Error getting access token:', error);
      return undefined;
    }
  };

  const hasRole = (role: string): boolean => {
    return user?.roles?.includes(role) || false;
  };

  const value = {
    user,
    isAuthenticated: auth0IsAuthenticated,
    isLoading: isLoading || auth0IsLoading,
    login,
    logout,
    hasRole,
    auth0User,
    getAccessToken,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};