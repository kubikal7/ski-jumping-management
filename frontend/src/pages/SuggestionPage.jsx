import React, { useState, useEffect } from 'react';
import api from '../services/api';
import EventSelector from '../components/EventSelector';
import PlayerAvatar from '../components/PlayerAvatar';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function SuggestionPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [selectedEvent, setSelectedEvent] = useState(null);
  const [limit, setLimit] = useState(5);
  const [fromDate, setFromDate] = useState('');
  const [suggestedUsers, setSuggestedUsers] = useState([]);
  const [error, setError] = useState('');
  const [availableEvents, setAvailableEvents] = useState([]);

  const isAdmin = user?.roles?.includes('ADMIN');
  const isTrainer = user?.roles?.includes('TRAINER');

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const params = {
          startDateFrom: new Date().toISOString().split('T')[0],
          page: 0,
          size: 100,
          sortBy: 'startDate',
          sortDirection: 'asc',
        };

        if (!isAdmin && isTrainer) {
          params.teamIds = user.teamIds;
        }

        const resp = await api.get('/events', { params });
        setAvailableEvents(resp.data.content || []);
      } catch (e) {
        console.error('Błąd pobierania wydarzeń:', e);
      }
    };

    fetchEvents();
  }, [user, isAdmin, isTrainer]);

  const fetchSuggestions = async () => {
    setError('');

    if (!selectedEvent) {
      setError('Wybierz wydarzenie');
      return;
    }
    if (!limit || limit <= 0) {
      setError('Podaj liczbę zawodników większą od 0');
      return;
    }
    if (!fromDate) {
      setError('Podaj datę od kiedy uwzględniać wyniki');
      return;
    }

    try {
      const params = {
        eventId: selectedEvent.id,
        limit,
        fromDate,
      };

      const resp = await api.post('/event-participants/recommend', params);
      setSuggestedUsers(resp.data || []);
    } catch (e) {
      console.error(e);
      setError('Błąd pobierania rekomendacji');
    }
  };

  return (
    <div>
      <h2>Rekomendacja zawodników</h2>

      <div className="column">
        {error && <div style={{ color: 'red', marginBottom: 8 }}>{error}</div>}
        <div className="card gap" style={{ alignItems: 'center' }}>
          <EventSelector
            selectedEvent={selectedEvent}
            onChange={setSelectedEvent}
            includedEvents={availableEvents}
          />
          <label>Liczba zawodników:</label>
          <input
            type="number"
            className="input"
            placeholder="Ile zawodników"
            value={limit}
            onChange={(e) => setLimit(Number(e.target.value))}
            style={{ width: 120 }}
          />
          <label>Od kiedy uwzględniać wyniki:</label>
          <input
            type="date"
            className="input"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            style={{ width: 160 }}
          />
          <button className="btn primary" onClick={fetchSuggestions}>
            Rekomenduj
          </button>
        </div>
      </div>

      <div className="card">
        {suggestedUsers.length === 0 ? (
          <div className="muted">Brak rekomendowanych zawodników</div>
        ) : (
          <div className="player-grid">
            {suggestedUsers.map((u) => (
              <div
                key={u.id}
                className="player-card"
                onClick={() => navigate(`/users/${u.id}`)}
                style={{ cursor: 'pointer' }}
              >
                <PlayerAvatar photoUrl={u.photoUrl} />
                <div style={{ fontWeight: 600, marginTop: 4 }}>
                  {u.firstName} {u.lastName}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
