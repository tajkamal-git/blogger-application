import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import './Toast.css';

const ToastContext = createContext(null);

const ICONS = { success:'✅', error:'❌', info:'ℹ️', warning:'⚠️' };

let _id = 0;

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const timers = useRef({});

  const dismiss = useCallback((id) => {
    setToasts(prev => prev.map(t => t.id === id ? { ...t, closing: true } : t));
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 280);
  }, []);

  const toast = useCallback((msg, type = 'info', title = '', duration = 3500) => {
    const id = ++_id;
    setToasts(prev => [...prev, { id, msg, type, title: title || { success:'Success', error:'Error', info:'Info', warning:'Warning' }[type], closing: false }]);
    timers.current[id] = setTimeout(() => dismiss(id), duration);
    return id;
  }, [dismiss]);

  const success = useCallback((msg, title) => toast(msg, 'success', title), [toast]);
  const error   = useCallback((msg, title) => toast(msg, 'error',   title), [toast]);
  const info    = useCallback((msg, title) => toast(msg, 'info',    title), [toast]);
  const warning = useCallback((msg, title) => toast(msg, 'warning', title), [toast]);

  return (
    <ToastContext.Provider value={{ toast, success, error, info, warning }}>
      {children}
      <div className="toast-container">
        {toasts.map(t => (
          <div key={t.id} className={`toast toast--${t.type}${t.closing ? ' closing' : ''}`}>
            <span className="toast__icon">{ICONS[t.type]}</span>
            <div className="toast__body">
              <div className="toast__title">{t.title}</div>
              {t.msg && <div className="toast__msg">{t.msg}</div>}
            </div>
            <button className="toast__close" onClick={() => dismiss(t.id)}>×</button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
};
