import { useMemo } from 'react';
import { useAlumnos } from './useAlumnos';
import { useQuery, invalidate } from './useFirestoreCache';
import { deudasService } from '../services/deudasService';
import { PRECIO_MENSUALIDAD, formatDateLima } from '../config/businessRules';

export const useDeudasDeAlumno = (alumnoId) => {
  const q = useQuery(`deudas:alumno:${alumnoId}`, () => deudasService.porAlumno(alumnoId), [alumnoId]);
  return { deudas: q.data ?? [], loading: q.loading, error: q.error };
};

export const mutarDeudas = {
  crear:        async (data) => { const r = await deudasService.crear(data); invalidate('deudas:pendientes'); return r; },
  marcarPagada: async (id) => { const r = await deudasService.marcarPagada(id); invalidate('deudas:pendientes'); return r; },
  reabrir:      async (id) => { const r = await deudasService.reabrir(id); invalidate('deudas:pendientes'); return r; },
  eliminar:     async (id) => { const r = await deudasService.eliminar(id); invalidate('deudas:pendientes'); return r; },
};

/**
 * Cálculo unificado de morosidad: mensualidad vencida + deudas extra.
 * Centraliza la lógica que vivía duplicada en Dashboard, DetalleAlumno y VerPagos.
 */
export const useDeudores = () => {
  const { alumnos, loading: lA } = useAlumnos();
  const { data: deudas, loading: lD } = useQuery('deudas:pendientes', deudasService.pendientes);

  const { iso: hoyIso } = formatDateLima();

  const resumen = useMemo(() => {
    if (lA || lD) return null;

    const mapa = {};
    let total = 0;
    let facturas = 0;

    alumnos.forEach((a) => {
      const venc = a.vencimientoMensualidad || '2000-01-01';
      if (hoyIso >= venc) {
        const nombre = `${a.nombre} ${a.apellido}`;
        mapa[nombre] = (mapa[nombre] || 0) + PRECIO_MENSUALIDAD;
        total += PRECIO_MENSUALIDAD;
        facturas += 1;
      }
    });

    (deudas ?? []).forEach((d) => {
      const nombre = d.alumnoNombre || 'Desconocido';
      const monto  = Number(d.monto) || 0;
      mapa[nombre] = (mapa[nombre] || 0) + monto;
      total += monto;
      facturas += 1;
    });

    const top5 = Object.entries(mapa)
      .map(([nombre, monto]) => ({ nombre, monto }))
      .sort((a, b) => b.monto - a.monto)
      .slice(0, 5);

    return { total, facturas, top5, mapa };
  }, [alumnos, deudas, lA, lD, hoyIso]);

  return { resumen, loading: lA || lD };
};
