import { useQuery, invalidatePrefix } from './useFirestoreCache';
import { tacticasService } from '../services/tacticasService';

const KEY = 'tacticas';

export const useTacticas = () => {
  const q = useQuery(KEY, tacticasService.listar);
  return { tacticas: q.data ?? [], loading: q.loading, error: q.error, refetch: q.refetch };
};

export const mutarTacticas = {
  guardar:  async (data) => { const r = await tacticasService.guardar(data); invalidatePrefix(KEY); return r; },
  eliminar: async (id) => { const r = await tacticasService.eliminar(id); invalidatePrefix(KEY); return r; },
};
