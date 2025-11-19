import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import Drawer from '../components/Drawer';
import ConfirmModal from '../components/ConfirmModal';
import EventForm from '../components/EventForm';
import UserSelector from '../components/UserSelector';
import ResultForm from '../components/ResultForm';
import { useAuth } from '../context/AuthContext';
import HillDetails from '../components/HillDetails';
import PlayerAvatar from '../components/PlayerAvatar';
import AthleteResultsBlock from '../components/AthleteResultsBlock';
import AthleteCompare from '../components/AthleteCompare';
import { useToast } from '../components/Toast';

function formatDateTime(dateString) {
  const date = new Date(dateString);

  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const yyyy = date.getFullYear();

  const hh = String(date.getHours()).padStart(2, '0');
  const min = String(date.getMinutes()).padStart(2, '0');

  return `${dd}-${mm}-${yyyy} ${hh}:${min}`;
}

const eventLevels = [
  { value: 5, label: 'Zawody międzynarodowe' },
  { value: 4, label: 'Zawody międzynarodowe niższej rangi' },
  { value: 3, label: 'Zawody krajowe' },
  { value: 2, label: 'Zawody regionalne / lokalne' },
  { value: 1, label: 'Trening' },
];

export default function EventProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const { showToast } = useToast();

  const [event, setEvent] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [results, setResults] = useState([]);
  const [editing, setEditing] = useState(false);
  const [addingResult, setAddingResult] = useState(false);
  const [selectedAthlete, setSelectedAthlete] = useState(null);
  const [confirmModal, setConfirmModal] = useState({ open: false, title: '', message: '', action: null });

  const [selectedAthletes, setSelectedAthletes] = useState([]);
  const [selectedMetric, setSelectedMetric] = useState('jumpLength');

  const isOperate = user?.roles?.includes('OPERATE');
  const isAdmin = user?.roles?.includes('ADMIN');
  const isTrainer = user?.roles?.includes('TRAINER') && user?.teamIds?.some(teamId => event?.eventAllowedTeams?.some(t => t.id === teamId));

  useEffect(() => {
    fetchEvent();
    fetchParticipants();
    fetchResults();
  }, [id]);

  const fetchEvent = async () => {
    try {
      const resp = await api.get(`/events/${id}`);
      setEvent(resp.data);
    } catch (e) {
      showToast('Nie udało się pobrać danych wydarzenia', 'error');
    }
  };

  const fetchParticipants = async () => {
    try {
      const resp = await api.get(`/event-participants/by-event/${id}`);
      setParticipants(resp.data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchResults = async () => {
    try {
      const resp = await api.get(`/results?eventId=${id}`);
      setResults(resp.data.content || resp.data);
    } catch (e) {
      console.error(e);
    }
  };

  const showConfirm = (title, message, action) => {
    setConfirmModal({ open: true, title, message, action });
  };

  const handleConfirm = async () => {
    setConfirmModal(prev => ({ ...prev, open: false }));
    if (confirmModal.action) await confirmModal.action();
  };

  const deleteEvent = async () => {
    try {
      await api.delete(`/events/${id}`);
      showToast('Wydarzenie zostało usunięte', 'success');
      navigate('/events');
    } catch (e) {
      showToast('Błąd podczas usuwania wydarzenia', 'error');
    }
  };

  const deleteParticipant = async (participantId) => {
    try {
      await api.delete(`/event-participants/${participantId}`);
      await fetchParticipants();
      showToast('Powołanie zostało usunięte', 'success');
    } catch (e) {
      showToast('Błąd podczas usuwania powołania', 'error');
    }
  };

  const addParticipant = async () => {
    if (!selectedAthlete) return;

    try {
      const resp = await api.get(`/injuries`, {
        params: {
          athleteIds: [selectedAthlete.id],
          eventStart: event.startDate.split('T')[0],
          eventEnd: event.endDate.split('T')[0],
          size: 1
        }
      });

      const injuries = resp.data.content || resp.data;

      if (injuries.length > 0) {
        showConfirm(
          'Zawodnik kontuzjowany',
          `Zawodnik ${selectedAthlete.firstName} ${selectedAthlete.lastName} ma kontuzję w czasie trwania zawodów. Czy mimo to chcesz go dodać?`,
          async () => {
            await api.post(`/event-participants`, {
              eventId: id,
              athleteId: selectedAthlete.id
            });
            await fetchParticipants();
            setSelectedAthlete(null);
            showToast(`Zawodnik ${selectedAthlete.firstName} ${selectedAthlete.lastName} został powołany`, 'success');
          }
        );
      } else {
        await api.post(`/event-participants`, {
          eventId: id,
          athleteId: selectedAthlete.id
        });
        await fetchParticipants();
        setSelectedAthlete(null);
        showToast(`Zawodnik ${selectedAthlete.firstName} ${selectedAthlete.lastName} został powołany`, 'success');
      }
    } catch (e) {
      showToast('Błąd podczas powoływania zawodnika', 'error');
    }
  };

  const groupedResults = results.reduce((acc, r) => {
    const athleteId = r.athlete.id;
    if (!acc[athleteId]) {
      acc[athleteId] = {
        athlete: r.athlete,
        results: [],
      };
    }
    acc[athleteId].results.push(r);
    return acc;
  }, {});

  Object.values(groupedResults).forEach(g => {
    g.results.sort((a, b) => a.attemptNumber - b.attemptNumber);
  });


  if (!event) return <div>Ładowanie...</div>;

  return (
    <div>
      <h2>{event.name}</h2>
      <h5 className='muted'>{event.description}</h5>

      <div className='card gap'>
        {(isAdmin || isOperate) && (
            <button className="btn" onClick={() => setEditing(true)}>
              Edytuj wydarzenie
            </button>
        )}
        {(isAdmin || isTrainer) && (
          <>
            <button className="btn" onClick={() => setAddingResult(true)}>
              Dodaj rezultat
            </button>
            
            <UserSelector
              excludedIds={participants.map(p => p.athlete.id)}
              includedRoleIds={[5]}
              onChange={setSelectedAthlete}
            />
            {selectedAthlete && (
              <button className="btn primary" onClick={addParticipant}>
                Dodaj
              </button>
            )}
          </>
        )}

        {isAdmin && (
          <button
            className="btn danger"
            onClick={() =>
              showConfirm(
                'Usuwanie wydarzenia',
                `Czy na pewno chcesz usunąć wydarzenie ${event.name}?`,
                deleteEvent
              )
            }
          >
            Usuń wydarzenie
          </button>
        )}
      </div>

      <div className="card">
        <table className="hill-table">
          <tbody>
            <tr>
              <td className="label">Nazwa</td>
              <td>{event.name}</td>
            </tr>
            <tr>
              <td className="label">Typ</td>
              <td>{event.type}</td>
            </tr>
            <tr>
              <td className="label">Poziom</td>
              <td>
                {event.level} - {eventLevels.find(l => l.value === event.level)?.label}
              </td>
            </tr>
            <tr>
              <td className="label">Od</td>
              <td>{formatDateTime(event.startDate)}</td>
            </tr>
            <tr>
              <td className="label">Do</td>
              <td>{formatDateTime(event.endDate)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h3>Skocznia</h3>
      <HillDetails hill={event.hill} />

      <h3>Powołani</h3>

      {participants.length === 0 ? (
        <div className="muted">Brak powołanych</div>
      ) : (
        <div className="player-grid">
          {participants.map((p) => (
            <div
              key={p.id}
              className="player-card"
              onClick={() => navigate(`/users/${p.athlete.id}`)}
              style={{ cursor: 'pointer' }}
            >
              <PlayerAvatar photoUrl={p.photoUrl} />

              <div style={{ fontWeight: 600 }}>
                {p.athlete.firstName} {p.athlete.lastName}
              </div>

              {(isAdmin || isTrainer) && (
                <button
                  className="btn danger"
                  onClick={(e) => {
                    e.stopPropagation();
                    showConfirm(
                      'Usuwanie powołania',
                      `Czy na pewno chcesz usunąć ${p.athlete.firstName} ${p.athlete.lastName}?`,
                      () => deleteParticipant(p.id)
                    );
                  }}
                >
                  Usuń
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      <h3>Rezultaty</h3>

      {Object.values(groupedResults).length === 0 ? (
        <div className='muted'>
          Brak rezultatów
        </div>
      ) : (
        Object.values(groupedResults).map(({ athlete, results }) => (
          <AthleteResultsBlock
            key={athlete.id}
            athlete={athlete}
            results={results}
            onEdit={(r) => setAddingResult({ edit: true, data: r })}
            onDelete={(r) =>
              showConfirm(
                'Usuwanie rezultatu',
                `Czy na pewno chcesz usunąć wynik próby ${r.attemptNumber} zawodnika ${athlete.firstName} ${athlete.lastName}?`,
                async () => {
                  await api.delete(`/results/${r.id}`);
                  fetchResults();
                }
              )
            }
          />
        ))
      )}

      <h3>Porównaj</h3>

      <div className='row'>
        <UserSelector
          includedUsers={Object.values(groupedResults).map(g => g.athlete)}
          multi={true}
          onChange={setSelectedAthletes}
        />

        <select value={selectedMetric} onChange={e => setSelectedMetric(e.target.value)} className="input">
          <option value="jumpLength">Długość skoku</option>
          <option value="totalPoints">Punkty</option>
          <option value="speedTakeoff">Prędkość na progu</option>
          <option value="flightTime">Czas lotu</option>
          <option value="stylePoints">Ocena stylu</option>
          <option value="windCompensation">Korekta wiatru</option>
        </select>
      </div>

      <AthleteCompare
        groupedResults={groupedResults}
        selectedAthletes={selectedAthletes}
        metric={selectedMetric}
      />

      <Drawer open={editing} title="Edytuj wydarzenie" onClose={() => setEditing(false)}>
        <EventForm
            initialData={{
            id: event.id,
            name: event.name || '',
            type: event.type || '',
            hillId: event.hill?.id || null,
            startDate: event.startDate || '',
            endDate: event.endDate || '',
            description: event.description || '',
            level: event.level || '',
            allowedTeamIds: event.eventAllowedTeams?.map(t => t.id) || []
            }}
          onSubmit={async (data) => {
            try {
              await api.put(`/events/${id}`, data);
              setEditing(false);
              await fetchEvent();
              showToast('Wydarzenie zaktualizowane', 'success');
            } catch (e) {
              showToast('Błąd aktualizacji wydarzenia', 'error');
            }
          }}
        />
      </Drawer>

      <Drawer
        open={!!addingResult}
        title={addingResult?.edit ? 'Edytuj rezultat' : 'Dodaj rezultat'}
        onClose={() => setAddingResult(false)}
      >
        {addingResult && (
          <ResultForm
            key={addingResult?.data?.id || 'new'}
            initialData={{
              eventId: id,
              ...addingResult?.data,
            }}
            participants={participants}
            onSubmit={async (resultData) => {
              try {
                if (addingResult?.edit) {
                  await api.put(`/results/${addingResult.data.id}`, resultData);
                } else {
                  await api.post(`/results`, resultData);
                }
                setAddingResult(false);
                await fetchResults();
                showToast('Rezultat zapisany', 'success');
              } catch (e) {
                showToast('Błąd zapisu rezultatu', 'error');
              }
            }}
          />
        )}
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
