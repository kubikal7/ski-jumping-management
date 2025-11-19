import React, { useEffect, useState } from 'react';
import api from '../services/api';
import ListUserCard from '../components/ListUserCard';
import Drawer from '../components/Drawer';
import TeamSelector from '../components/TeamSelector';
import RoleSelector from '../components/RoleSelector';
import UserForm from '../components/UserForm';
import { useToast } from '../components/Toast';
import { useAuth } from "../context/AuthContext";

function emptyUserRequest() {
  return {
    login: '',
    firstName: '',
    lastName: '',
    roles: [],
    teamIds: [],
    mustChangePassword: false
  };
}

export default function AthletesPage() {
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(0);
  const [size] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [sortBy, setSortBy] = useState('lastName');
  const [sortDirection, setSortDirection] = useState('asc');
  const { showToast } = useToast();
  const [serverError, setServerError] = useState('');
  const { user } = useAuth();

  const [filters, setFilters] = useState({
    search: '',
    active: '',
    minHeight: '',
    maxHeight: '',
    minWeight: '',
    maxWeight: '',
    birthDateFrom: '',
    birthDateTo: '',
    teamIds: [],
    roleIds: [5]
  });

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [creatingUser, setCreatingUser] = useState(emptyUserRequest());

  useEffect(() => {
    fetchUsers();
  }, [page, sortBy, sortDirection]);

  const fetchUsers = async () => {
    try {
      const params = { page, size, sortBy, sortDirection };

      if (filters.search) params.search = filters.search;
      if (filters.active !== '') params.active = filters.active;
      if (filters.minHeight) params.minHeight = filters.minHeight;
      if (filters.maxHeight) params.maxHeight = filters.maxHeight;
      if (filters.minWeight) params.minWeight = filters.minWeight;
      if (filters.maxWeight) params.maxWeight = filters.maxWeight;
      if (filters.birthDateFrom) params.birthDateFrom = filters.birthDateFrom;
      if (filters.birthDateTo) params.birthDateTo = filters.birthDateTo;
      if (filters.teamIds.length > 0) params.teamIds = filters.teamIds;
      if (filters.roleIds.length > 0) params.roleIds = filters.roleIds;

      const resp = await api.get('/users', { params });
      const data = resp.data;
      setUsers(data.content || []);
      setTotalPages(data.totalPages || 0);
    } catch (e) {
      console.error(e);
    }
  };

  const onSearch = () => {
    setPage(0);
    fetchUsers();
  };

  return (
    <div>
      <div className='tool-title'>
        <h2>Zawodnicy</h2>
      </div>

      <div className="column">
        <div className="card gap" style={{ alignItems: 'center' }}>
          <input className="input" placeholder="Szukaj" value={filters.search} onChange={e => setFilters(f => ({ ...f, search: e.target.value }))} />
          <TeamSelector selectedTeams={filters.teamIds} onChange={teamIds => setFilters(f => ({ ...f, teamIds }))} />
          <select className="input" value={filters.active} onChange={e => setFilters(f => ({ ...f, active: e.target.value }))}>
            <option value="">Wszystkie</option>
            <option value="true">Aktywni</option>
            <option value="false">Nieaktywni</option>
          </select>
          <input className="input" type="number" placeholder="Min wys." value={filters.minHeight} onChange={e => setFilters(f => ({ ...f, minHeight: e.target.value }))} />
          <input className="input" type="number" placeholder="Max wys." value={filters.maxHeight} onChange={e => setFilters(f => ({ ...f, maxHeight: e.target.value }))} />
          <input className="input" type="number" placeholder="Min waga" value={filters.minWeight} onChange={e => setFilters(f => ({ ...f, minWeight: e.target.value }))} />
          <input className="input" type="number" placeholder="Max waga" value={filters.maxWeight} onChange={e => setFilters(f => ({ ...f, maxWeight: e.target.value }))} />
          <label>Urodziny od:</label>
          <input
            className="input"
            type="date"
            value={filters.birthDateFrom}
            onChange={(e) =>
              setFilters((f) => ({ ...f, birthDateFrom: e.target.value }))
            }
            style={{ width: 160 }}
          />

          <label>Urodziny do:</label>
          <input
            className="input"
            type="date"
            value={filters.birthDateTo}
            onChange={(e) =>
              setFilters((f) => ({ ...f, birthDateTo: e.target.value }))
            }
            style={{ width: 160 }}
          />
          <button className="btn" onClick={onSearch}>Szukaj</button>
        </div>

        <div className='card'>
          {users.length === 0 ? (
            <div className="muted">Brak wyników</div>
          ) : (
            <ListUserCard
              roles={false}
              users={users}
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

        <div className='card' style={{ justifyContent: 'center'}}>
          <button className="btn" disabled={page === 0} onClick={() => setPage(p => Math.max(p - 1, 0))}>&lt; Poprzednia</button>
          <span style={{ alignSelf: 'center' }}>Strona {page + 1} z {totalPages}</span>
          <button className="btn" disabled={page >= totalPages - 1} onClick={() => setPage(p => Math.min(p + 1, totalPages - 1))}>Następna &gt;</button>
        </div>
      </div>
    </div>
  );
}
