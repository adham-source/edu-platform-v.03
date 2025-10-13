import React from 'react';
import { Link } from 'react-router-dom';

const Sidebar: React.FC = () => {
  return (
    <div className="bg-gray-700 text-white w-64 p-4 space-y-4">
      <div className="text-xl font-bold">Dashboard</div>
      <nav>
        <Link to="/dashboard" className="block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-600">
          Overview
        </Link>
        <Link to="/dashboard/student" className="block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-600">
          Student Dashboard
        </Link>
        <Link to="/dashboard/teacher" className="block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-600">
          Teacher Dashboard
        </Link>
        <Link to="/dashboard/admin" className="block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-600">
          Admin Dashboard
        </Link>
        <Link to="/courses" className="block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-600">
          Courses
        </Link>
        <Link to="/courses" className="block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-600">
          Courses
        </Link>
        <Link to="/users" className="block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-600">
          Users
        </Link>
      </nav>
    </div>
  );
};

export default Sidebar;
