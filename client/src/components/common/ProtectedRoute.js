// client/src/components/common/ProtectedRoute.js
import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import LoadingSpinner from './LoadingSpinner';

const ProtectedRoute = ({ children, role: requiredRole }) => {
  const { isLoading, user, role } = useAuth();

  if (isLoading) {
    return <LoadingSpinner />; 
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && requiredRole !== role) {
    const currentRolePath = role ? `/${role.toLowerCase()}/dashboard` : '/login';
    return <Navigate to={currentRolePath} replace />;
  }

  return children;
};

export default ProtectedRoute;