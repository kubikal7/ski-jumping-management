import React, { useState } from 'react';
import TeamSelector from './TeamSelector';
import RoleSelector from './RoleSelector';
import { useAuth } from '../context/AuthContext';

const roleOptions = [
  { id: 1, name: 'ADMIN' },
  { id: 2, name: 'MANAGER' },
  { id: 3, name: 'OPERATE' },
  { id: 4, name: 'TRAINER' },
  { id: 5, name: 'ATHLETE' },
  { id: 6, name: 'INJURY_MANAGER' },
];

export default function UserForm({ onSubmit, initialData = {}, serverError, setServerError }) {
  const { user } = useAuth();
  const isAdmin = user?.roles?.includes('ADMIN');

  const initialRoleIds = initialData.roles?.map(rName => {
    const role = roleOptions.find(ro => ro.name === rName || ro.id === rName);
    return role?.id;
  }).filter(Boolean) || [];

  const [userData, setUserData] = useState({
    login: '',
    firstName: '',
    lastName: '',
    birthDate: '',
    nationality: '',
    teamIds: [],
    photoUrl: '',
    weight: '',
    height: '',
    active: true,
    roles: initialRoleIds,
    password: '',
    ...initialData
  });

  const [passwordGenerated, setPasswordGenerated] = useState(false);
  const [error, setError] = useState('');

  const handleGeneratePassword = () => {
    const pwd = generatePassword();
    setUserData(prev => ({ ...prev, password: pwd }));
    navigator.clipboard.writeText(pwd);
    setPasswordGenerated(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!userData.login.trim()) {
      setError('Login nie może być pusty');
      return;
    }
    if (!userData.roles || userData.roles.length === 0) {
      setError('Użytkownik musi mieć przynajmniej jedną rolę');
      return;
    }

    setError('');
    if (setServerError) setServerError('');

    onSubmit({
      ...userData,
      roles: userData.roles
    });
  };

  return (
    <form onSubmit={handleSubmit} className="column">
      {error && <div style={{ color: 'red', marginBottom: 8 }}>{error}</div>}
      {serverError && <div style={{ color: 'red', marginBottom: 8 }}>{serverError}</div>}

      <input className="input" placeholder="Login" value={userData.login}
             onChange={e => setUserData({ ...userData, login: e.target.value })} />
      <input className="input" placeholder="Imię" value={userData.firstName}
             onChange={e => setUserData({ ...userData, firstName: e.target.value })} />
      <input className="input" placeholder="Nazwisko" value={userData.lastName}
             onChange={e => setUserData({ ...userData, lastName: e.target.value })} />
      <label>Data urodzenia:</label>
      <input className="input" type="date" value={userData.birthDate || ''} 
             onChange={e => setUserData({ ...userData, birthDate: e.target.value })} />
      <input className="input" placeholder="Narodowość" value={userData.nationality || ''} 
             onChange={e => setUserData({ ...userData, nationality: e.target.value })} />
      <input className="input" placeholder="URL zdjęcia" value={userData.photoUrl || ''} 
             onChange={e => setUserData({ ...userData, photoUrl: e.target.value })} />
      <input className="input" type="number" placeholder="Wzrost (cm)" value={userData.height || ''} 
             onChange={e => setUserData({ ...userData, height: e.target.value })} />
      <input className="input" type="number" placeholder="Waga (kg)" value={userData.weight || ''} 
             onChange={e => setUserData({ ...userData, weight: e.target.value })} />

      <div className='card gap' style={{paddingBottom: 0, alignItems: 'center'}}>
        <button type="button" className="btn" onClick={handleGeneratePassword}>
          Generuj hasło
        </button>
        {passwordGenerated && <span style={{ fontSize: 12 }}>Hasło skopiowane do schowka</span>}
      </div>

      <RoleSelector
        selectedRoleIds={userData.roles}
        onChange={roles => setUserData({ ...userData, roles })}
        isAdmin={isAdmin}
      />

      <TeamSelector
        selectedTeams={userData.teamIds}
        onChange={teamIds => setUserData({ ...userData, teamIds })}
      />

      <button type="submit" className="btn primary">Zapisz</button>
    </form>
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
