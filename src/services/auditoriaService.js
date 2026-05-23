/**
 * FASE 8 — Auditoría básica.
 *
 * Helper único: `log(accion, payload, actor)`.
 * Llamar desde cualquier servicio crítico (anular recibo, eliminar alumno, etc.).
 *
 * Colección: `auditoria`
 * Schema:
 *   { accion, payload, actorId, actorNombre, actorRol, createdAt }
 */
import { create, list, orderBy, limit, where } from './firestoreClient';

const PATH = 'auditoria';

export const auditoriaService = {
  /**
   * Registra una acción. Nunca lanza — la auditoría no debe romper el flujo de negocio.
   * @param {string} accion - usar ACCIONES_AUDITABLES de businessRules.
   * @param {object} payload - datos relevantes (ids, importes, motivo).
   * @param {object} actor - { uid, nombre, rol } del usuario logueado.
   */
  log: async (accion, payload = {}, actor = {}) => {
    try {
      await create(PATH, {
        accion,
        payload,
        actorId:     actor.uid     ?? null,
        actorNombre: actor.nombre  ?? null,
        actorRol:    actor.rol     ?? null,
      });
    } catch (err) {
      // No relanzamos: si falla la auditoría no debe abortar la acción de negocio.
      if (typeof console !== 'undefined') console.warn('[auditoria] log fail:', err);
    }
  },

  listarRecientes: (n = 100) =>
    list(PATH, orderBy('createdAt', 'desc'), limit(n)),

  listarPorAccion: (accion, n = 100) =>
    list(PATH, where('accion', '==', accion), orderBy('createdAt', 'desc'), limit(n)),
};
