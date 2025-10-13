import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import { useKeycloak } from '@react-keycloak/web';
import apiClient from './api/apiClient';

interface UserProfile {
  username: string;
  email: string;
  roles: string[];
}

const App: React.FC = () => {
  const { keycloak, initialized } = useKeycloak();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    if (initialized && keycloak.authenticated) {
      apiClient.get<UserProfile>('/profile')
        .then(response => {
          setUserProfile(response.data);
        })
        .catch(error => {
          console.error("Error fetching user profile:", error);
        });
    }
  }, [initialized, keycloak.authenticated]);

  return (
    <div className="flex flex-col h-screen">
      <Navbar userProfile={userProfile} />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-4 overflow-y-auto bg-gray-100">
          <Outlet /> {/* Renders the current route's component */}
        </main>
      </div>
    </div>
  );
};

export default App;
