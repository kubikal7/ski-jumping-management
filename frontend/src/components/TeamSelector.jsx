import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';

export default function TeamSelector({ selectedTeams, onChange, includedTeamIds = null }) {
  const [open, setOpen] = useState(false);
  const [teams, setTeams] = useState([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const containerRef = useRef(null);

  const pageSize = 5;

  useEffect(() => {
    if (open) loadTeams(true);
  }, [open, search]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadTeams = async (reset = false) => {
    if (loading) return;
    setLoading(true);
    try {
      const params = {
        page: reset ? 0 : page,
        size: pageSize,
        name: search || undefined,
      };

      if (includedTeamIds && includedTeamIds.length > 0) {
        params.teamIds = includedTeamIds;
      }

      const resp = await api.get('/teams', { params });
      const data = resp.data;

      if (reset) {
        setTeams(data.content || []);
        setPage(1);
      } else {
        setTeams((prev) => [...prev, ...(data.content || [])]);
        setPage((prev) => prev + 1);
      }
      setHasMore(data.totalPages > (reset ? 1 : page + 1));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const toggleTeam = (teamId) => {
    if (selectedTeams.includes(teamId)) {
      onChange(selectedTeams.filter((id) => id !== teamId));
    } else {
      onChange([...selectedTeams, teamId]);
    }
  };

  const isSelected = (teamId) => selectedTeams.includes(teamId);

  return (
    <div ref={containerRef} style={{ position: 'relative' }}>
      <button
        type="button"
        className="btn"
        onClick={() => setOpen((prev) => !prev)}
      >
        {selectedTeams.length > 0
          ? `${selectedTeams.length} wybranych`
          : 'Wybierz zespół'}
      </button>

      {open && (
        <div className='dropdown-selector'>
          <input
            type="text"
            placeholder="Szukaj zespołu..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: '100%', marginBottom: 8, padding: 4 }}
          />

          {teams.map((team) => (
            <div
              key={team.id}
              onClick={() => toggleTeam(team.id)}
              className={`select-item ${isSelected(team.id) ? 'selected' : ''}`}
            >
              <span>{team.name}</span>
            </div>
          ))}

          {hasMore && (
            <button
              className="btn"
              style={{ width: '100%' }}
              onClick={() => loadTeams(false)}
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
