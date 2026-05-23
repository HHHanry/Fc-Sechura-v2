import { useQuery, invalidatePrefix } from './useFirestoreCache';
import { pagosService } from '../services/pagosService';

const KEY = 'pagos';

export const useUltimosPagos = (n = 10) => {
  const q = useQuery(`${KEY}:ultimos:${n}`, () => pagosService.ultimos(n), [n]);
  return { pagos: q.data ?? [], loading: q.loading, error: q.error, refetch: q.refetch };
};

export const usePagos = () => {
  const q = useQuery(`${KEY}:todos`, pagosService.listar);
  return { pagos: q.data ?? [], loading: q.loading, error: q.error, refetch: q.refetch };
};

export const usePagosDelMes = (yyyymm) => {
  const q = useQuery(`${KEY}:mes:${yyyymm}`, () => pagosService.completadosDelMes(yyyymm), [yyyymm]);
  return { pagos: q.data ?? [], loading: q.loading, error: q.error };
};

export const usePagosDeAlumno = (alumnoId) => {
  const q = useQuery(`${KEY}:alumno:${alumnoId ?? 'none'}`, () => (
    alumnoId ? pagosService.porAlumno(alumnoId) : Promise.resolve([])
  ), [alumnoId]);
  return { pagos: q.data ?? [], loading: q.loading, error: q.error };
};

export const mutarPagos = {
  registrar:  async (data) => { const r = await pagosService.registrar(data); invalidatePrefix(KEY); return r; },
  actualizar: async (id, data) => { const r = await pagosService.actualizar(id, data); invalidatePrefix(KEY); return r; },
  anular:     async (id) => { const r = await pagosService.anular(id);        invalidatePrefix(KEY); return r; },
  eliminar:   async (id) => { const r = await pagosService.eliminar(id);      invalidatePrefix(KEY); return r; },
};
