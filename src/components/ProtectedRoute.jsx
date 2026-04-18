import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-canvas">
        <div className="animate-pulse flex items-center justify-center space-x-2">
          <div className="w-3 h-3 bg-emerald/50 rounded-full"></div>
          <div className="w-3 h-3 bg-emerald/70 rounded-full"></div>
          <div className="w-3 h-3 bg-emerald rounded-full"></div>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    // Redirect to login page but save the current location they were trying to access
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;
