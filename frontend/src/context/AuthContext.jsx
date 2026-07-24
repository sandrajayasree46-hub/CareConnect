import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('cc-token'));
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('cc-user');
    if (!saved) return null;
    try {
      return JSON.parse(saved);
    } catch {
      localStorage.removeItem('cc-user');
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  // On mount or token change, validate token by fetching profile
  useEffect(() => {
    let isMounted = true;
    if (token) {
      api.get('/profile')
        .then(res => {
          if (!isMounted) return;
          const freshUser = res.data.data;
          setUser(freshUser);
          localStorage.setItem('cc-user', JSON.stringify(freshUser));
        })
        .catch(() => {
          if (!isMounted) return;
          localStorage.removeItem('cc-token');
          localStorage.removeItem('cc-user');
          setToken(null);
          setUser(null);
        })
        .finally(() => {
          if (isMounted) setLoading(false);
        });
    } else {
      localStorage.removeItem('cc-user');
      setUser(null);
      setLoading(false);
    }
    return () => { isMounted = false; };
  }, [token]);

  const login = (userData, userToken) => {
    localStorage.setItem('cc-token', userToken);
    localStorage.setItem('cc-user', JSON.stringify(userData));
    setToken(userToken);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('cc-token');
    localStorage.removeItem('cc-user');
    setToken(null);
    setUser(null);
  };

  const updateUser = (updated) => {
    setUser(prev => {
      const merged = { ...prev, ...updated };
      localStorage.setItem('cc-user', JSON.stringify(merged));
      return merged;
    });
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
