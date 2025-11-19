import React, { useState } from 'react';
import TeamSelector from './TeamSelector';
import HillSelector from './HillSelector';

const eventTypes = [
  { value: 'TRAINING', label: 'Trening' },
  { value: 'COMPETITION', label: 'Zawody' },
  { value: 'CAMP', label: 'Obóz' },
];

const eventLevels = [
  { value: 5, label: 'Zawody międzynarodowe' },
  { value: 4, label: 'Zawody międzynarodowe niższej rangi' },
  { value: 3, label: 'Zawody krajowe' },
  { value: 2, label: 'Zawody regionalne / lokalne' },
  { value: 1, label: 'Trening' },
];

export default function EventForm({ onSubmit, initialData = {} }) {
  const [eventData, setEventData] = useState({
    name: '',
    type: 'TRAINING',
    hillId: initialData.hillId || null,
    startDate: '',
    endDate: '',
    description: '',
    level: '',
    allowedTeamIds: initialData.allowedTeamIds || [],
    ...initialData,
  });

  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!eventData.name.trim()) return setError('Nazwa wydarzenia jest wymagana');
    if (!eventData.hillId) return setError('Wybierz skocznię');
    if (!eventData.startDate || !eventData.endDate) return setError('Podaj daty rozpoczęcia i zakończenia');
    if (new Date(eventData.endDate) < new Date(eventData.startDate)) return setError('Data zakończenia nie może być wcześniejsza niż rozpoczęcia');
    if (!eventData.level || eventData.level < 1 || eventData.level > 5) return setError('Poziom musi być liczbą od 1 do 5');

    onSubmit(eventData);
  };

  return (
    <form onSubmit={handleSubmit} className="column">
      {error && <div style={{ color: 'red', fontSize: 14, marginBottom: 4 }}>{error}</div>}

      <input
        className="input"
        placeholder="Nazwa wydarzenia"
        value={eventData.name}
        onChange={e => setEventData({ ...eventData, name: e.target.value })}
        required
      />

      <select
        className="input"
        value={eventData.type}
        onChange={e => setEventData({ ...eventData, type: e.target.value })}
      >
        {eventTypes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
      </select>

      <HillSelector
        selectedHillId={eventData.hillId}
        onChange={hill => setEventData({ ...eventData, hillId: hill?.id || null })}
      />

      <label>Data i godzina rozpoczęcia</label>
      <input
        type="datetime-local"
        className="input"
        value={eventData.startDate || ''}
        onChange={e => setEventData({ ...eventData, startDate: e.target.value })}
        required
      />

      <label>Data i godzina zakończenia</label>
      <input
        type="datetime-local"
        className="input"
        value={eventData.endDate || ''}
        onChange={e => setEventData({ ...eventData, endDate: e.target.value })}
        required
      />

      <textarea
        className="input"
        placeholder="Opis (opcjonalny)"
        value={eventData.description || ''}
        onChange={e => setEventData({ ...eventData, description: e.target.value })}
      />

      <select
        className="input"
        value={eventData.level || ''}
        onChange={e => setEventData({ ...eventData, level: Number(e.target.value) })}
        required
      >
        <option value="" disabled>Wybierz poziom</option>
        {eventLevels.map(l => (
          <option key={l.value} value={l.value}>
            {l.value} - {l.label}
          </option>
        ))}
      </select>

      <TeamSelector
        selectedTeams={eventData.allowedTeamIds}
        onChange={allowedTeamIds => setEventData({ ...eventData, allowedTeamIds })}
      />

      <button type="submit" className="btn primary">Zapisz</button>
    </form>
  );
}
