import React, { useState, useEffect } from 'react';
import PlayerSelector from './UserSelector';
import { useAuth } from '../context/AuthContext';

const severityOptions = ['LOW', 'MEDIUM', 'HIGH'];

export default function InjuryForm({ onSubmit, initialData = {}, includedTeamIds = null  }) {
  const { user: currentUser } = useAuth();
  const isAdmin = currentUser?.roles?.includes('ADMIN');
  const isInjuryManager = currentUser?.roles?.includes('INJURY_MANAGER');

  const [formData, setFormData] = useState({
    athlete: initialData.athlete || null,
    injuryDate: initialData.injuryDate || '',
    recoveryDate: initialData.recoveryDate || '',
    severity: initialData.severity || '',
    description: initialData.description || '',
  });

  const [error, setError] = useState('');

  useEffect(() => {
    setFormData({
      athlete: initialData.athlete || null,
      injuryDate: initialData.injuryDate || '',
      recoveryDate: initialData.recoveryDate || '',
      severity: initialData.severity || '',
      description: initialData.description || '',
    });
  }, [initialData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!formData.athlete) return setError('Wybierz zawodnika');
    if (!formData.injuryDate) return setError('Podaj datę kontuzji');
    if (!formData.severity) return setError('Wybierz poziom kontuzji');

    onSubmit({
      athleteId: formData.athlete.id,
      injuryDate: formData.injuryDate,
      recoveryDate: formData.recoveryDate,
      severity: formData.severity,
      description: formData.description,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="column">
      {error && <div style={{ color: 'red', fontSize: 14, marginBottom: 4 }}>{error}</div>}

      <PlayerSelector
        selectedUserId={formData.athlete?.id || null}
        includedRoleIds={[5]}
        onChange={(player) => setFormData(f => ({ ...f, athlete: player }))}
        includedTeamIds={includedTeamIds}
      />

      <label>Data kontuzji:</label>
      <input
        type="date"
        value={formData.injuryDate}
        onChange={(e) => setFormData(f => ({ ...f, injuryDate: e.target.value }))}
        className="input"
      />

      <label>Data powrotu (opcjonalnie):</label>
      <input
        type="date"
        value={formData.recoveryDate}
        onChange={(e) => setFormData(f => ({ ...f, recoveryDate: e.target.value }))}
        className="input"
      />

      <select
        value={formData.severity}
        onChange={(e) => setFormData(f => ({ ...f, severity: e.target.value }))}
        className="input"
      >
        <option value="">Wybierz poziom kontuzji</option>
        {severityOptions.map(s => <option key={s} value={s}>{s}</option>)}
      </select>

      <textarea
        value={formData.description}
        onChange={(e) => setFormData(f => ({ ...f, description: e.target.value }))}
        className="input"
        placeholder="Opis (opcjonalnie)"
        rows={3}
      />

      <button type="submit" className="btn primary">Zapisz</button>
    </form>
  );
}
