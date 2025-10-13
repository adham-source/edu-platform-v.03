import React, { createContext, useContext, type ReactNode } from 'react';
import { Auth0Provider, useAuth0, User } from '@auth0/auth0-react';

// Auth0 Configuration
const auth0Config = {
  domain: import.meta.env.VITE_AUTH0_DOMAIN || 'your-tenant.auth0.com',
  clientId: import.meta.env.VITE_AUTH0_CLIENT_ID || 'your-client-id',
  authorizationParams: {
    redirect_uri: window.location.origin + '/callback',
    scope: 'openid profile email'
  },
  cacheLocation: 'localstorage' as const,
  useRefreshTokens: true
};

// Extended User interface with our custom fields
interface ExtendedUser extends User {
  role?: 'student' | 'instructor' | 'admin';
  deviceCount?: number;
  maxDevices?: number;
}

// Auth Context interface
interface AuthContextType {
  user: ExtendedUser | undefined;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: () => void;
  logout: () => void;
  getAccessToken: () => Promise<string>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth0 Provider Wrapper
export const Auth0ProviderWrapper: React.FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <Auth0Provider {...auth0Config}>
      <AuthContextProvider>
        {children}
      </AuthContextProvider>
    </Auth0Provider>
  );
};

// Auth Context Provider
const AuthContextProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const {
    user,
    isAuthenticated,
    isLoading,
    loginWithRedirect,
    logout: auth0Logout,
    getAccessTokenSilently
  } = useAuth0();

  const login = () => {
    loginWithRedirect({
      authorizationParams: {
        screen_hint: 'signup', // Show signup by default
        ui_locales: 'ar' // Arabic interface
      }
    });
  };

  const logout = () => {
    auth0Logout({
      logoutParams: {
        returnTo: window.location.origin
      }
    });
  };

  const getAccessToken = async (): Promise<string> => {
    try {
      return await getAccessTokenSilently();
    } catch (error) {
      console.error('Error getting access token:', error);
      throw error;
    }
  };

  // Extended user with custom fields
  const extendedUser: ExtendedUser | undefined = user ? {
    ...user,
    role: (user as any)?.['https://edu-platform.com/role'] || 'student',
    deviceCount: (user as any)?.['https://edu-platform.com/device_count'] || 0,
    maxDevices: 2
  } : undefined;

  const contextValue: AuthContextType = {
    user: extendedUser,
    isAuthenticated,
    isLoading,
    login,
    logout,
    getAccessToken
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use Auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within Auth0ProviderWrapper');
  }
  return context;
};

// Loading component
export const AuthLoading: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
      <p className="text-gray-600 text-lg">جاري تحميل المصادقة...</p>
    </div>
  </div>
);

// Protected Route component
export const ProtectedRoute: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading, login } = useAuth();

  if (isLoading) {
    return <AuthLoading />;
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-md">
          <div className="mb-6">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">تسجيل الدخول مطلوب</h2>
            <p className="text-gray-600 mb-6">يجب تسجيل الدخول للوصول إلى هذه الصفحة</p>
          </div>
          <button
            onClick={login}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105"
          >
            تسجيل الدخول
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default AuthContext;