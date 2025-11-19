// client/src/components/common/Navbar.js
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  
  // Safely determine path, default to /admin for preview
  const dashboardPath = user ? `/${user.role.toLowerCase()}` : '/admin'; 
  const displayRole = user ? user.role : 'GUEST (Preview)';

  return (
    <nav className="bg-gray-800 p-4 shadow-md">
      <div className="flex justify-between items-center max-w-7xl mx-auto">
        
        {/* Logo/Title */}
        <Link to={dashboardPath} className="text-white text-xl font-bold">
          Digital Lab Records
        </Link>
        
        {/* User Info & Logout */}
        <div className="flex items-center space-x-4">
          <span className="text-gray-300 text-sm">
            Role: 
            <span className="font-semibold text-white ml-1">
              {displayRole} 
            </span>
          </span>
          {/* Only show Logout button if authenticated */}
          {user ? (
            <button 
              onClick={logout}
              className="bg-red-600 hover:bg-red-700 text-white text-sm font-medium py-1 px-3 rounded transition duration-200"
            >
              Logout
            </button>
          ) : (
            <Link 
              to="/login"
              className="bg-green-600 hover:bg-green-700 text-white text-sm font-medium py-1 px-3 rounded transition duration-200"
            >
              Go to Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;