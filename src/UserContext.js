import React, { createContext, useContext, useState, useEffect } from 'react';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [userEmail, setUserEmail] = useState('');
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('userEmail');
    if (stored) setUserEmail(stored);
    const dm = localStorage.getItem('darkMode') === 'true';
    setDarkMode(dm);
    document.documentElement.setAttribute('data-theme', dm ? 'dark' : 'light');
  }, []);

  const setUser = (email) => {
    setUserEmail(email);
    localStorage.setItem('userEmail', email);
  };

  const logout = () => {
    setUserEmail('');
    localStorage.removeItem('userEmail');
  };

  const toggleDarkMode = () => {
    const next = !darkMode;
    setDarkMode(next);
    localStorage.setItem('darkMode', next);
    document.documentElement.setAttribute('data-theme', next ? 'dark' : 'light');
  };

  return (
    <UserContext.Provider value={{ userEmail, setUser, logout, darkMode, toggleDarkMode }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error('useUser must be used within UserProvider');
  return ctx;
};
