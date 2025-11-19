import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function ListHillCard({ hills, sortBy, sortDirection, onSortChange }) {
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
          <th onClick={() => onSortChange('city')} style={{ cursor: 'pointer' }}>
            Miasto {renderSortArrow('city')}
          </th>
          <th onClick={() => onSortChange('country')} style={{ cursor: 'pointer' }}>
            Kraj {renderSortArrow('country')}
          </th>
          <th onClick={() => onSortChange('hillSize')} style={{ cursor: 'pointer' }}>
            HS {renderSortArrow('hillSize')}
          </th>
          <th onClick={() => onSortChange('constructionPoint')} style={{ cursor: 'pointer' }}>
            Punkt K {renderSortArrow('constructionPoint')}
          </th>
        </tr>
      </thead>

      <tbody>
        {hills.map(hill => (
          <tr
            key={hill.id}
            onClick={() => navigate(`/hills/${hill.id}`)}
            style={{ cursor: "pointer" }}
          >
            <td>{hill.name}</td>
            <td>{hill.city}</td>
            <td>{hill.country}</td>
            <td>{hill.hillSize}</td>
            <td>{hill.constructionPoint}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
