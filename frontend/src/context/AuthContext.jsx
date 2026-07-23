import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('cc-token'));
  const [loading, setLoading] = useState(true);

  // On mount, if token exists, validate it by fetching profile
  useEffect(() => {
    if (token) {
      api.get('/profile')
        .then(res => setUser(res.data.data))
        .catch(() => {
          localStorage.removeItem('cc-token');
          setToken(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = (userData, userToken) => {
    localStorage.setItem('cc-token', userToken);
    setToken(userToken);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('cc-token');
    setToken(null);
    setUser(null);
  };

  const updateUser = (updated) => setUser(prev => ({ ...prev, ...updated }));

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
