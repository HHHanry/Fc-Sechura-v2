import { useQuery, invalidatePrefix } from './useFirestoreCache';
import { asistenciaService } from '../services/asistenciaService';

const KEY = 'asistencias';

export const useAsistenciaHoy = (fechaDmy) => {
  const q = useQuery(`${KEY}:dia:${fechaDmy}`, () => asistenciaService.delDia(fechaDmy), [fechaDmy]);
  return { asistencias: q.data ?? [], loading: q.loading, error: q.error, refetch: q.refetch };
};

/** Recibe ISO YYYY-MM-DD y consulta por la representación DMY de Firestore. */
export const useAsistenciaPorFecha = (fechaIso) => {
  const dmy = fechaIso ? fechaIso.split('-').reverse().join('/') : '';
  const q = useQuery(`${KEY}:dia:${dmy}`, () => asistenciaService.delDia(dmy), [dmy]);
  return { asistencias: q.data ?? [], loading: q.loading, error: q.error, refetch: q.refetch };
};

export const useAsistenciaDeAlumno = (alumnoId) => {
  const q = useQuery(`${KEY}:alumno:${alumnoId ?? 'none'}`, () => (
    alumnoId ? asistenciaService.porAlumno(alumnoId) : Promise.resolve([])
  ), [alumnoId]);
  return { asistencias: q.data ?? [], loading: q.loading, error: q.error };
};

export const mutarAsistencia = {
  registrar:  async (data) => { const r = await asistenciaService.registrar(data); invalidatePrefix(KEY); return r; },
  actualizar: async (id, data) => { const r = await asistenciaService.actualizar(id, data); invalidatePrefix(KEY); return r; },
  eliminar:   async (id) => { const r = await asistenciaService.eliminar(id); invalidatePrefix(KEY); return r; },
};
