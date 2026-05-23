/**
 * Caché en módulo + suscriptores para hooks.
 * - Una sola fuente de verdad por colección.
 * - Cualquier mutación dispara `invalidate(coleccion)` y todos los hooks suscritos refetchean.
 * - No es React Query: es deliberadamente mínimo (~80 LOC) para no añadir dependencias.
 */
import { useEffect, useRef, useState, useCallback } from 'react';

const cache = new Map();        // key -> { data, timestamp }
const subscribers = new Map();  // key -> Set<setter>

export const invalidate = (key) => {
  cache.delete(key);
  subscribers.get(key)?.forEach((setter) => setter((n) => n + 1));
};

const matchesPrefix = (key, prefix) => key === prefix || key.startsWith(`${prefix}:`);

const knownKeys = () => new Set([...cache.keys(), ...subscribers.keys()]);

export const invalidatePrefix = (prefix) => {
  knownKeys().forEach((key) => {
    if (!matchesPrefix(key, prefix)) return;
    invalidate(key);
  });
};

export const invalidateMany = (keysOrPrefixes = []) => {
  keysOrPrefixes.forEach((key) => invalidatePrefix(key));
};

export const invalidateAll = () => {
  cache.clear();
  subscribers.forEach((set) => set.forEach((setter) => setter((n) => n + 1)));
};

const subscribe = (key, setter) => {
  if (!subscribers.has(key)) subscribers.set(key, new Set());
  subscribers.get(key).add(setter);
  return () => subscribers.get(key)?.delete(setter);
};

/**
 * useQuery — ejecuta `fetcher` y cachea por `key`.
 * @param {string} key       Identificador estable de la consulta.
 * @param {Function} fetcher Async () => data.
 * @param {Array}  deps      Si cambian, reejecuta.
 */
export const useQuery = (key, fetcher, deps = []) => {
  const [data, setData] = useState(() => cache.get(key)?.data ?? null);
  const [loading, setLoading] = useState(() => !cache.has(key));
  const [error, setError] = useState(null);
  const [bumpCount, setBumpCount] = useState(0);
  const mounted = useRef(false);

  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);

  useEffect(() => subscribe(key, setBumpCount), [key]);

  const run = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const fresh = await fetcher();
      if (!mounted.current) return;
      cache.set(key, { data: fresh, timestamp: Date.now() });
      setData(fresh);
    } catch (e) {
      if (mounted.current) setError(e);
    } finally {
      if (mounted.current) setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, ...deps]);

  useEffect(() => {
    const cached = cache.get(key);
    if (cached && bumpCount === 0) {
      setData(cached.data);
      setLoading(false);
      return;
    }
    run();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, bumpCount, ...deps]);

  return { data, loading, error, refetch: run };
};
