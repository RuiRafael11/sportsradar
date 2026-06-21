import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../config/env';

const REQUEST_TIMEOUT_MS = 15000;
const isDev = typeof __DEV__ !== 'undefined' && __DEV__;

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: REQUEST_TIMEOUT_MS,
});

export function getApiErrorMessage(error, fallback = 'Nao foi possivel contactar o servidor.') {
  if (error?.response?.data?.msg) return error.response.data.msg;
  if (error?.code === 'ECONNABORTED') {
    return 'O pedido demorou demasiado tempo. Confirma a ligacao e tenta novamente.';
  }
  if (error?.request && !error?.response) {
    return `Nao foi possivel chegar a API em ${API_BASE_URL}. Confirma o endereco e a rede.`;
  }
  return error?.message || fallback;
}

if (isDev) {
  console.log('[API] base URL configured:', API_BASE_URL);
}

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    error.userMessage = getApiErrorMessage(error);
    return Promise.reject(error);
  }
);
