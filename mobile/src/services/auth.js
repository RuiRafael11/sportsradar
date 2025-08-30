import { api } from './api';

export async function loginRequest(email, password) {
  const { data } = await api.post('/auth/login', { email, password });
  return data; // { token, user }
}

export async function registerRequest(name, email, password) {
  const { data } = await api.post('/auth/register', { name, email, password });
  return data; // { token, user }
}

export async function meRequest() {
  const { data } = await api.get('/auth/me');
  return data; // user
}
