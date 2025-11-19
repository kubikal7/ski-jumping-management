import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const items = [
  { to: '/', label: 'Kalendarz', roles: [] },
  { to: '/users', label: 'Użytkownicy', roles: ['ADMIN','MANAGER'] },
  { to: '/athletes', label: 'Zawodnicy', roles: ['ADMIN','TRAINER'] },
  { to: '/teams', label: 'Drużyny', roles: ['ADMIN','MANAGER'] },
  { to: '/my-teams', label: 'Moje Drużyny', roles: [] },
  { to: '/hills', label: 'Skocznie', roles: ['ADMIN','OPERATE'] },
  { to: '/events', label: 'Wydarzenia', roles: ['ADMIN','OPERATE'] },
  { to: '/my-events', label: 'Moje wydarzenia', roles: [] },
  { to: '/compare', label: 'Porównaj', roles: [] },
  { to: '/suggestion', label: 'Sugestia', roles: ['ADMIN','TRAINER'] },
  { to: '/injuries', label: 'Kontuzje', roles: ['ADMIN','INJURY_MANAGER'] },
];

export default function Sidebar({open, onClose}){
  const { user } = useAuth();
  const roles = user?.roles || [];

  const allowed = (item) => {
    if (!item.roles || item.roles.length === 0) return true;
    return item.roles.some(r => roles.includes(r));
  };

  return (
    <div className={`sidebar ${open ? 'open':''}`}>
      <div className="logo">Panel</div>
      {items.filter(allowed).map(i => (
        <NavLink key={i.to} to={i.to} className={({isActive})=>`menu-item ${isActive?'active':''}`} onClick={onClose}>
          <span>{i.label}</span>
        </NavLink>
      ))}
    </div>
  );
}
