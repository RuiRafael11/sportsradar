import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { loginRequest, registerRequest, meRequest } from '../services/auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [booting, setBooting] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        if (token) {
          const me = await meRequest();
          setUser(me);
        }
      } catch (_) {}
      setBooting(false);
    })();
  }, []);

  const login = async (email, password) => {
    const { token, user } = await loginRequest(email, password);
    await AsyncStorage.setItem('token', token);
    setUser(user);
  };

  const register = async (name, email, password) => {
    const { token, user } = await registerRequest(name, email, password);
    await AsyncStorage.setItem('token', token);
    setUser(user);
  };

  const logout = async () => {
    await AsyncStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, booting, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
