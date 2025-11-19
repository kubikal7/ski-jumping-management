import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../components/Toast";

export default function CalendarPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [events, setEvents] = useState([]);

  useEffect(() => {
    fetchEventsForCalendar();
  }, [currentMonth, currentYear, user]);

  const formatDate = (year, month, day) => {
    const date = new Date(year, month, day);
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  const fetchEventsForCalendar = async () => {
    if (!user) return;

    try {
      const firstDay = formatDate(currentYear, currentMonth, 1);
      const lastDay = formatDate(currentYear, currentMonth + 1, 0);

      const params = {
        startDateFrom: firstDay,
        startDateTo: lastDay,
        endDateFrom: firstDay,
        endDateTo: lastDay,
        page: 0,
        size: 200,
        sortBy: "startDate",
        sortDirection: "asc",
      };

      const roles = user.roles || [];
      const teamIds = user.teamIds || [];

      if (roles.includes("ATHLETE")) {
        params.athleteIds = [user.id];
      }

      if (!roles.includes("ATHLETE")) {
        if (teamIds.length === 0) {
          setEvents([]);
          return;
        }
        params.teamIds = teamIds;
      }

      const resp = await api.get("/events", { params });
      setEvents(resp.data.content || []);
    } catch (e) {
      console.error(e);
      showToast("Błąd pobierania wydarzeń", "error");
    }
  };

  console.log(events)

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayWeek = new Date(currentYear, currentMonth, 1).getDay();

  const weeks = [];
  let day = 1;

  for (let w = 0; w < 6; w++) {
    const week = [];
    for (let d = 0; d < 7; d++) {
      if (w === 0 && d < (firstDayWeek === 0 ? 6 : firstDayWeek - 1)) {
        week.push(null);
      } else if (day > daysInMonth) {
        week.push(null);
      } else {
        week.push(day);
        day++;
      }
    }
    weeks.push(week);
  }

  const monthName = new Date(currentYear, currentMonth)
    .toLocaleString("pl-PL", { month: "long" });

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentYear(y => y - 1);
      setCurrentMonth(11);
    } else {
      setCurrentMonth(m => m - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentYear(y => y + 1);
      setCurrentMonth(0);
    } else {
      setCurrentMonth(m => m + 1);
    }
  };

    const dayEvents = (dayNum) => {
    const cellDate = new Date(currentYear, currentMonth, dayNum);
    return events.map(ev => {
        const start = new Date(ev.startDate);
        const end = new Date(ev.endDate);

        const startDateOnly = new Date(start.getFullYear(), start.getMonth(), start.getDate());
        const endDateOnly = new Date(end.getFullYear(), end.getMonth(), end.getDate());

        if (cellDate < startDateOnly || cellDate > endDateOnly) return null;

        const formatTime = (date) => {
        const hh = String(date.getHours()).padStart(2, "0");
        const mm = String(date.getMinutes()).padStart(2, "0");
        return `${hh}:${mm}`;
        };

        let timeStr = "";
        if (startDateOnly.getTime() === endDateOnly.getTime()) {
        timeStr = `${formatTime(start)} - ${formatTime(end)}`;
        } else if (cellDate.getTime() === startDateOnly.getTime()) {
        timeStr = `Początek: ${formatTime(start)}`;
        } else if (cellDate.getTime() === endDateOnly.getTime()) {
        timeStr = `Koniec: ${formatTime(end)}`;
        }

        return { ...ev, displayTimes: timeStr };
    }).filter(Boolean);
    };

  const goToEvent = (eventId) => {
    navigate(`/events/${eventId}`);
  };

  return (
    <div>
      <div className="tool-title">
        <button className="btn" onClick={prevMonth}>&lt;</button>
        <h2>{monthName.charAt(0).toUpperCase() + monthName.slice(1)} {currentYear}</h2>
        <button className="btn" onClick={nextMonth}>&gt;</button>
      </div>

      <div className="calendar-grid">
        {["Pon", "Wt", "Śr", "Czw", "Pt", "Sob", "Nd"].map(d => (
          <div className="calendar-header" key={d}>{d}</div>
        ))}

        {weeks.map((week, wi) =>
          week.map((dayNum, di) => (
            <div key={wi + "-" + di} className="calendar-cell">
              {dayNum && (
                <div>
                  <div className="calendar-date">{dayNum}</div>
                  <div className="calendar-events">
                    {dayEvents(dayNum).map(ev => (
                    <div
                        key={ev.id}
                        className="calendar-event"
                        onClick={() => goToEvent(ev.id)}
                        style={{ cursor: "pointer" }}
                        title={`${new Date(ev.startDate).toLocaleString()} - ${new Date(ev.endDate).toLocaleString()}`}
                    >
                        <div>{ev.name}</div>
                        {ev.displayTimes && <div style={{ fontSize: 10, color: '#555' }}>{ev.displayTimes}</div>}
                    </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
