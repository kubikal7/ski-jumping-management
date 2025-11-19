import React from 'react';
import { useNavigate } from 'react-router-dom';
import { formatDateTime } from '../services/date';

export default function EventList({ events, sortBy, sortDirection, onSortChange }) {
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
            Nazwa {renderSortArrow('name')}
          </th>
          <th onClick={() => onSortChange('type')} style={{ cursor: 'pointer' }}>
            Typ {renderSortArrow('type')}
          </th>
          <th>Skocznia</th>
          <th onClick={() => onSortChange('startDate')} style={{ cursor: 'pointer' }}>
            Data rozpoczęcia {renderSortArrow('startDate')}
          </th>
          <th onClick={() => onSortChange('endDate')} style={{ cursor: 'pointer' }}>
            Data zakończenia {renderSortArrow('endDate')}
          </th>
          <th>Poziom</th>
          <th>Drużyny</th>
        </tr>
      </thead>

      <tbody>
        {events.map(e => (
          <tr key={e.id} onClick={() => navigate(`/events/${e.id}`)} style={{ cursor: 'pointer' }}>
            <td>{e.name}</td>
            <td>{e.type}</td>
            <td>{e.hill?.name}</td>
            <td>{formatDateTime(e.startDate)}</td>
            <td>{formatDateTime(e.endDate)}</td>
            <td>{e.level}</td>
            <td>
              {(e.eventAllowedTeams || []).map(t => (
                <div key={t.id} className="pill">{t.name}</div>
              ))}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
