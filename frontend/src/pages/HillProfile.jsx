import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import Drawer from '../components/Drawer';
import HillForm from '../components/HillForm';
import ConfirmModal from '../components/ConfirmModal';
import HillDetails from '../components/HillDetails';
import EventList from '../components/EventList';
import { useToast } from '../components/Toast';

export default function HillProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [hill, setHill] = useState(null);
  const [editing, setEditing] = useState(false);
  const [confirmModal, setConfirmModal] = useState({ open: false, title: '', message: '', action: null });
  const [hasEvents, setHasEvents] = useState(false);
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    fetchHill();
    checkEvents();
  }, [id]);

  const fetchHill = async () => {
    try {
      const resp = await api.get(`/hills/${id}`);
      const hillData = resp.data;

      const [past, upcoming] = await Promise.all([
        api.get(`/events/hill/${id}/past`, { params: { page: 0, size: 5 } }),
        api.get(`/events/hill/${id}/upcoming`, { params: { page: 0, size: 5 } })
      ]);
      hillData.pastEvents = past.data.content || [];
      hillData.upcomingEvents = upcoming.data.content || [];
      
      setHill(hillData);
    } catch (e) {
      showToast('Nie udało się pobrać danych skoczni', 'error');
    }
  };

  const checkEvents = async () => {
    try {
      const resp = await api.get(`/events/hill/${id}/has-events`);
      setHasEvents(resp.data);
    } catch (e) {
      console.error(e);
      setHasEvents(false);
    }
  };

  const showConfirm = (title, message, action) => {
    setConfirmModal({ open: true, title, message, action });
  };

  const handleConfirm = async () => {
    setConfirmModal(prev => ({ ...prev, open: false }));
    if (confirmModal.action) await confirmModal.action();
  };

  const deleteHill = async () => {
    try {
      await api.delete(`/hills/${id}`);
      showToast('Skocznia została usunięta', 'success');
      navigate('/hills');
    } catch (e) {
      showToast('Błąd podczas usuwania skoczni', 'error');
    }
  };

  if (!hill) return <div>Ładowanie...</div>;

  const mapCenter = hill.latitude && hill.longitude
    ? [parseFloat(hill.latitude), parseFloat(hill.longitude)]
    : [0, 0];

  const mapZoom = hill.latitude && hill.longitude ? 8 : 2;

  return (
    <div style={{ width: '100%' }}>
      <h2>{hill.name}</h2>

      <div className='card gap'>
        <button className="btn" onClick={() => setEditing(true)}>Edytuj dane</button>
        <div
          style={{ position: 'relative', display: 'inline-block' }}
          onMouseEnter={() => setTooltipVisible(true)}
          onMouseLeave={() => setTooltipVisible(false)}
        >
          <button
            className="btn"
            disabled={hasEvents}
            onClick={() =>
              showConfirm(
                'Usuwanie skoczni',
                `Czy na pewno chcesz usunąć skocznię ${hill.name}?`,
                deleteHill
              )
            }
          >
            Usuń skocznię
          </button>
          {hasEvents && tooltipVisible && (
            <div
              style={{
                position: 'absolute',
                top: '-1.5rem',
                left: '50%',
                transform: 'translateX(-50%)',
                background: 'rgba(0,0,0,0.75)',
                color: '#fff',
                padding: '4px 8px',
                fontSize: 12,
                borderRadius: 4,
                whiteSpace: 'nowrap',
                zIndex: 10,
              }}
            >
              Nie można usunąć – przypisana do wydarzenia
            </div>
          )}
        </div>
      </div>

      <HillDetails hill={hill} />

      <div className="card">
        <div style={{ flex: 1 }}>
          <h3>Poprzednie zawody</h3>
          <div>
            {hill.pastEvents?.length ? (
              <EventList
                 events={hill.pastEvents}
                sortBy="startDate"
                sortDirection="desc"
                onSortChange={() => {}}
               />
            ) : (
              <div className='muted'>Brak danych</div>
            )}
          </div>
        </div>
      
        <div style={{ flex: 1 }}>
           <h3>Nadchodzące zawody</h3>
          <div>
             {hill.upcomingEvents?.length ? (
               <EventList
                events={hill.upcomingEvents}
                sortBy="startDate"
                sortDirection="asc"
                onSortChange={() => {}}
              />
            ) : (
              <div className='muted'>Brak danych</div>
            )}
          </div>
        </div>
      </div>

      <Drawer open={editing} title="Edytuj skocznię" onClose={() => setEditing(false)}>
        <HillForm
          initialData={{
            name: hill.name,
            city: hill.city,
            country: hill.country,
            hillSize: hill.hillSize,
            constructionPoint: hill.constructionPoint,
            latitude: hill.latitude,
            longitude: hill.longitude
          }}
          onSubmit={async (hillData) => {
            try {
              await api.put(`/hills/${id}`, hillData);
              setEditing(false);
              await fetchHill();
              showToast('Dane skoczni zaktualizowane', 'success');
            } catch (e) {
              showToast('Błąd aktualizacji skoczni', 'error');
            }
          }}
        />
      </Drawer>

      <ConfirmModal
        open={confirmModal.open}
        title={confirmModal.title}
        message={confirmModal.message}
        onConfirm={handleConfirm}
        onCancel={() => setConfirmModal(prev => ({ ...prev, open: false }))}
      />
    </div>
  );
}
