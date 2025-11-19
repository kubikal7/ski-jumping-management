import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, requiredRoles = [] }){
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  if (requiredRoles && requiredRoles.length > 0) {
    const roles = user?.roles || [];
    const ok = requiredRoles.some(r => roles.includes(r));
    if (!ok) return <div className="card">Brak uprawnień</div>;
  }

  return children;
}
