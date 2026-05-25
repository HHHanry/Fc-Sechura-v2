/**
 * FASE 4 — Hook de cantera y proyección.
 */
import { useQuery, invalidatePrefix } from './useFirestoreCache';
import { canteraService } from '../services/canteraService';

const KEY = 'cantera_proyeccion';

export const useCanteraDeAlumno = (alumnoId) => {
  const q = useQuery(
    `${KEY}:${alumnoId ?? '__none__'}`,
    () => (alumnoId ? canteraService.obtener(alumnoId) : Promise.resolve(null)),
    [alumnoId],
  );
  return { cantera: q.data ?? null, loading: q.loading, error: q.error, refetch: q.refetch };
};

export const useCanteraAll = () => {
  const q = useQuery(`${KEY}:all`, () => canteraService.listarTodos());
  return { registros: q.data ?? [], loading: q.loading, error: q.error, refetch: q.refetch };
};

export const mutarCantera = {
  guardar: async (alumnoId, data) => {
    const r = await canteraService.guardar(alumnoId, data);
    invalidatePrefix(KEY);
    return r;
  },
};
