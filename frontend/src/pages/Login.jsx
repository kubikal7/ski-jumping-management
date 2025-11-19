import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { saveToken, saveOldPassword } from '../services/auth';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState(null);
  const { login: authLogin } = useAuth();
  const navigate = useNavigate();

  const submit = async (e) => {
    e?.preventDefault();
    setErr(null);

    try {
      const resp = await api.post('/auth/login', { login, password });
      const { token, mustChangePassword } = resp.data;

      saveToken(token);
      if (mustChangePassword) {
        saveOldPassword(password);
        authLogin(token, true);
        navigate('/change-password');
        return;
      }

      authLogin(token, false);
      navigate('/');
    } catch (e) {
      setErr("Błąd logowania");
    }
  };

  return (
      <div className="card column" style={{alignItems: 'center'}}>
        <h2>Logowanie</h2>
        <form onSubmit={submit} className="column">
          <input
            className="input"
            placeholder="Login"
            value={login}
            onChange={e => setLogin(e.target.value)}
          />
          <input
            className="input"
            placeholder="Hasło"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
          {err && <div style={{ color: 'red' }}>{String(err)}</div>}
          <button className="btn primary" type="submit">Zaloguj</button>
        </form>
      </div>
  );
}
