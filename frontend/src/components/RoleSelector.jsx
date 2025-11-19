import React, { useState, useRef, useEffect } from 'react';

const roleOptions = [
  { id: 1, name: 'ADMIN' },
  { id: 2, name: 'MANAGER' },
  { id: 3, name: 'OPERATE' },
  { id: 4, name: 'TRAINER' },
  { id: 5, name: 'ATHLETE' },
  { id: 6, name: 'INJURY_MANAGER' },
];

const roleNameToId = Object.fromEntries(roleOptions.map(r => [r.name, r.id]));

export default function RoleSelector({ selectedRoleIds = [], onChange, isAdmin }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  const normalizedSelectedIds = selectedRoleIds.map(r =>
    typeof r === 'string' ? roleNameToId[r] : r
  );

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleRole = (roleId) => {
    const selected = normalizedSelectedIds.includes(roleId)
      ? normalizedSelectedIds.filter((id) => id !== roleId)
      : [...normalizedSelectedIds, roleId];
    onChange(selected);
  };

  const filteredRoles = isAdmin
    ? roleOptions
    : roleOptions.filter((r) => r.name !== 'ADMIN');

  const isSelected = (id) => normalizedSelectedIds.includes(id);

  return (
    <div ref={containerRef} style={{ position: 'relative' }}>
      <button
        type="button"
        className="btn"
        onClick={() => setOpen((prev) => !prev)}
      >
        {normalizedSelectedIds.length > 0
          ? `${normalizedSelectedIds.length} wybrane`
          : 'Wybierz role'}
      </button>

      {open && (
        <div className='dropdown-selector'>
          {filteredRoles.map((role) => (
            <div
              key={role.id}
              onClick={() => toggleRole(role.id)}
              className={`select-item ${isSelected(role.id) ? 'selected' : ''}`}
            >
              <span>{role.name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
