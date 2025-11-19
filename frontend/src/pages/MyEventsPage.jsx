import React, { useEffect, useState } from "react";
import api from "../services/api";
import EventList from "../components/EventList";
import HillSelector from "../components/HillSelector";
import TeamSelector from "../components/TeamSelector";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../components/Toast";

export default function MyEventsPage() {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [events, setEvents] = useState([]);
  const [page, setPage] = useState(0);
  const [size] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);

  const [sortBy, setSortBy] = useState("startDate");
  const [sortDirection, setSortDirection] = useState("asc");

  const [filters, setFilters] = useState({
    name: "",
    type: "",
    hillId: "",
    startDateFrom: "",
    startDateTo: "",
    endDateFrom: "",
    endDateTo: "",
    level: "",
  });

  useEffect(() => {
    fetchMyEvents();
  }, [page, sortBy, sortDirection, user]);

  const fetchMyEvents = async () => {
    if (!user) return;

    setLoading(true);

    try {
      const params = {
        page,
        size,
        sortBy,
        sortDirection,
      };

      const roles = user.roles || [];
      const teamIds = user.teamIds || [];

      if (roles.includes("ATHLETE")) {
        params.athleteIds = [user.id];
      }

      if (!roles.includes("ATHLETE")) {
        if (teamIds.length === 0) {
          setEvents([]);
          setTotalPages(0);
          setLoading(false);
          return;
        }
        params.teamIds = teamIds;
      }

      if (filters.name) params.name = filters.name;
      if (filters.type) params.type = filters.type;
      if (filters.hillId) params.hillId = filters.hillId;
      if (filters.startDateFrom) params.startDateFrom = filters.startDateFrom;
      if (filters.startDateTo) params.startDateTo = filters.startDateTo;
      if (filters.endDateFrom) params.endDateFrom = filters.endDateFrom;
      if (filters.endDateTo) params.endDateTo = filters.endDateTo;
      if (filters.level) params.level = filters.level;

      const resp = await api.get("/events", { params });

      setEvents(resp.data.content || []);
      setTotalPages(resp.data.totalPages || 0);
    } catch (e) {
      console.error(e);
      showToast("Błąd pobierania wydarzeń", "error");
    } finally {
      setLoading(false);
    }
  };

  const onSearch = () => {
    setPage(0);
    fetchMyEvents();
  };

  return (
    <div>
      <h2>Moje wydarzenia</h2>

      <div className="card gap" style={{ alignItems: "center" }}>
        <input
          className="input"
          placeholder="Nazwa"
          value={filters.name}
          onChange={(e) => setFilters((f) => ({ ...f, name: e.target.value }))}
        />

        <select
          className="input"
          value={filters.type}
          onChange={(e) => setFilters((f) => ({ ...f, type: e.target.value }))}
        >
          <option value="">Wszystkie typy</option>
          <option value="TRAINING">Trening</option>
          <option value="COMPETITION">Zawody</option>
          <option value="CAMP">Obóz</option>
        </select>

        <HillSelector
          onChange={(hill) =>
            setFilters((f) => ({ ...f, hillId: hill ? hill.id : "" }))
          }
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
          onChange={(e) =>
            setFilters((f) => ({ ...f, level: e.target.value }))
          }
        />

        <button className="btn" onClick={onSearch}>
          Szukaj
        </button>
      </div>

      {loading ? (
        <div className="muted">Ładowanie...</div>
      ) : events.length === 0 ? (
        <div className="muted">Brak wydarzeń</div>
      ) : (
        <EventList
          events={events}
          sortBy={sortBy}
          sortDirection={sortDirection}
          onSortChange={(field) => {
            if (sortBy === field) {
              setSortDirection(sortDirection === "asc" ? "desc" : "asc");
            } else {
              setSortBy(field);
              setSortDirection("asc");
            }
            setPage(0);
          }}
        />
      )}

      {events.length > 0 && (
        <div className="card gap" style={{ justifyContent: "center" }}>
          <button
            className="btn"
            disabled={page === 0}
            onClick={() => setPage((p) => Math.max(p - 1, 0))}
          >
            &lt; Poprzednia
          </button>

          <span style={{ alignSelf: "center" }}>
            Strona {page + 1} z {totalPages}
          </span>

          <button
            className="btn"
            disabled={page >= totalPages - 1}
            onClick={() => setPage((p) => Math.min(p + 1, totalPages - 1))}
          >
            Następna &gt;
          </button>
        </div>
      )}
    </div>
  );
}
