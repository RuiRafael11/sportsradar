import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// teu backend local
const baseURL = 'http://192.168.1.5:5000/api';

export const api = axios.create({ baseURL });

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
