import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';

function PlayerAvatar({ photoUrl }) {
  const [imageError, setImageError] = useState(false);

  if (photoUrl && !imageError) {
    return (
      <img
        src={photoUrl}
        alt=""
        style={{ width: 30, height: 30, borderRadius: '50%', objectFit: 'cover' }}
        onError={() => setImageError(true)}
      />
    );
  }

  return (
    <div
      style={{
        width: 30,
        height: 30,
        borderRadius: '50%',
        background: '#ddd',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#888"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M20 21v-2a4 4 0 0 0-3-3.87"></path>
        <path d="M4 21v-2a4 4 0 0 1 3-3.87"></path>
        <circle cx="12" cy="7" r="4"></circle>
      </svg>
    </div>
  );
}

export default function PlayerSelector({
  selectedUserId = null,
  excludedIds = [],
  includedRoleIds = [],
  includedUsers = null,
  includedTeamIds = [],   
  onChange,
  multi = false,
}) {
  const [open, setOpen] = useState(false);
  const [players, setPlayers] = useState([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedPlayers, setSelectedPlayers] = useState(multi ? [] : null);

  const containerRef = useRef(null);
  const pageSize = 8;

  useEffect(() => {
    if (!multi && selectedUserId) {
      api
        .get(`/users/${selectedUserId}`)
        .then((resp) => setSelectedPlayers(resp.data))
        .catch((e) => console.error('Nie udało się pobrać zawodnika:', e));
    } else if (!multi) {
      setSelectedPlayers(null);
    }
  }, [selectedUserId, multi]);

  useEffect(() => {
    if (open) {
      if (includedUsers) {
        const filtered = includedUsers.filter(u => !excludedIds.includes(u.id));
        setPlayers(filtered);
      } else {
        loadPlayers(true);
      }
    }
  }, [open, search, includedUsers]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadPlayers = async (reset = false) => {
    if (loading) return;
    setLoading(true);
    try {
      const resp = await api.get('/users', {
        params: {
          page: reset ? 0 : page,
          size: pageSize,
          search: search || undefined,
          roleIds: includedRoleIds.length > 0 ? includedRoleIds : undefined,
          teamIds: includedTeamIds.length > 0 ? includedTeamIds : undefined,
        },
      });

      const filtered = resp.data.content.filter(p => !excludedIds.includes(p.id));

      if (reset) {
        setPlayers(filtered);
        setPage(1);
      } else {
        setPlayers(prev => [...prev, ...filtered]);
        setPage(prev => prev + 1);
      }
      setHasMore(resp.data.totalPages > (reset ? 1 : page + 1));
    } catch (e) {
      console.error('Błąd ładowania zawodników:', e);
    } finally {
      setLoading(false);
    }
  };

  const togglePlayer = (player) => {
    if (multi) {
      setSelectedPlayers(prev => {
        const exists = prev.find(p => p.id === player.id);
        let updated;
        if (exists) {
          updated = prev.filter(p => p.id !== player.id);
        } else {
          updated = [...prev, player];
        }
        onChange?.(updated);
        return updated;
      });
    } else {
      setSelectedPlayers(player);
      setOpen(false);
      onChange?.(player);
    }
  };

  const isSelected = (player) => {
    if (multi) return selectedPlayers.some(p => p.id === player.id);
    return selectedPlayers?.id === player.id;
  };

  return (
    <div ref={containerRef} style={{ position: 'relative' }}>
      <button type="button" className="btn" onClick={() => setOpen(prev => !prev)}>
        {multi
          ? selectedPlayers.length > 0
            ? `${selectedPlayers.length} wybranych`
            : 'Wybierz zawodników'
          : selectedPlayers
          ? `${selectedPlayers.firstName} ${selectedPlayers.lastName}`
          : 'Dodaj zawodnika'}
      </button>

      {open && (
        <div className='dropdown-selector'>
          {!includedUsers && (
            <input
              type="text"
              placeholder="Szukaj zawodnika..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: '100%', marginBottom: 8, padding: 4 }}
            />
          )}

          {players.map((p) => (
            <div
              key={p.id}
              onClick={() => togglePlayer(p)}
              className={`select-item ${isSelected(p) ? 'selected' : ''}`}
            >
              <PlayerAvatar photoUrl={p.photoUrl} />
              <span>{p.firstName} {p.lastName}</span>
            </div>
          ))}

          {!includedUsers && hasMore && (
            <button
              className="btn"
              style={{ width: '100%' }}
              onClick={() => loadPlayers(false)}
              disabled={loading}
            >
              {loading ? 'Ładowanie...' : 'Załaduj więcej'}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
