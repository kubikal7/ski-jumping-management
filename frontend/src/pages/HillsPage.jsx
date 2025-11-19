import React, { useEffect, useState } from 'react';
import api from '../services/api';
import Drawer from '../components/Drawer';
import HillForm from '../components/HillForm';
import ListHillCard from '../components/ListHillCard';
import { useToast } from '../components/Toast';

function emptyHill() {
  return {
    name: '',
    city: '',
    country: '',
    hillSize: '',
    constructionPoint: '',
    latitude: '',
    longitude: ''
  };
}

export default function HillsPage() {
  const [hills, setHills] = useState([]);
  const [page, setPage] = useState(0);
  const [size] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [sortBy, setSortBy] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [creatingHill, setCreatingHill] = useState(emptyHill());
  const { showToast } = useToast();

  const [filters, setFilters] = useState({
    name: '',
    city: '',
    country: '',
    minHillSize: '',
    maxHillSize: '',
    minKPoint: '',
    maxKPoint: ''
  });

  useEffect(() => {
    fetchHills();
  }, [page, sortBy, sortDirection]);

  const fetchHills = async () => {
    try {
      const params = { page, size, sortBy, sortDirection };
      Object.entries(filters).forEach(([key, val]) => {
        if (val) params[key] = val;
      });

      const resp = await api.get('/hills', { params });
      const data = resp.data;
      setHills(data.content || []);
      setTotalPages(data.totalPages || 0);
    } catch (e) {
      console.error(e);
    }
  };

  const onSearch = () => {
    setPage(0);
    fetchHills();
  };

  const createHill = async () => {
    try {
      await api.post('/hills', creatingHill);
      setDrawerOpen(false);
      fetchHills();
    } catch (e) {
      showToast('Błąd tworzenia skoczni', 'error');
    }
  };

  return (
    <div>
      <div className='tool-title'>
        <h2>Skocznie</h2>
        <button className="btn primary" onClick={() => { setCreatingHill(emptyHill()); setDrawerOpen(true); }}>
          + Nowa skocznia
        </button>
      </div>

      <div className="column">
        <div className="card gap">
          <input className="input" placeholder="Nazwa" value={filters.name}
                 onChange={e => setFilters(f => ({ ...f, name: e.target.value }))} />
          <input className="input" placeholder="Miasto" value={filters.city}
                 onChange={e => setFilters(f => ({ ...f, city: e.target.value }))} />
          <input className="input" placeholder="Kraj" value={filters.country}
                 onChange={e => setFilters(f => ({ ...f, country: e.target.value }))} />
          <input className="input" type="number" placeholder="Min HS" value={filters.minHillSize}
                 onChange={e => setFilters(f => ({ ...f, minHillSize: e.target.value }))} />
          <input className="input" type="number" placeholder="Max HS" value={filters.maxHillSize}
                 onChange={e => setFilters(f => ({ ...f, maxHillSize: e.target.value }))} />
          <input className="input" type="number" placeholder="Min K" value={filters.minKPoint}
                 onChange={e => setFilters(f => ({ ...f, minKPoint: e.target.value }))} />
          <input className="input" type="number" placeholder="Max K" value={filters.maxKPoint}
                 onChange={e => setFilters(f => ({ ...f, maxKPoint: e.target.value }))} />
          <button className="btn" onClick={onSearch}>Szukaj</button>
        </div>

        {hills.length === 0 ? (
          <div className="muted">Brak wyników</div>
        ) : (
            <ListHillCard
            hills={hills}
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

        {hills.length > 0 &&
          <div className='card gap' style={{ justifyContent: 'center' }}>
            <button className="btn" disabled={page === 0} onClick={() => setPage(p => Math.max(p - 1, 0))}>&lt; Poprzednia</button>
            <span style={{ alignSelf: 'center' }}>Strona {page + 1} z {totalPages}</span>
            <button className="btn" disabled={page >= totalPages - 1} onClick={() => setPage(p => Math.min(p + 1, totalPages - 1))}>Następna &gt;</button>
          </div>
        }
      </div>

      <Drawer open={drawerOpen} title="Nowa skocznia" onClose={() => setDrawerOpen(false)}>
        <HillForm
          initialData={creatingHill}
          onSubmit={async (hillData) => {
            try {
              console.log(hillData)
              await api.post('/hills', hillData);
              setDrawerOpen(false);
              fetchHills();
              showToast('Utworzono skocznie', 'success');
            } catch (e) {
              showToast('Błąd tworzenia skoczni', 'error');
            }
          }}
        />
      </Drawer>
    </div>
  );
}
