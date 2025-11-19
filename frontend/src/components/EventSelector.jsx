import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';

function formatDateTime(dateString) {
  const date = new Date(dateString);

  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const yyyy = date.getFullYear();

  const hh = String(date.getHours()).padStart(2, '0');
  const min = String(date.getMinutes()).padStart(2, '0');

  return `${dd}-${mm}-${yyyy} ${hh}:${min}`;
}

export default function EventSelector({ selectedEvent, onChange, includedEvents = null }) {
  const [open, setOpen] = useState(false);
  const [events, setEvents] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (open) {
      if (Array.isArray(includedEvents)) {
        const filtered = includedEvents.filter(e =>
          !search || e.name.toLowerCase().includes(search.toLowerCase())
        );
        setEvents(filtered);
      } else {
        loadEvents();
      }
    }
  }, [open, search, includedEvents]);

  const loadEvents = async () => {
    setLoading(true);
    try {
      const resp = await api.get('/events', { params: { upcoming: true, size: 100, name: search || undefined } });
      setEvents(resp.data.content || []);
    } catch (e) {
      console.error('Błąd ładowania eventów:', e);
    } finally {
      setLoading(false);
    }
  };

  const selectEvent = (event) => {
    onChange(event);
    setOpen(false);
  };

  return (
    <div ref={containerRef} style={{ position: 'relative'}}>
      <button className="btn" onClick={() => setOpen(prev => !prev)}>
        {selectedEvent ? selectedEvent.name : 'Wybierz wydarzenie'}
      </button>

      {open && (
        <div className="dropdown-selector" style={{ position: 'absolute', zIndex: 100, width: '100%', maxHeight: 300, overflowY: 'auto', background: '#fff', border: '1px solid #ccc', padding: 8, minWidth: 200  }}>
          <input
            type="text"
            placeholder="Szukaj wydarzenia..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: '100%', marginBottom: 8, padding: 4 }}
          />

          {events.length === 0 && !loading && <div>Brak wydarzeń</div>}

          {events.map(e => (
            <div
              key={e.id}
              onClick={() => selectEvent(e)}
              className={`select-item ${selectedEvent?.id === e.id ? 'selected' : ''}`}
              style={{ padding: 4, cursor: 'pointer', background: selectedEvent?.id === e.id ? '#eee' : 'transparent' }}
            >
              {e.name} ({formatDateTime(e.startDate)})
            </div>
          ))}

          {loading && <div>Ładowanie...</div>}
        </div>
      )}
    </div>
  );
}
