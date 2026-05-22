import { useQuery, invalidate } from './useFirestoreCache';
import { convocatoriasService } from '../services/convocatoriasService';

const KEY = 'convocatorias';

export const useConvocatorias = (n = 20) => {
  const q = useQuery(`${KEY}:${n}`, () => convocatoriasService.listar(n), [n]);
  return { convocatorias: q.data ?? [], loading: q.loading, error: q.error, refetch: q.refetch };
};

export const mutarConvocatorias = {
  crear:      async (data) => { const r = await convocatoriasService.crear(data); invalidate(`${KEY}:20`); return r; },
  actualizar: async (id, data) => { const r = await convocatoriasService.actualizar(id, data); invalidate(`${KEY}:20`); return r; },
};
