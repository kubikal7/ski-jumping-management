import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import Drawer from '../components/Drawer';
import TeamForm from '../components/TeamForm';
import ConfirmModal from '../components/ConfirmModal';
import UserSelector from '../components/UserSelector';
import EventList from '../components/EventList';
import PlayerAvatar from '../components/PlayerAvatar';
import { useToast } from '../components/Toast';

export default function TeamPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [team, setTeam] = useState(null);
  const [players, setPlayers] = useState([]);
  const [editing, setEditing] = useState(false);
  const { user } = useAuth();
  const [confirmModal, setConfirmModal] = useState({ open: false, title: '', message: '', action: null });
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const { showToast } = useToast();
  const [formError, setFormError] = useState('');

  useEffect(() => {
    fetchTeam();
    fetchPlayers();
  }, [id]);

  const fetchTeam = async () => {
    try {
      const resp = await api.get(`/teams/${id}`);
      const teamData = resp.data;

      const [past, upcoming] = await Promise.all([
        api.get(`/events/team/${id}/past`, { params: { page: 0, size: 5 } }),
        api.get(`/events/team/${id}/upcoming`, { params: { page: 0, size: 5 } })
      ]);
      teamData.pastEvents = past.data.content || [];
      teamData.upcomingEvents = upcoming.data.content || [];
      setTeam(teamData);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchPlayers = async () => {
    try {
      const resp = await api.get(`/teams/${id}/users`);
      setPlayers(resp.data);
    } catch (e) {
      console.error('Błąd pobierania zawodników:', e);
    }
  };

  const deleteTeam = async () => {
    try {
      await api.delete(`/teams/${id}`);
      showToast('Drużyna została usunięta', 'success');
      navigate('/teams');
    } catch (e) {
      showToast('Błąd usuwania drużyny', 'error');
    }
  };

  const removePlayer = async (userId) => {
    try {
      await api.delete(`/users/${userId}/teams/${id}`);
      await fetchPlayers();
      showToast('Zawodnik został usunięty z drużyny', 'success');
    } catch (e) {
      showToast('Błąd przy usuwaniu zawodnika', 'error');
    }
  };

  const showConfirm = (title, message, action) => {
    setConfirmModal({ open: true, title, message, action });
  };

  const handleConfirm = async () => {
    setConfirmModal(prev => ({ ...prev, open: false }));
    if (confirmModal.action) await confirmModal.action();
  };

  if (!team) return <div>Ładowanie...</div>;

  const isManager = user?.roles?.includes('MANAGER');
  const isAdmin = user?.roles?.includes('ADMIN');
  const isTrainer = user?.roles?.includes('TRAINER') && user?.teamIds?.includes(Number(id));

  return (
    <div>
      <h2>{team.name}</h2>
      <h5 className='muted'>{team.description}</h5>

      <div className='card gap'>
        {(isAdmin || isManager) && (
          <>
            <button className="btn" onClick={() => setEditing(true)}>Edytuj dane</button>

            <button
              className="btn danger"
              onClick={() => showConfirm(
                'Usuwanie drużyny',
                `Czy na pewno chcesz usunąć drużynę ${team.name}?`,
                deleteTeam
              )}
            >
              Usuń drużynę
            </button>
          </>
        )}

        {(isAdmin || isTrainer) && (
          <>
            <UserSelector
              excludedIds={players.map(p => p.id)}
              includedRoleIds={[5]}
              onChange={setSelectedPlayer}
            />
            {selectedPlayer && (
              <button
                className="btn primary"
                onClick={async () => {
                  try {
                    await api.post(`/users/${selectedPlayer.id}/teams/${id}`);
                    await fetchPlayers();
                    setSelectedPlayer(null);
                    showToast(`Zawodnik ${selectedPlayer.firstName} ${selectedPlayer.lastName} został dodany do drużyny`, 'success');
                  } catch (e) {
                    showToast('Błąd podczas dodawania zawodnika', 'error');
                  }
                }}
              >
                Dodaj
              </button>
            )}
          </>
        )}
      </div>

      <div className="column">
        <h3>Zawodnicy</h3>

        {players.length === 0 ? (
          <div className="muted">Brak zawodników w tej drużynie</div>
        ) : (
          <div className="player-grid">
            {players.map(p => (
              <div
                key={p.id}
                className="player-card"
                onClick={() => navigate(`/users/${p.id}`)}
                style={{ cursor: 'pointer' }}
              >
                <PlayerAvatar photoUrl={p.photoUrl} />
                <div style={{ fontWeight: 600 }}>{p.firstName} {p.lastName}</div>

                {(isAdmin || isTrainer) && (
                  <button
                    className="btn danger"
                    onClick={(e) => {
                      e.stopPropagation();
                      removePlayer(p.id);
                    }}
                  >
                    Usuń
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="card">
        <div style={{ flex: 1 }}>
          <h3>Poprzednie zawody</h3>
          <div>
            {team.pastEvents?.length ? (
               <EventList
                 events={team.pastEvents}
                sortBy="startDate"
                sortDirection="desc"
                onSortChange={() => {}}
                />
            ) : (
              <div className='muted'>Brak danych</div>
             )}
          </div>
        </div>
            
         <div style={{ flex: 1 }}>
           <h3>Nadchodzące zawody</h3>
          <div>
              {team.upcomingEvents?.length ? (
               <EventList
                events={team.upcomingEvents}
                sortBy="startDate"
                sortDirection="asc"
                onSortChange={() => {}}
              />
             ) : (
               <div className='muted'>Brak danych</div>
            )}
           </div>
        </div>
      </div>

      <Drawer
        open={editing}
        title="Edytuj drużynę"
        onClose={() => {
          setEditing(false);
          setFormError('');
        }}
      >
        <TeamForm
          initialData={{
            name: team.name,
            description: team.description,
          }}
          error={formError}
          onSubmit={async (teamData) => {
            try {
              await api.put(`/teams/${id}`, teamData);
              setEditing(false);
              setFormError('');
              await fetchTeam();
              showToast('Dane drużyny zaktualizowane', 'success');
            } catch (e) {
              if (e.response?.status === 409) {
                setFormError('Drużyna o takiej nazwie już istnieje');
              } else {
                setFormError('Błąd aktualizacji drużyny');
              }
            }
          }}
        />
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
