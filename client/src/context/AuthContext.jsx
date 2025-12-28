import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['x-auth-token'] = token;
      checkUser();
    } else {
      setLoading(false);
    }
  }, []);

  const checkUser = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/auth/me`);
      setUser(res.data);
    } catch (err) {
      console.error(err);
      localStorage.removeItem('token');
      delete axios.defaults.headers.common['x-auth-token'];
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const res = await axios.post(`${API_URL}/api/auth/login`, { email, password });
    localStorage.setItem('token', res.data.token);
    axios.defaults.headers.common['x-auth-token'] = res.data.token;
    setUser(res.data.user);
    return res.data.user;
  };

  const register = async (userData) => {
    const res = await axios.post(`${API_URL}/api/auth/register`, userData);
    localStorage.setItem('token', res.data.token);
    axios.defaults.headers.common['x-auth-token'] = res.data.token;
    setUser(res.data.user);
    return res.data.user;
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['x-auth-token'];
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
