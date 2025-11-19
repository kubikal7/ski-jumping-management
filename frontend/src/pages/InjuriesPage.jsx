import React, { useEffect, useState } from 'react';
import api from '../services/api';
import Drawer from '../components/Drawer';
import InjuryForm from '../components/InjuryForm';
import ListInjuryCard from '../components/ListInjuryCard';
import { useAuth } from '../context/AuthContext';
import PlayerSelector from '../components/UserSelector';
import TeamSelector from '../components/TeamSelector';
import ConfirmModal from '../components/ConfirmModal';
import { useToast } from '../components/Toast';

export default function InjuriesPage() {
  const { user } = useAuth();
  const isAdmin = user?.roles?.includes('ADMIN');
  const isInjuryManager = user?.roles?.includes('INJURY_MANAGER');

  const [injuries, setInjuries] = useState([]);
  const [page, setPage] = useState(0);
  const [size] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [sortBy, setSortBy] = useState('injuryDate');
  const [sortDirection, setSortDirection] = useState('desc');
  const { showToast } = useToast();

  const [filters, setFilters] = useState({
    athletes: [],
    teamIds: [],
    severity: '',
    createdFrom: '',
    createdTo: '',
    recoveryFrom: '',
    recoveryTo: ''
  });

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingInjury, setEditingInjury] = useState(null);
  const [confirmModal, setConfirmModal] = useState({ open: false, title: '', message: '', action: null });

  useEffect(() => {
    fetchInjuries();
  }, [page, sortBy, sortDirection]);

  const fetchInjuries = async (submit=false) => {
    try {
      const params = { page, size, sortBy, sortDirection };

      if (filters.athletes?.length)
        params.athleteIds = filters.athletes.map(a => a.id);
      if (filters.teamIds?.length)
        params.teamIds = filters.teamIds;
      if (filters.severity)
        params.severity = filters.severity;
      if (filters.createdFrom)
        params.createdFrom = filters.createdFrom;
      if (filters.createdTo)
        params.createdTo = filters.createdTo;
      if (filters.recoveryFrom)
        params.recoveryFrom = filters.recoveryFrom;
      if (filters.recoveryTo)
        params.recoveryTo = filters.recoveryTo;

      if (isInjuryManager && !isAdmin && !submit)
        params.teamIds = user?.teamIds;

      const resp = await api.get('/injuries', { params });
      const data = resp.data;
      setInjuries(data.content || []);
      setTotalPages(data.totalPages || 0);
    } catch (e) {
      console.error(e);
    }
  };

  const onSearch = () => {
    setPage(0);
    fetchInjuries(true);
  };

  const handleCreateOrUpdate = async (data) => {
    try {
      if (editingInjury) {
        await api.put(`/injuries/${editingInjury.id}`, data);
      } else {
        await api.post('/injuries', data);
      }
      setDrawerOpen(false);
      setEditingInjury(null);
      fetchInjuries();
      showToast('Zapisano kontuzje', 'success');
    } catch (e) {
      showToast('Błąd zapisu kontuzji', 'error');
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/injuries/${id}`);
      fetchInjuries();
    } catch (e) {
      showToast('Błąd usuwania kontuzji', 'error');
    }
  };

  const showConfirm = (title, message, action) => {
    setConfirmModal({ open: true, title, message, action });
  };

  const handleConfirm = async () => {
    setConfirmModal(prev => ({ ...prev, open: false }));
    if (confirmModal.action) await confirmModal.action();
  };

  return (
    <div>
      <div className='tool-title'>
        <h2>Kontuzje</h2>
        <button className="btn primary" onClick={() => { setEditingInjury(null); setDrawerOpen(true); }}>
          + Nowa kontuzja
        </button>
      </div>

      <div className="column">
        <div className="card gap" style={{ alignItems: 'center' }}>
          <PlayerSelector
            selectedUserId={null}
            onChange={(players) => setFilters(f => ({ ...f, athletes: players || [] }))}
            multi={true}
            includedRoleIds={[5]}
            includedTeamIds={user?.teamIds}
          />
          <TeamSelector
            selectedTeams={filters.teamIds}
            onChange={teamIds => setFilters(f => ({ ...f, teamIds }))}
            includedTeamIds={user?.teamIds}
          />
          <select
            className="input"
            value={filters.severity}
            onChange={e => setFilters(f => ({ ...f, severity: e.target.value }))}
          >
            <option value="">Wszystkie</option>
            <option value="LOW">LOW</option>
            <option value="MEDIUM">MEDIUM</option>
            <option value="HIGH">HIGH</option>
          </select>
          <label>Utworzona od:</label>
          <input className="input" type="date" value={filters.createdFrom} onChange={e => setFilters(f => ({ ...f, createdFrom: e.target.value }))} />
          <label>Utworzona do:</label>
          <input className="input" type="date" value={filters.createdTo} onChange={e => setFilters(f => ({ ...f, createdTo: e.target.value }))} />
          <label>Powrót od:</label>
          <input className="input" type="date" value={filters.recoveryFrom} onChange={e => setFilters(f => ({ ...f, recoveryFrom: e.target.value }))} />
          <label>Powrót do:</label>
          <input className="input" type="date" value={filters.recoveryTo} onChange={e => setFilters(f => ({ ...f, recoveryTo: e.target.value }))} />
          <button className="btn" onClick={onSearch}>Szukaj</button>
        </div>

        <div>
          {injuries.length === 0 ? (
            <div className="muted">Brak wyników</div>
          ) : (
            <ListInjuryCard
              injuries={injuries}
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
              onEdit={(injury) => { setEditingInjury(injury); setDrawerOpen(true); }}
              onDelete={(injury) => showConfirm(
                'Usuwanie kontuzji',
                `Czy na pewno chcesz usunąć kontuzję zawodnika ${injury.athlete?.firstName} ${injury.athlete?.lastName}?`,
                () => handleDelete(injury.id)
              )}
              isAdmin={isAdmin}
              currentUser={user}
              isInjuryManager={isInjuryManager}
            />
          )}
        </div>

        {injuries.length > 0 && (
          <div className='card gap' style={{ justifyContent: 'center' }}>
            <button className="btn" disabled={page === 0} onClick={() => setPage(p => Math.max(p - 1, 0))}>&lt; Poprzednia</button>
            <span style={{ alignSelf: 'center' }}>Strona {page + 1} z {totalPages}</span>
            <button className="btn" disabled={page >= totalPages - 1} onClick={() => setPage(p => Math.min(p + 1, totalPages - 1))}>Następna &gt;</button>
          </div>
        )}
      </div>

      <Drawer open={drawerOpen} title={editingInjury ? 'Edytuj kontuzję' : 'Nowa kontuzja'} onClose={() => setDrawerOpen(false)}>
        <InjuryForm onSubmit={handleCreateOrUpdate} initialData={editingInjury || {}} includedTeamIds={user?.teamIds}/>
      </Drawer>

      <ConfirmModal
        open={confirmModal.open}
        title={confirmModal.title}
        message={confirmModal.message}
        onConfirm={handleConfirm}
        onCancel={() => setConfirmModal(prev => ({ ...prev, open: false }))}
      />
    </div>
  );
}
