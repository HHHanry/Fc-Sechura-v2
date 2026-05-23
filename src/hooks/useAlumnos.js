import { useQuery, invalidatePrefix } from './useFirestoreCache';
import { alumnosService } from '../services/alumnosService';

const KEY = 'alumnos';

export const useAlumnos = () => {
  const q = useQuery(KEY, alumnosService.listar);
  return {
    alumnos: q.data ?? [],
    loading: q.loading,
    error:   q.error,
    refetch: q.refetch,
  };
};

export const useAlumno = (id) => {
  const q = useQuery(`${KEY}:${id ?? 'none'}`, () => (
    id ? alumnosService.obtener(id) : Promise.resolve(null)
  ), [id]);
  return { alumno: q.data, loading: q.loading, error: q.error, refetch: q.refetch };
};

export const mutarAlumnos = {
  reservarId: () => alumnosService.reservarId(),
  crear:      async (data) => { const r = await alumnosService.crear(data); invalidatePrefix(KEY); return r; },
  crearConId: async (id, data) => { const r = await alumnosService.crearConId(id, data); invalidatePrefix(KEY); return r; },
  actualizar: async (id, data) => { const r = await alumnosService.actualizar(id, data); invalidatePrefix(KEY); return r; },
  eliminar:   async (id) => { const r = await alumnosService.eliminar(id); invalidatePrefix(KEY); return r; },
};
