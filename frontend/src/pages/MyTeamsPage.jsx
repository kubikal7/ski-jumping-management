import React, { useEffect, useState } from 'react';
import api from '../services/api';
import ListTeamCard from '../components/ListTeamCard';
import Drawer from '../components/Drawer';
import { useAuth } from '../context/AuthContext';
import TeamForm from '../components/TeamForm';
import { useToast } from '../components/Toast';

export default function MyTeamsPage() {
  const [teams, setTeams] = useState([]);
  const [page, setPage] = useState(0);
  const [size] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [sortBy, setSortBy] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');
  const { user: me } = useAuth();
  const { showToast } = useToast();

  const [filters, setFilters] = useState({
    name: '',
    teamIds: me?.teamIds || []
  });

  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    setFilters(f => ({
      ...f,
      teamIds: me?.teamIds || []
    }));
  }, [me]);

  useEffect(() => {
    if (filters.teamIds.length > 0) {
      fetchTeams();
    }
  }, [page, sortBy, sortDirection, filters.teamIds]);

  const fetchTeams = async () => {
    try {
      const params = { page, size, sortBy, sortDirection };

      if (filters.name) params.name = filters.name;
      if (filters.teamIds?.length > 0) params.teamIds = filters.teamIds;

      const resp = await api.get('/teams', { params });
      const data = resp.data;
      setTeams(data.content || []);
      setTotalPages(data.totalPages || 0);
    } catch (e) {
      console.error('Błąd pobierania drużyn:', e);
    }
  };

  const onSearch = () => {
    setPage(0);
    fetchTeams();
  };

  return (
    <div>
      <div className='tool-title'>
        <h2>Moje Drużyny</h2>
      </div>

      <div className="column">
        <div className="card gap">
          <input
            className="input"
            placeholder="Nazwa drużyny"
            value={filters.name}
            onChange={e => setFilters(f => ({ ...f, name: e.target.value }))}
          />
          <button className="btn" onClick={onSearch}>Szukaj</button>
        </div>

        <div>
          {teams.length === 0 ? (
            <div className="muted">Brak wyników</div>
          ) : (
            <ListTeamCard
              teams={teams}
              sortBy={sortBy}
              sortDirection={sortDirection}
              onSortChange={(field) => {
                if (sortBy === field) {
                  setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
                } else {
                  setSortBy(field);
                  setSortDirection('asc');
                }
                setPage(0);
              }}
            />
          )}
        </div>

        {teams.length > 0 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 12 }}>
            <button
              className="btn"
              disabled={page === 0}
              onClick={() => setPage(p => Math.max(p - 1, 0))}
            >
              &lt; Poprzednia
            </button>
            <span style={{ alignSelf: 'center' }}>
              Strona {page + 1} z {totalPages}
            </span>
            <button
              className="btn"
              disabled={page >= totalPages - 1}
              onClick={() => setPage(p => Math.min(p + 1, totalPages - 1))}
            >
              Następna &gt;
            </button>
          </div>
        )}
      </div>

      <Drawer open={drawerOpen} title="Nowa drużyna" onClose={() => setDrawerOpen(false)}>
        <TeamForm
          onSubmit={async (teamData) => {
            try {
              await api.post('/teams', teamData);
              setDrawerOpen(false);
              fetchTeams();
            } catch (e) {
              showToast('Błąd tworzenia drużyny', 'error');
            }
          }}
        />
      </Drawer>
    </div>
  );
}
