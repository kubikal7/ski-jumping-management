import React, { createContext, useContext, useState } from "react";
import { getToken, saveToken, clearAuth } from "../services/auth";
import api from "../services/api";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [token, setToken] = useState(getToken());
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [forceChangePassword, setForceChangePassword] = useState(false);

  const normalizeUserData = (userData) => {
    if (!userData) return null;
    return {
      ...userData,
      roles: userData.roles?.map(r => (typeof r === "string" ? r : r.name)) || [],
      teamIds: userData.teams?.map(t => t.id) || []
    };
  };

  const fetchCurrentUser = async () => {
    if (!token || forceChangePassword) return null;
    setLoading(true);
    try {
      const resp = await api.get("/users/me");
      const normalized = normalizeUserData(resp.data);
      setUser(normalized);
      return normalized;
    } catch (err) {
      console.error("Błąd pobierania /users/me:", err);
      logout();
      return null;
    } finally {
      setLoading(false);
    }
  };

  const login = (tokenVal, mustChangePassword = false) => {
    saveToken(tokenVal);
    setToken(tokenVal);
    setForceChangePassword(mustChangePassword);

    if (!mustChangePassword) {
      fetchCurrentUser();
    }
  };

  const finishChangePassword = async () => {
    setForceChangePassword(false);
    await fetchCurrentUser();
  };

  const logout = () => {
    clearAuth();
    setToken(null);
    setUser(null);
  };

  const verifyAuth = async () => {
    const userData = await fetchCurrentUser();
    return !!userData;
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        login,
        logout,
        loading,
        fetchCurrentUser,
        finishChangePassword,
        verifyAuth,
        isAuthenticated: !!token,
        forceChangePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
