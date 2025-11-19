import React, { useState, useEffect } from 'react';
import { Outlet, useLocation, Navigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import { useAuth } from '../context/AuthContext';

export default function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, loading, verifyAuth, isAuthenticated } = useAuth();
  const location = useLocation();

  useEffect(() => {
    verifyAuth().catch(() => { });
    setMobileOpen(false);
  }, [location.pathname]);

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner">Ładowanie...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!user) {
    return null;
  }

  return (
    <div className={`app-shell ${mobileOpen ? 'mobile-sidebar-open' : ''}`}>
      <TopBar onMenuToggle={() => setMobileOpen(v => !v)} className="topbar" />
      <Sidebar open={mobileOpen} onClose={() => setMobileOpen(false)} className={`sidebar ${mobileOpen ? 'open' : ''}`} />
      {mobileOpen && <div className="overlay" onClick={() => setMobileOpen(false)} />}
      <main className="content">
        <Outlet />
      </main>
    </div>
  );
}
