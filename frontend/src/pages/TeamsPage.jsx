import React, { useEffect, useState } from 'react';
import api from '../services/api';
import ListTeamCard from '../components/ListTeamCard';
import Drawer from '../components/Drawer';
import TeamForm from '../components/TeamForm';
import { useToast } from '../components/Toast';

function emptyTeamRequest() {
  return {
    name: '',
    description: '',
  };
}

export default function TeamsPage() {
  const [teams, setTeams] = useState([]);
  const [page, setPage] = useState(0);
  const [size] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [sortBy, setSortBy] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');
  const { showToast } = useToast();
  const [formError, setFormError] = useState('');

  const [filters, setFilters] = useState({
    name: ''
  });

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [creatingTeam, setCreatingTeam] = useState(emptyTeamRequest());
  const canCreateTeams = true;

  useEffect(() => {
    fetchTeams();
  }, [page, sortBy, sortDirection]);

  const fetchTeams = async () => {
    try {
      const params = { page, size, sortBy, sortDirection };

      if (filters.name) params.name = filters.name;

      const resp = await api.get('/teams', { params });
      const data = resp.data;
      setTeams(data.content || []);
      setTotalPages(data.totalPages || 0);
    } catch (e) {
      console.error(e);
    }
  };

  const onSearch = () => {
    setPage(0);
    fetchTeams();
  };

  const createTeam = async () => {
    try {
      await api.post('/teams', creatingUser);
      setDrawerOpen(false);
      fetchUsers();
    } catch (e) {
      showToast('Błąd tworzenia drużyny', 'error');
    }
  };

  return (
    <div>
      <div className='tool-title'>
        <h2>Drużyny</h2>
        {canCreateTeams && (
          <button className="btn primary" onClick={() => { setCreatingTeam(emptyTeamRequest()); setDrawerOpen(true); }}>
            + Nowa drużyna
          </button>
        )}
      </div>

      <div className="column">
        <div className="card gap">
          <input className="input" placeholder="Nazwa drużyny" value={filters.name} onChange={e => setFilters(f => ({ ...f, name: e.target.value }))} />
          <button className="btn" onClick={onSearch}>Szukaj</button>
        </div>

        <div className='card'>
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

        <div className='card gap' style={{ justifyContent: 'center'}}>
          <button className="btn" disabled={page === 0} onClick={() => setPage(p => Math.max(p - 1, 0))}>&lt; Poprzednia</button>
          <span style={{ alignSelf: 'center' }}>Strona {page + 1} z {totalPages}</span>
          <button className="btn" disabled={page >= totalPages - 1} onClick={() => setPage(p => Math.min(p + 1, totalPages - 1))}>Następna &gt;</button>
        </div>
      </div>

      <Drawer open={drawerOpen} title="Nowa drużyna" onClose={() => {
        setDrawerOpen(false);
        setFormError('');
      }}>
        <TeamForm
          error={formError}
          onSubmit={async (teamData) => {
            try {
              await api.post('/teams', teamData);
              setDrawerOpen(false);
              fetchTeams();
            } catch (e) {
              if (e.response?.status === 409) {
                setFormError('Drużyna o takiej nazwie już istnieje');
              } else {
                setFormError('Błąd tworzenia drużyny');
              }
            }
          }}
        />
      </Drawer>
    </div>
  );
}
