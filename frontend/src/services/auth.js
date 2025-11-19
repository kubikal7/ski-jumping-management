import api from './api';
import { jwtDecode } from 'jwt-decode';

const TOKEN_KEY = 'app_token';
const OLD_PASSWORD_KEY = 'old_password_temp';

export async function login(loginRequest) {
  const resp = await api.post('/auth/login', loginRequest);
  return resp.data;
}

export function saveToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function clearAuth() {
  localStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(OLD_PASSWORD_KEY);
}

export function decodeToken(token = getToken()) {
  if (!token) return null;
  try {
    return jwtDecode(token);
  } catch (e) {
    return null;
  }
}

export function saveOldPassword(pwd) {
  sessionStorage.setItem(OLD_PASSWORD_KEY, pwd);
}

export function getOldPassword() {
  return sessionStorage.getItem(OLD_PASSWORD_KEY);
}
