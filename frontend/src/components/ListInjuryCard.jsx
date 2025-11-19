import React, { useState } from 'react';
import { formatDateTime } from '../services/date';

export default function ListInjuryCard({
  injuries,
  sortBy,
  sortDirection,
  onSortChange,
  onEdit,
  onDelete,
  isAdmin,
  isInjuryManager,
  currentUser
}) {
  const [expandedId, setExpandedId] = useState(null);

  const renderSortArrow = (field) => {
    if (sortBy !== field) return null;
    return sortDirection === 'asc' ? ' ▲' : ' ▼';
  };

  return (
    <table className="card-table">
      <thead>
        <tr>
          <th onClick={() => onSortChange('athlete.firstName')} style={{ cursor: 'pointer' }}>
            Imię {renderSortArrow('athlete.firstName')}
          </th>
          <th onClick={() => onSortChange('athlete.lastName')} style={{ cursor: 'pointer' }}>
            Nazwisko {renderSortArrow('athlete.lastName')}
          </th>
          <th onClick={() => onSortChange('injuryDate')} style={{ cursor: 'pointer' }}>
            Data kontuzji {renderSortArrow('injuryDate')}
          </th>
          <th onClick={() => onSortChange('recoveryDate')} style={{ cursor: 'pointer' }}>
            Data powrotu {renderSortArrow('recoveryDate')}
          </th>
          <th onClick={() => onSortChange('severity')} style={{ cursor: 'pointer' }}>
            Poziom {renderSortArrow('severity')}
          </th>
        </tr>
      </thead>

      <tbody>
        {injuries.map(i => (
          <React.Fragment key={i.id}>
            <tr
              onClick={() => setExpandedId(expandedId === i.id ? null : i.id)}
              style={{ cursor: 'pointer' }}
            >
              <td>{i.athlete?.firstName}</td>
              <td>{i.athlete?.lastName}</td>
              <td>{i.injuryDate}</td>
              <td>{i.recoveryDate}</td>
              <td>{i.severity}</td>
              <td>
                {(isAdmin || (isInjuryManager && i.athlete?.teams?.some(t => currentUser.teamIds.includes(t.id)))) && (
                  <>
                    <button
                      className="btn"
                      onClick={(e) => { e.stopPropagation(); onEdit(i); }}
                    >
                      Edytuj
                    </button>
                    <button
                      className="btn danger"
                      onClick={(e) => { e.stopPropagation(); onDelete(i); }}
                    >
                      Usuń
                    </button>
                  </>
                )}
              </td>
            </tr>

            {expandedId === i.id && (
              <tr>
                <td colSpan="6" style={{ background: '#f9f9f9' }}>
                  <div style={{ padding: 10 }}>
                    {i.description || 'Brak opisu'}<br />
                  </div>
                </td>
              </tr>
            )}
          </React.Fragment>
        ))}
      </tbody>
    </table>
  );
}
