import React from 'react';
import { useKeycloak } from '@react-keycloak/web';

interface UserProfile {
  username: string;
  email: string;
  roles: string[];
}

interface NavbarProps {
  userProfile: UserProfile | null;
}

const Navbar: React.FC<NavbarProps> = ({ userProfile }) => {
  const { keycloak } = useKeycloak();

  const handleLogout = () => {
    keycloak.logout();
  };

  return (
    <nav className="bg-gray-800 text-white p-4 flex justify-between items-center">
      <div className="text-lg font-bold">Misbah Edu Platform</div>
      <div>
        {userProfile ? (
          <span className="mx-2">Welcome, {userProfile.username}</span>
        ) : (
          <span className="mx-2">Loading User...</span>
        )}
        <a href="#" className="mx-2">Home</a>
        {userProfile && (
          <button onClick={handleLogout} className="mx-2 bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded text-sm">
            Logout
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
