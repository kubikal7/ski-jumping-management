import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';

export default function HillSelector({ selectedHillId, excludedIds = [], onChange }) {
  const [open, setOpen] = useState(false);
  const [hills, setHills] = useState([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedHill, setSelectedHill] = useState(null);
  const containerRef = useRef(null);
  const pageSize = 8;

  useEffect(() => {
    if (selectedHillId) {
      api
        .get(`/hills/${selectedHillId}`)
        .then((resp) => setSelectedHill(resp.data))
        .catch((e) => console.error('Nie udało się pobrać skoczni:', e));
    } else {
      setSelectedHill(null);
    }
  }, [selectedHillId]);

  useEffect(() => {
    if (open) loadHills(true);
  }, [open, search]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadHills = async (reset = false) => {
    if (loading) return;
    setLoading(true);
    try {
      const resp = await api.get('/hills', {
        params: {
          page: reset ? 0 : page,
          size: pageSize,
          city: search || undefined,
        },
      });

      const filtered = resp.data.content
        ? resp.data.content.filter((h) => !excludedIds.includes(h.id))
        : resp.data.filter((h) => !excludedIds.includes(h.id));

      if (reset) {
        setHills(filtered);
        setPage(1);
      } else {
        setHills((prev) => [...prev, ...filtered]);
        setPage((prev) => prev + 1);
      }
      setHasMore(resp.data.totalPages > (reset ? 1 : page + 1));
    } catch (e) {
      console.error('Błąd ładowania skoczni:', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div ref={containerRef} style={{ position: 'relative' }}>
      <button type="button" className="btn" onClick={() => setOpen((prev) => !prev)}>
        {selectedHill ? selectedHill.name : 'Wybierz skocznię'}
      </button>

      {open && (
        <div className='dropdown-selector'>
          <input
            type="text"
            placeholder="Szukaj skoczni..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: '100%', marginBottom: 8, padding: 4 }}
          />

          {hills.map((h) => (
            <div
              key={h.id}
              onClick={() => {
                setSelectedHill(h);
                setOpen(false);
                onChange?.(h);
              }}
              className='column'
              style={{
                cursor: 'pointer'
              }}
            >
              <span style={{ fontWeight: 600, marginTop: 10}}>{h.city} HS-{h.hillSize}</span>
              <small>
                {h.name}
              </small>
            </div>
          ))}

          {hasMore && (
            <button
              className="btn"
              style={{ width: '100%', marginTop: 10 }}
              onClick={() => loadHills(false)}
              disabled={loading}
            >
              {loading ? 'Ładowanie...' : 'Załaduj więcej'}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
