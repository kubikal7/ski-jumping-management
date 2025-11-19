import React, { useState, useEffect } from 'react';

export default function TeamForm({ onSubmit, initialData = {}, error }) {

  const [teamData, setTeamData] = useState({
    name: '',
    description: '',
    ...initialData
  });

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(teamData); }} className="column">

      {error && <div style={{ color: 'red', marginBottom: 8 }}>{error}</div>}

      <input
        className="input"
        placeholder="Nazwa drużyny"
        value={teamData.name}
        onChange={e => setTeamData({ ...teamData, name: e.target.value })}
      />

      <textarea
        className="input"
        placeholder="Opis"
        value={teamData.description || ''}
        onChange={e => setTeamData({ ...teamData, description: e.target.value })}
      />

      <button type="submit" className="btn primary">Zapisz</button>
    </form>
  );
}
