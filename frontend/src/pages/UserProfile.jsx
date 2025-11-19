import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import Drawer from '../components/Drawer';
import UserForm from '../components/UserForm';
import ConfirmModal from '../components/ConfirmModal';
import EventList from '../components/EventList';
import { useToast } from '../components/Toast';

export default function UserProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const { user: me } = useAuth();
  const [editing, setEditing] = useState(false);
  const [newPass, setNewPass] = useState('');
  const [confirmModal, setConfirmModal] = useState({ open: false, title: '', message: '', action: null });
  const [changingPassword, setChangingPassword] = useState(false);
  const [oldPass, setOldPass] = useState('');
  const [imageError, setImageError] = useState(false);
  const { showToast } = useToast();
  const [serverError, setServerError] = useState('');

  useEffect(() => {
    fetchUser();
  }, [id]);

  const fetchUser = async () => {
    try {
      const resp = await api.get(`/users/${id}`);
      const userData = resp.data;

      const [past, upcoming] = await Promise.all([
        api.get(`/events/athlete/${id}/past`, { params: { page: 0, size: 5 } }),
        api.get(`/events/athlete/${id}/upcoming`, { params: { page: 0, size: 5 } })
      ]);
      userData.pastEvents = past.data.content || [];
      userData.upcomingEvents = upcoming.data.content || [];

      setUser(userData);
    } catch (e) {
      console.error(e);
    }
  };

  const canEdit = () => {
    const roles = me?.roles || [];
    if (roles.includes('ADMIN') || roles.includes('MANAGER')) {
      if (user?.roles?.some(r => r.name === 'ADMIN') && roles.includes('MANAGER')) return false;
      return true;
    }
    return me?.id === user?.id || me?.userId === user?.id;
  };

  const showConfirm = (title, message, action) => {
    setConfirmModal({ open: true, title, message, action });
  };

  const handleConfirm = async () => {
    setConfirmModal(prev => ({ ...prev, open: false }));
    if (confirmModal.action) await confirmModal.action();
  };

  const resetPassword = async () => {
    const newP = generatePassword();
    await api.put(`/users/reset-password/${id}`, null, { params: { newPassword: newP } });
    navigator.clipboard.writeText(newP);
    showToast('Hasło zostało zresetowane i skopiowane do schowka', 'success');
  };

  const deleteUser = async () => {
    try {
      await api.delete(`/users/${id}`);
      showToast('Użytkownik został usunięty', 'success');
      navigate('/users');
    } catch (e) {
      showToast('Błąd usuwania użytkownika', 'error');
    }
  };

  const changeOwnPassword = async () => {
    try {
      if (!oldPass || !newPass) {
        showToast('Wypełnij oba pola: stare i nowe hasło', 'error');
        return;
      }
      await api.put('/users/me/change-password', null, { params: { oldPassword: oldPass, newPassword: newPass } });
      showToast('Hasło zmienione', 'success');
      setOldPass('');
      setNewPass('');
      setChangingPassword(false);
    } catch (e) {
      showToast('Błąd zmiany hasła', 'error');
    }
  };

  if (!user) return <div>Ładowanie...</div>;

  const isOwnProfile = me?.id === user?.id || me?.userId === user?.id;
  const isAdminOrManager = (me?.roles || []).some(r => ['ADMIN', 'MANAGER'].includes(r));

  const formatDate = (dateStr) => dateStr ? new Date(dateStr).toLocaleDateString() : '-';
  const formatDateTime = (dtStr) => dtStr ? new Date(dtStr).toLocaleString() : '-';

  return (
    <div>
      <h2>{user.firstName} {user.lastName}</h2>

      {canEdit() && (
        <div className='card gap'>
          {isAdminOrManager && <button className="btn" onClick={() => setEditing(true)}>Edytuj dane</button>}
          {isAdminOrManager && (
            <button
              className="btn"
              onClick={() => showConfirm(
                'Resetowanie hasła',
                `Czy na pewno chcesz zresetować hasło użytkownika ${user.login}?`,
                resetPassword
              )}
            >
              Resetuj hasło
            </button>
          )}
          {isAdminOrManager && (
            <button
              className={isOwnProfile ? "btn" : "btn danger"}
              disabled={isOwnProfile}
              onClick={() => showConfirm(
                'Usuwanie użytkownika',
                `Czy na pewno chcesz usunąć użytkownika ${user.login}?`,
                deleteUser
              )}
            >
              Usuń użytkownika
            </button>
          )}
          {isOwnProfile && (
            <div>
              {!changingPassword && (
                <button className="btn primary" onClick={() => setChangingPassword(true)}>Zmień moje hasło</button>
              )}

              {changingPassword && (
                <div className='row'>
                  <input
                    type="password"
                    className="input"
                    placeholder="Stare hasło"
                    value={oldPass}
                    onChange={e => setOldPass(e.target.value)}
                  />
                  <input
                    type="password"
                    className="input"
                    placeholder="Nowe hasło"
                    value={newPass}
                    onChange={e => setNewPass(e.target.value)}
                  />
                  <button className="btn primary" onClick={changeOwnPassword}>Zatwierdź</button>
                  <button className="btn" onClick={() => setChangingPassword(false)}>Anuluj</button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <div className="card">
        <div className="user-photo">
          {user.photoUrl && !imageError ? (
            <img
              src={user.photoUrl}
              alt="Profil"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="user-avatar-placeholder">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="64"
                height="64"
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
          )}
        </div>
        <div style={{ flex: '1 1 auto' }}>
          <table className="hill-table">
            <tbody>
              <tr><td className="label">Login</td><td>{user.login}</td></tr>
              <tr><td className="label">Aktywny</td><td>{user.active ? 'Tak' : 'Nie'}</td></tr>
              <tr><td className="label">Imię</td><td>{user.firstName}</td></tr>
              <tr><td className="label">Nazwisko</td><td>{user.lastName}</td></tr>
              <tr><td className="label">Rola</td><td>{(user.roles || []).map(r => r.name).join(', ') || '-'}</td></tr>
              <tr><td className="label">Drużyny</td><td>{(user.teams || []).map(t => t.name).join(', ') || '-'}</td></tr>
              <tr><td className="label">Wzrost</td><td>{user.height || '-'}</td></tr>
              <tr><td className="label">Waga</td><td>{user.weight || '-'}</td></tr>
              <tr><td className="label">Data urodzenia</td><td>{formatDate(user.birthDate)}</td></tr>
              <tr><td className="label">Narodowość</td><td>{user.nationality || '-'}</td></tr>
              <tr><td className="label">Ostatnie logowanie</td><td>{formatDateTime(user.lastLogin)}</td></tr>
            </tbody>
          </table>
        </div>

      </div>
      <div className="card">
        <div style={{ flex: 1 }}>
          <h3>Poprzednie zawody</h3>
          <div>
            {user.pastEvents?.length ? (
              <EventList
                events={user.pastEvents}
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
            {user.upcomingEvents?.length ? (
              <EventList
                events={user.upcomingEvents}
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

      <Drawer open={editing} title="Edytuj użytkownika" onClose={() => setEditing(false)}>
        <UserForm
          initialData={{
            firstName: user.firstName,
            lastName: user.lastName,
            login: user.login,
            birthDate: user.birthDate,
            nationality: user.nationality,
            photoUrl: user.photoUrl,
            weight: user.weight,
            height: user.height,
            active: user.active,
            teamIds: (user.teams || []).map(t => t.id),
            roles: (user.roles || []).map(r => r.id)
          }}
          serverError={serverError}
          setServerError={setServerError}
          onSubmit={async (userData) => {
            try {
              await api.put(`/users/${id}`, userData);
              setEditing(false);
              await fetchUser();
              showToast('Dane użytkownika zaktualizowane', 'success');
            } catch (e) {
              if (e.response?.status === 409) {
                setServerError('Login już istnieje');
              } else {
                setServerError('Błąd aktualizacji użytkownika');
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

function generatePassword() {
  const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lower = 'abcdefghijklmnopqrstuvwxyz';
  const digits = '0123456789';
  const special = '!@#%';
  const all = upper + lower + digits + special;

  let pwd = '';
  pwd += upper[Math.floor(Math.random() * upper.length)];
  pwd += digits[Math.floor(Math.random() * digits.length)];
  pwd += special[Math.floor(Math.random() * special.length)];

  const remainingLength = 8 - pwd.length;
  for (let i = 0; i < remainingLength; i++) {
    pwd += all[Math.floor(Math.random() * all.length)];
  }

  return pwd.split('').sort(() => Math.random() - 0.5).join('');
}
