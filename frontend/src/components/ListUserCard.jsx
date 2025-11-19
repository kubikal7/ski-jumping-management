import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function UserCard({ users, sortBy, sortDirection, onSortChange, roles=true}) {
  const navigate = useNavigate();

  const renderSortArrow = (field) => {
    if (sortBy !== field) return null;
    return sortDirection === 'asc' ? ' ▲' : ' ▼';
  };

  return (
    <table className="card-table">
      <thead>
        <tr>
          <th onClick={() => onSortChange('firstName')} style={{ cursor: 'pointer' }}>
            Imię {renderSortArrow('firstName')}
          </th>
          <th onClick={() => onSortChange('lastName')} style={{ cursor: 'pointer' }}>
            Nazwisko {renderSortArrow('lastName')}
          </th>
          <th onClick={() => onSortChange('login')} style={{ cursor: 'pointer' }}>
            Login {renderSortArrow('login')}
          </th>
          <th onClick={() => onSortChange('height')} style={{ cursor: 'pointer' }}>
            Wzrost {renderSortArrow('height')}
          </th>
          <th onClick={() => onSortChange('weight')} style={{ cursor: 'pointer' }}>
            Waga {renderSortArrow('weight')}
          </th>
          <th onClick={() => onSortChange('birthDate')} style={{ cursor: 'pointer' }}>
            Data urodzenia {renderSortArrow('birthDate')}
          </th>
          <th>Drużyny</th>
          {roles && <th>Role</th>}
        </tr>
      </thead>

      <tbody>
        {users.map(user => (
          <tr
            key={user.id}
            onClick={() => navigate(`/users/${user.id}`)}
            style={{ cursor: "pointer" }}
          >
            <td>{user.firstName}</td>
            <td>{user.lastName}</td>
            <td>{user.login}</td>
            <td>{user.height}</td>
            <td>{user.weight}</td>
            <td>{user.birthDate}</td>
            <td>
              {(user.teams || []).map(t => (
                <div key={t.name} className="pill">{t.name}</div>
              ))}
            </td>
            {roles &&
              <td>
                {(user.roles || []).map(r => (
                  <div key={r.name} className="pill">{r.name}</div>
              ))}
            </td>
            }
          </tr>
        ))}
      </tbody>
    </table>
  );
}
