import React, { useEffect, useState } from 'react';
import api from '../services/api';
import Drawer from '../components/Drawer';
import TeamSelector from '../components/TeamSelector';
import HillSelector from '../components/HillSelector';
import EventList from '../components/EventList';
import EventForm from '../components/EventForm.jsx';
import { useToast } from '../components/Toast';

function emptyEventRequest() {
  return {
    name: '',
    type: '',
    hillId: null,
    startDate: '',
    endDate: '',
    description: '',
    level: '',
    teamIds: []
  };
}

export default function EventsPage() {
  const [events, setEvents] = useState([]);
  const [page, setPage] = useState(0);
  const [size] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [sortBy, setSortBy] = useState('startDate');
  const [sortDirection, setSortDirection] = useState('asc');
  const { showToast } = useToast();

  const [filters, setFilters] = useState({
    name: '',
    type: '',
    hillId: '',
    startDateFrom: '',
    startDateTo: '',
    endDateFrom: '',
    endDateTo: '',
    level: '',
    teamIds: []
  });

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [creatingEvent, setCreatingEvent] = useState(emptyEventRequest());

  useEffect(() => {
    fetchEvents();
  }, [page, sortBy, sortDirection]);

  const fetchEvents = async () => {
    try {
      const params = {
        page,
        size,
        sortBy,
        sortDirection,
      };

      if (filters.name) params.name = filters.name;
      if (filters.type) params.type = filters.type;
      if (filters.hillId) params.hillId = filters.hillId;
      if (filters.startDateFrom) params.startDateFrom = filters.startDateFrom;
      if (filters.startDateTo) params.startDateTo = filters.startDateTo;
      if (filters.endDateFrom) params.endDateFrom = filters.endDateFrom;
      if (filters.endDateTo) params.endDateTo = filters.endDateTo;
      if (filters.level) params.level = filters.level;
      if (filters.teamIds.length > 0) params.teamIds = filters.teamIds;

      const resp = await api.get('/events', { params });
      const data = resp.data;
      setEvents(data.content || []);
      setTotalPages(data.totalPages || 0);
    } catch (e) {
      console.error('Błąd pobierania wydarzeń:', e);
    }
  };

  const onSearch = () => {
    setPage(0);
    fetchEvents();
  };

  const createEvent = async () => {
    try {
      await api.post('/events', creatingEvent);
      setDrawerOpen(false);
      fetchEvents();
      showToast('Utworzono wydarzenie', 'success');
    } catch (e) {
      showToast('Błąd tworzenia wydarzenia', 'error');
    }
  };

  console.log(events)

  return (
    <div>
      <div className='tool-title'>
        <h2>Wydarzenia</h2>

        <button
          className="btn primary"
          onClick={() => {
            setCreatingEvent(emptyEventRequest());
            setDrawerOpen(true);
          }}
        >
          + Nowe wydarzenie
        </button>
      </div>

      <div className="column">
        <div className="card gap" style={{ alignItems: 'center' }}>
          <input
            className="input"
            placeholder="Nazwa"
            value={filters.name}
            onChange={e => setFilters(f => ({ ...f, name: e.target.value }))}
          />
          <select
            className="input"
            value={filters.type}
            onChange={e => setFilters(f => ({ ...f, type: e.target.value }))}
          >
            <option value="">Wszystkie typy</option>
            <option value="TRAINING">Trening</option>
            <option value="COMPETITION">Zawody</option>
            <option value="CAMP">Obóz</option>
          </select>

          <HillSelector
            onChange={hill => setFilters(f => ({ ...f, hillId: hill ? hill.id : '' }))}
          />

          <TeamSelector
            selectedTeams={filters.teamIds}
            onChange={teamIds => setFilters(f => ({ ...f, teamIds }))}
          />


            <label>Od:</label>
            <input
              className="input"
              type="date"
              value={filters.startDateFrom}
              onChange={(e) =>
                setFilters((f) => ({ ...f, startDateFrom: e.target.value }))
              }
            />
            <label>Do:</label>
            <input
              className="input"
              type="date"
              value={filters.startDateTo}
              onChange={(e) =>
                setFilters((f) => ({ ...f, startDateTo: e.target.value }))
              }
            />


          <input
            className="input"
            type="number"
            placeholder="Poziom"
            value={filters.level}
            onChange={e => setFilters(f => ({ ...f, level: e.target.value }))}
          />

          <button className="btn" onClick={onSearch}>Szukaj</button>
        </div>

        <div>
          {events.length === 0 ? (
            <div className="muted">Brak wyników</div>
          ) : (
            <EventList
              events={events}
              sortBy={sortBy}
              sortDirection={sortDirection}
              onSortChange={(field) => {
                if (sortBy === field) {
                  setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
                } else {
                  setSortBy(field);
                  setSortDirection('asc');
                }
                setPage(0);
              }}
            />
          )}
        </div>

        <div className='card gap' style={{ justifyContent: 'center' }}>
          <button className="btn" disabled={page === 0} onClick={() => setPage(p => Math.max(p - 1, 0))}>
            &lt; Poprzednia
          </button>
          <span style={{ alignSelf: 'center' }}>Strona {page + 1} z {totalPages}</span>
          <button
            className="btn"
            disabled={page >= totalPages - 1}
            onClick={() => setPage(p => Math.min(p + 1, totalPages - 1))}
          >
            Następna &gt;
          </button>
        </div>
      </div>

      <Drawer open={drawerOpen} title="Nowe wydarzenie" onClose={() => setDrawerOpen(false)}>
        <EventForm
          onSubmit={async (eventData) => {
            try {
              await api.post('/events', eventData);
              setDrawerOpen(false);
              fetchEvents();
              showToast('Utworzono wydarzenie', 'success');
            } catch (e) {
              showToast('Błąd tworzenia wydarzenia', 'error');
            }
          }}
        />
      </Drawer>
    </div>
  );
}
