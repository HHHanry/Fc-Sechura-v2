/**
 * FASE 3 — Hook de competencias por posición.
 */
import { useQuery, invalidatePrefix } from './useFirestoreCache';
import { competenciasService } from '../services/competenciasService';

const KEY = 'competencias_jugador';

export const useCompetenciasDeAlumno = (alumnoId) => {
  const q = useQuery(
    `${KEY}:${alumnoId ?? '__none__'}`,
    () => (alumnoId ? competenciasService.obtener(alumnoId) : Promise.resolve(null)),
    [alumnoId],
  );
  return { competencias: q.data ?? null, loading: q.loading, error: q.error, refetch: q.refetch };
};

export const mutarCompetencias = {
  guardar: async (alumnoId, data) => {
    const r = await competenciasService.guardar(alumnoId, data);
    invalidatePrefix(KEY);
    return r;
  },
};
