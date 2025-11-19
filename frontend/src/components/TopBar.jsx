import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function TopBar({ onMenuToggle }) {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const goAuth = () => {
    if (isAuthenticated && user) {
      navigate(`/users/${user.id}`);
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="topbar">
      <button className="menu-btn" onClick={onMenuToggle}>☰</button>

      {isAuthenticated && (
        <div className="muted">
          {user.firstName} {user.lastName}
          {user.roles?.length > 0 && (
            <span> &nbsp;|&nbsp; {user.roles.join(', ')}</span>
          )}
        </div>
      )}

      <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
        <button className="btn primary" onClick={goAuth}>
          {isAuthenticated ? 'Mój profil' : 'Zaloguj'}
        </button>

        {isAuthenticated && (
          <button className="btn" onClick={logout}>
            Wyloguj
          </button>
        )}
      </div>
    </div>
  );
}
