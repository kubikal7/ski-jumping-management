import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { getOldPassword, clearAuth } from '../services/auth';

export default function ChangePassword() {
  const oldPwd = getOldPassword();
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const submit = async (e) => {
    e?.preventDefault();
    setError(null);

    if (!oldPwd) {
      setError('Brak starego hasła - zaloguj się ponownie');
      return;
    }

    if (!newPwd || !confirmPwd) {
      setError('Wypełnij oba pola nowego hasła');
      return;
    }

    if (newPwd !== confirmPwd) {
      setError('Hasła nie są takie same');
      return;
    }

    try {
      await api.put('/users/me/change-password', null, { 
        params: { oldPassword: oldPwd, newPassword: newPwd } 
      });
      clearAuth();
      navigate('/login');
    } catch (err) {
      setError(err.response?.data || err.message);
    }
  };

  return (
    <div className="card column" style={{ alignItems: 'center' }}>
      <h2>Zmiana hasła</h2>
      <form onSubmit={submit} className='column'>
        <input
          className="input"
          type="password"
          placeholder="Nowe hasło"
          value={newPwd}
          onChange={e => setNewPwd(e.target.value)}
        />
        <input
          className="input"
          type="password"
          placeholder="Potwierdź nowe hasło"
          value={confirmPwd}
          onChange={e => setConfirmPwd(e.target.value)}
        />
        {error && <div style={{ color: 'red' }}>{String(error)}</div>}
        <button className="btn primary" type="submit">Zmień hasło</button>
      </form>
    </div>
  );
}
