import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import { useAuth } from './contexts/Auth0Context';

const App: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  
  // Don't show sidebar and navbar on home page
  const isHomePage = location.pathname === '/';

  if (isHomePage) {
    return (
      <div className="min-h-screen">
        <Outlet />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <Navbar />
      <div className="flex flex-1">
        {isAuthenticated && <Sidebar />}
        <main className={`flex-1 overflow-y-auto ${isAuthenticated ? 'p-6' : 'p-4'}`}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default App;
