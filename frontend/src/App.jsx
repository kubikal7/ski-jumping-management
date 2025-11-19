import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Login from './pages/Login';
import ChangePassword from './pages/ChangePassword';
import UsersPage from './pages/UsersPage';
import UserProfile from './pages/UserProfile';
import TeamsPage from './pages/TeamsPage';
import MyTeamsPage from './pages/MyTeamsPage';
import TeamPage from './pages/TeamPage';
import HillsPage from './pages/HillsPage';
import HillProfile from './pages/HillProfile';
import EventsPage from './pages/EventsPage';
import EventProfile from './pages/EventProfile';
import ComparePage from './pages/ComparePage';
import InjuriesPage from './pages/InjuriesPage';
import SuggestionPage from './pages/SuggestionPage';
import MyEventsPage from './pages/MyEventsPage';
import CalendarPage from './pages/CalendarPage';
import AthletesPage from './pages/AthletesPage';
import ProtectedRoute from './components/ProtectedRoute';
import { useAuth } from './context/AuthContext';
import Toast from './components/Toast';

const items = [
  { to: '/', label: 'Kalendarz', roles: [] },
  { to: '/users', label: 'Użytkownicy', roles: ['ADMIN','MANAGER'] },
  { to: '/athletes', label: 'Zawodnicy', roles: ['ADMIN','TRAINER'] },
  { to: '/teams', label: 'Drużyny', roles: ['ADMIN','MANAGER'] },
  { to: '/my-teams', label: 'Moje Drużyny', roles: [] },
  { to: '/hills', label: 'Skocznie', roles: ['ADMIN','OPERATE'] },
  { to: '/events', label: 'Wydarzenia', roles: ['ADMIN','OPERATE'] },
  { to: '/my-events', label: 'Moje wydarzenia', roles: [] },
  { to: '/compare', label: 'Porównaj', roles: [] },
  { to: '/suggestion', label: 'Sugestia', roles: ['ADMIN','TRAINER'] },
  { to: '/injuries', label: 'Kontuzje', roles: ['ADMIN','INJURY_MANAGER'] },
];

const routeMap = {
  '/': CalendarPage,
  '/users': UsersPage,
  '/athletes': AthletesPage,
  '/users/:id': UserProfile,
  '/teams': TeamsPage,
  '/my-teams': MyTeamsPage,
  '/teams/:id': TeamPage,
  '/hills': HillsPage,
  '/hills/:id': HillProfile,
  '/events': EventsPage,
  '/events/:id': EventProfile,
  '/my-events': MyEventsPage,
  '/compare': ComparePage,
  '/injuries': InjuriesPage,
  '/suggestion': SuggestionPage,
};

export default function App() {
  const { isAuthenticated } = useAuth();

  return (
    <Toast>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/change-password" element={<ChangePassword />} />

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          {items.map(item => {
            const Element = routeMap[item.to];
            if (!Element) return null;

            return (
              <Route
                key={item.to}
                path={item.to === '/' ? '' : item.to.slice(1)}
                element={
                  <ProtectedRoute requiredRoles={item.roles}>
                    <Element />
                  </ProtectedRoute>
                }
              />
            );
          })}

          <Route path="users/:id" element={<UserProfile />} />
          <Route path="teams/:id" element={<TeamPage />} />
          <Route path="hills/:id" element={<HillProfile />} />
          <Route path="events/:id" element={<EventProfile />} />
        </Route>

        <Route path="*" element={<Navigate to={isAuthenticated ? "/" : "/login"} />} />
      </Routes>
    </Toast>
  );
}
