import React, { useState } from "react";
import { useParams } from "react-router-dom";
import api from "../services/api";
import UserSelector from "../components/UserSelector";
import AthleteCompare from "../components/AthleteCompare";
import { useToast } from '../components/Toast';

export default function ComparePage() {
  const { id } = useParams();

  const [results, setResults] = useState({});
  const [selectedAthletes, setSelectedAthletes] = useState([]);
  const [chartAthletes, setChartAthletes] = useState([]);
  const [selectedMetric, setSelectedMetric] = useState("jumpLength");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [sameEventsOnly, setSameEventsOnly] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { showToast } = useToast();
  const [error, setError] = useState('');

  const handleCompare = async () => {
    setError('');

    if (selectedAthletes.length === 0) {
      setError('Wybierz przynajmniej jednego zawodnika');
      return;
    }
    if (!dateFrom || !dateTo) {
      setError('Wybierz zakres dat (od i do)');
      return;
    }

    try {
      setLoading(true);
      setSubmitted(true);

      const params = new URLSearchParams();
      if (id) params.append("eventId", id);
      selectedAthletes.forEach((a) => params.append("athleteIds", a.id));
      params.append("startDate", dateFrom);
      params.append("endDate", dateTo);

      const resp = await api.get(`/results?${params.toString()}`);
      const fetchedResults = resp.data.content || resp.data;

      const groupedResults = {};
      selectedAthletes.forEach(a => groupedResults[a.id] = { athlete: a, results: [] });
      fetchedResults.forEach(r => {
        if (groupedResults[r.athlete.id]) groupedResults[r.athlete.id].results.push(r);
      });

      Object.values(groupedResults).forEach(g =>
        g.results.sort((a, b) => {
          const dateA = new Date(a.event.startDate);
          const dateB = new Date(b.event.startDate);
          if (dateA - dateB !== 0) return dateA - dateB;
          return a.attemptNumber - b.attemptNumber;
        })
      );

      if (sameEventsOnly) {
        const eventSets = selectedAthletes.map(a => {
          const results = groupedResults[a.id]?.results || [];
          return new Set(results.map(r => r.event.id));
        });
        const commonEvents = eventSets.reduce((acc, set) => acc ? new Set([...acc].filter(x => set.has(x))) : set, null);
        Object.values(groupedResults).forEach(g => {
          g.results = g.results.filter(r => commonEvents.has(r.event.id));
        });
      }

      setResults(groupedResults);
      setChartAthletes(selectedAthletes);
    } catch (e) {
      showToast('Nie udało się pobrać wyników', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Porównanie zawodników</h2>
      <div className="column">
        {error && <div style={{ color: 'red', marginBottom: 8 }}>{error}</div>}
        <div className="card gap" style={{ alignItems: 'center' }}>
          <UserSelector multi={true} onChange={setSelectedAthletes} includedRoleIds={[5]}/>

          <select value={selectedMetric} onChange={(e) => setSelectedMetric(e.target.value)} className="input">
            <option value="jumpLength">Długość skoku</option>
            <option value="totalPoints">Punkty</option>
            <option value="speedTakeoff">Prędkość na progu</option>
            <option value="gate">Belka</option>
            <option value="flightTime">Czas lotu</option>
            <option value="stylePoints">Ocena stylu</option>
            <option value="windCompensation">Korekta wiatru</option>
          </select>

          <label>Od:</label>
          <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="input" />
          <label>Do:</label>
          <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="input" />

          <label style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <input type="checkbox" checked={sameEventsOnly} onChange={(e) => setSameEventsOnly(e.target.checked)} />
            Tylko te same wydarzenia
          </label>

          <button className="btn primary" onClick={handleCompare}>Porównaj</button>
        </div>
      </div>

      {loading && <div>Ładowanie danych...</div>}

      {!loading && submitted && Object.keys(results).length === 0 && (
        <div className="muted">Brak wyników dla wybranych filtrów</div>
      )}

      {!loading && submitted && Object.keys(results).length > 0 && (
        <AthleteCompare groupedResults={results} selectedAthletes={chartAthletes} metric={selectedMetric} />
      )}
    </div>
  );
}
