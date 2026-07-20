import { createContext, useContext, useEffect, useState } from 'react';
import api from '../api/client.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On mount, restore session if a token exists.
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }
    api
      .get('/auth/me')
      .then((res) => setUser(res.data.user))
      .catch(() => {
        localStorage.removeItem('token');
      })
      .finally(() => setLoading(false));
  }, []);

  const persist = (token, user) => {
    localStorage.setItem('token', token);
    setUser(user);
  };

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    persist(data.token, data.user);
    return data.user;
  };

  const signup = async (username, email, password) => {
    // No auto-login: the account must be verified via email first.
    const { data } = await api.post('/auth/signup', { username, email, password });
    return data; // { message, email }
  };

  const verifyEmail = async (token) => {
    const { data } = await api.post('/auth/verify-email', { token });
    persist(data.token, data.user);
    return data.user;
  };

  const resendVerification = async (email) => {
    const { data } = await api.post('/auth/resend-verification', { email });
    return data.message;
  };

  const forgotPassword = async (email) => {
    const { data } = await api.post('/auth/forgot-password', { email });
    return data.message;
  };

  const resetPassword = async (token, password) => {
    const { data } = await api.post('/auth/reset-password', { token, password });
    return data.message;
  };

  const logout = async () => {
    // Best-effort server-side invalidation of the refresh token.
    try {
      await api.post('/auth/logout');
    } catch {
      // Ignore network/errors — clear local state regardless.
    }
    localStorage.removeItem('token');
    setUser(null);
  };

  const updateUser = (u) => setUser(u);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        signup,
        logout,
        updateUser,
        verifyEmail,
        resendVerification,
        forgotPassword,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
