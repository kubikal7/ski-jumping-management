import React, { useState, useEffect } from 'react';
import UserSelector from './UserSelector';

export default function ResultForm({ initialData = {}, onSubmit, participants = [] }) {
  const [resultData, setResultData] = useState({
    eventId: initialData.eventId || null,
    athleteId: initialData.athlete?.id || null,
    attemptNumber: initialData.attemptNumber || '',
    jumpLength: initialData.jumpLength || '',
    stylePoints: initialData.stylePoints || '',
    windCompensation: initialData.windCompensation || '',
    gate: initialData.gate || '',
    totalPoints: initialData.totalPoints || '',
    speedTakeoff: initialData.speedTakeoff || '',
    flightTime: initialData.flightTime || '',
    coachComment: initialData.coachComment || '',
    videoUrl: initialData.videoUrl || '',
    ...initialData,
  });

  const [error, setError] = useState('');

  const validateNumber = (name, value, max, min = 0, allowEmpty = true) => {
    if ((value === '' || value === null) && allowEmpty) return null;
    const num = Number(value);
    if (isNaN(num)) return `${name} musi być liczbą`;
    if (num < min) return `${name} nie może być mniejsze niż ${min}`;
    if (num > max) return `${name} nie może być większe niż ${max}`;
    return null;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!resultData.athleteId) return setError('Wybierz zawodnika');

    const validationError =
      validateNumber('Długość skoku', resultData.jumpLength, 999.9, 0) ||
      validateNumber('Punkty za styl', resultData.stylePoints, 60.0, 0) ||
      validateNumber('Kompensacja wiatru', resultData.windCompensation, 99.9, -99.9) ||
      validateNumber('Belka startowa (gate)', resultData.gate, 32767, 0) ||
      validateNumber('Punkty całkowite', resultData.totalPoints, 9999.9, 0) ||
      validateNumber('Prędkość na progu', resultData.speedTakeoff, 999.9, 0) ||
      validateNumber('Czas lotu', resultData.flightTime, 99.9, 0) ||
      validateNumber('Numer próby', resultData.attemptNumber, 32767, 1);

    if (validationError) return setError(validationError);

    onSubmit(resultData);
  };

  return (
    <form onSubmit={handleSubmit} className="column">
      {error && <div style={{ color: 'red', fontSize: 14 }}>{error}</div>}

      <UserSelector
        selectedUserId={resultData.athleteId}
        onChange={(athlete) => setResultData({ ...resultData, athleteId: athlete?.id })}
        includedUsers={participants.map(p => p.athlete)}
        placeholder="Wybierz zawodnika"
      />

      <input
        type="number"
        className="input"
        placeholder="Długość skoku (m)"
        value={resultData.jumpLength}
        onChange={(e) => setResultData({ ...resultData, jumpLength: e.target.value })}
      />

      <input
        type="number"
        className="input"
        placeholder="Punkty za styl"
        value={resultData.stylePoints}
        onChange={(e) => setResultData({ ...resultData, stylePoints: e.target.value })}
      />

      <input
        type="number"
        className="input"
        placeholder="Kompensacja wiatru"
        value={resultData.windCompensation}
        onChange={(e) => setResultData({ ...resultData, windCompensation: e.target.value })}
      />

      <input
        type="number"
        className="input"
        placeholder="Belka startowa (gate)"
        value={resultData.gate}
        onChange={(e) => setResultData({ ...resultData, gate: e.target.value })}
      />

      <input
        type="number"
        className="input"
        placeholder="Punkty całkowite"
        value={resultData.totalPoints}
        onChange={(e) => setResultData({ ...resultData, totalPoints: e.target.value })}
      />

      <input
        type="number"
        step="0.1"
        className="input"
        placeholder="Prędkość na progu (km/h)"
        value={resultData.speedTakeoff}
        onChange={(e) => setResultData({ ...resultData, speedTakeoff: e.target.value })}
      />

      <input
        type="number"
        step="0.01"
        className="input"
        placeholder="Czas lotu (s)"
        value={resultData.flightTime}
        onChange={(e) => setResultData({ ...resultData, flightTime: e.target.value })}
      />

      <input
        type="text"
        className="input"
        placeholder="Komentarz trenera"
        value={resultData.coachComment}
        onChange={(e) => setResultData({ ...resultData, coachComment: e.target.value })}
      />

      <input
        type="text"
        className="input"
        placeholder="URL wideo"
        value={resultData.videoUrl}
        onChange={(e) => setResultData({ ...resultData, videoUrl: e.target.value })}
      />

      <input
        type="number"
        className="input"
        placeholder="Numer próby"
        value={resultData.attemptNumber}
        onChange={(e) => setResultData({ ...resultData, attemptNumber: e.target.value })}
      />

      <button type="submit" className="btn primary">
        Zapisz
      </button>
    </form>
  );
}
