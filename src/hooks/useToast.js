/**
 * Sistema de toasts global. Reemplaza alert() y window.confirm() en toda la app.
 * Patrón: store mínimo + hook de suscripción + helpers.
 */
import { useEffect, useState } from 'react';

let counter = 0;
const listeners = new Set();
let toasts = [];

const emit = () => listeners.forEach((cb) => cb([...toasts]));

const push = (toast) => {
  const id = ++counter;
  const t = { id, duration: 4000, variant: 'info', ...toast };
  toasts = [...toasts, t];
  emit();
  if (t.duration > 0) setTimeout(() => dismiss(id), t.duration);
  return id;
};

const dismiss = (id) => {
  toasts = toasts.filter((t) => t.id !== id);
  emit();
};

export const toast = {
  show:    (msg, opts = {}) => push({ message: msg, ...opts }),
  success: (msg, opts = {}) => push({ message: msg, variant: 'success', ...opts }),
  error:   (msg, opts = {}) => push({ message: msg, variant: 'error', duration: 6000, ...opts }),
  warn:    (msg, opts = {}) => push({ message: msg, variant: 'warn', ...opts }),
  info:    (msg, opts = {}) => push({ message: msg, variant: 'info', ...opts }),
  dismiss,
};

export const useToasts = () => {
  const [snapshot, setSnapshot] = useState(toasts);
  useEffect(() => {
    listeners.add(setSnapshot);
    return () => listeners.delete(setSnapshot);
  }, []);
  return snapshot;
};
