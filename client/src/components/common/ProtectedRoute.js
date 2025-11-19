// client/src/components/common/ProtectedRoute.js
import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuth, loading, user } = useAuth();

  if (loading) {
    return <div className="text-center p-8 text-lg">Initializing...</div>; 
  }
  
  // Original secure logic (commented out for preview):
  // if (!isAuth) {
  //   return <Navigate to="/login" replace />;
  // }
  // if (allowedRoles && !allowedRoles.includes(user.role)) {
  //   return <Navigate to="/error/403" replace />;
  // }

  // TEMPORARY: Render children wrapped in the layout defined in App.js
  return children;
};

export default ProtectedRoute;