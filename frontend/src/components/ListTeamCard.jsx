import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function UserCard({ teams, sortBy, sortDirection, onSortChange }) {
  const navigate = useNavigate();

  const renderSortArrow = (field) => {
    if (sortBy !== field) return null;
    return sortDirection === 'asc' ? ' ▲' : ' ▼';
  };

  return (
    <table className="card-table">
      <thead>
        <tr>
          <th onClick={() => onSortChange('name')} style={{ cursor: 'pointer' }}>
            Nazwa drużyny {renderSortArrow('name')}
          </th>
        </tr>
      </thead>

      <tbody>
        {teams.map(team => (
          <tr
            key={team.id}
            onClick={() => navigate(`/teams/${team.id}`)}
            style={{ cursor: "pointer" }}
          >
            <td>{team.name}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
